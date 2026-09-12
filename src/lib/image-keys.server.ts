// Server-only: pool of image-generation API keys registered by the admin.
// Keys are stored in the database and never exposed to the browser.

export type ImageApiKeyRow = {
  id: string;
  label: string;
  provider: string;
  api_key: string;
  model: string | null;
  position: number;
  status: string;
  last_error: string | null;
  last_used_at: string | null;
};

export type PublicImageApiKey = Omit<ImageApiKeyRow, "api_key"> & { masked_key: string };

export const MAX_IMAGE_API_KEYS = 20;

export const IMAGE_PROVIDERS = ["openai", "gemini", "lovable"] as const;
export type ImageProvider = (typeof IMAGE_PROVIDERS)[number];

export function maskKey(key: string) {
  if (key.length <= 8) return "••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

export function toPublicKey(row: ImageApiKeyRow): PublicImageApiKey {
  const { api_key, ...rest } = row;
  return { ...rest, masked_key: maskKey(api_key) };
}

class KeyExhausted extends Error {}

function isExhaustedStatus(status: number) {
  return status === 401 || status === 402 || status === 403 || status === 429;
}

async function generateWithOpenAI(key: ImageApiKeyRow, prompt: string, size: string) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key.api_key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: key.model || "gpt-image-1", prompt, size, n: 1 }),
  });
  const text = await res.text();
  if (!res.ok) {
    if (isExhaustedStatus(res.status) || text.includes("insufficient_quota")) {
      throw new KeyExhausted(`HTTP ${res.status}`);
    }
    throw new Error(`Falha do provedor (${res.status}).`);
  }
  const json = JSON.parse(text);
  const b64 = json?.data?.[0]?.b64_json;
  const url = json?.data?.[0]?.url;
  if (b64) return `data:image/png;base64,${b64}`;
  if (url) return url as string;
  throw new Error("O provedor não retornou nenhuma imagem.");
}

async function generateWithGemini(key: ImageApiKeyRow, prompt: string) {
  const model = key.model || "gemini-2.5-flash-image";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": key.api_key, "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    if (isExhaustedStatus(res.status) || text.includes("RESOURCE_EXHAUSTED")) {
      throw new KeyExhausted(`HTTP ${res.status}`);
    }
    throw new Error(`Falha do provedor (${res.status}).`);
  }
  const json = JSON.parse(text);
  const parts: any[] = json?.candidates?.[0]?.content?.parts ?? [];
  const inline = parts.find((p) => p?.inlineData?.data || p?.inline_data?.data);
  const data = inline?.inlineData?.data ?? inline?.inline_data?.data;
  const mime = inline?.inlineData?.mimeType ?? inline?.inline_data?.mime_type ?? "image/png";
  if (!data) throw new Error("O provedor não retornou nenhuma imagem.");
  return `data:${mime};base64,${data}`;
}

async function generateWithLovable(key: ImageApiKeyRow, prompt: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key.api_key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: key.model || "google/gemini-2.5-flash-image",
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    if (isExhaustedStatus(res.status)) throw new KeyExhausted(`HTTP ${res.status}`);
    throw new Error(`Falha do provedor (${res.status}).`);
  }
  const json = JSON.parse(text);
  const url = json?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) throw new Error("O provedor não retornou nenhuma imagem.");
  return url as string;
}

/**
 * Runs through the registered keys in order. A key that reports no remaining
 * quota is flagged `exhausted` and the next key is used automatically.
 */
export async function generateImageWithPool(prompt: string, size: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("image_api_keys")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  const keys = ((data ?? []) as ImageApiKeyRow[]).filter((k) => k.status === "active");
  if (keys.length === 0) {
    throw new Error(
      "Nenhuma API de geração de imagem disponível. Cadastre uma chave em Administração.",
    );
  }

  let lastMessage = "Nenhuma API conseguiu gerar a imagem.";

  for (const key of keys) {
    try {
      let url: string;
      if (key.provider === "openai") url = await generateWithOpenAI(key, prompt, size);
      else if (key.provider === "gemini") url = await generateWithGemini(key, prompt);
      else url = await generateWithLovable(key, prompt);

      await supabaseAdmin
        .from("image_api_keys")
        .update({ last_used_at: new Date().toISOString(), last_error: null })
        .eq("id", key.id);

      return url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      lastMessage = message;
      if (err instanceof KeyExhausted) {
        await supabaseAdmin
          .from("image_api_keys")
          .update({
            status: "exhausted",
            last_error: `Sem créditos ou chave inválida (${message})`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", key.id);
        continue;
      }
      await supabaseAdmin
        .from("image_api_keys")
        .update({ last_error: message, updated_at: new Date().toISOString() })
        .eq("id", key.id);
      continue;
    }
  }

  throw new Error(`Todas as APIs cadastradas falharam. Último erro: ${lastMessage}`);
}
