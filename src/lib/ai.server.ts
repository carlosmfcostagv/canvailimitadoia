// Server-side generation logic backed by the Lovable AI gateway.
// NOTE: server functions run on stateless workers, so nothing may be kept
// in module memory between requests — every generation resolves synchronously.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

function apiKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Serviço de IA não configurado.");
  return key;
}

async function callGateway(body: Record<string, unknown>) {
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.status === 429) throw new Error("Limite de uso atingido. Tente novamente em instantes.");
  if (res.status === 402) throw new Error("Créditos de IA esgotados no workspace.");
  if (!res.ok) {
    const text = await res.text();
    console.error("AI gateway error", res.status, text);
    throw new Error("Falha ao gerar. Tente novamente.");
  }
  return res.json() as Promise<any>;
}

async function textCompletion(system: string, user: string) {
  const json = await callGateway({
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return (json?.choices?.[0]?.message?.content ?? "").trim();
}

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function sizeFor(aspectRatio?: string) {
  if (aspectRatio === "16:9") return "1536x1024";
  if (aspectRatio === "9:16") return "1024x1536";
  return "1024x1024";
}

export const AIProviderService = {
  async generateImage(params: { prompt: string; settings?: any }) {
    const s = params.settings ?? {};
    const styleHints = [s.style, s.aspectRatio, s.model].filter(Boolean).join(", ");
    const prompt = styleHints ? `${params.prompt}. Style: ${styleHints}` : params.prompt;

    // Images always come from the API keys registered in Administração.
    const { generateImageWithPool } = await import("./image-keys.server");
    const url = await generateImageWithPool(prompt, sizeFor(s.aspectRatio));

    return {
      id: newId(),
      type: "image",
      status: "completed",
      url,
      prompt: params.prompt,
      settings: s,
      date: new Date().toISOString(),
      progress: 100,
    };
  },

  async generateVideo(_params: { prompt: string; settings?: any }) {
    throw new Error(
      "A geração de vídeo ainda não está disponível: nenhum provedor de vídeo foi conectado. Seus créditos não foram debitados.",
    );
  },

  async getStatus(_id: string) {
    // Generations complete synchronously; nothing to poll.
    return null;
  },

  async enhancePrompt(prompt: string) {
    const enhanced = await textCompletion(
      "You rewrite short ideas into rich, professional generation prompts. Cover subject, action, motion, environment, lighting, camera movement, cinematic style, composition and quality. Answer with the prompt only, no preamble, max 120 words.",
      prompt,
    );
    return enhanced || prompt;
  },

  async generateStructuredPrompt(idea: string) {
    const raw = await textCompletion(
      'You are a prompt engineer. Reply with ONLY valid JSON, no markdown fences, with keys: mainPrompt, style, mood, environment, lighting, motion, camera, quality, negativePrompt. Values are short English strings.',
      idea,
    );
    try {
      return JSON.parse(raw.replace(/^```(?:json)?|```$/g, "").trim());
    } catch {
      return {
        mainPrompt: raw || `A professional cinematic visualization of ${idea}`,
        style: "Cinematic, Photorealistic",
        mood: "Dramatic",
        environment: "-",
        lighting: "Volumetric, high contrast",
        motion: "Smooth",
        camera: "Wide angle",
        quality: "8k, highly detailed",
        negativePrompt: "low quality, blurry, distorted, watermark",
      };
    }
  },
};
