import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { PublicImageApiKey } from "./image-keys.server";

export type { PublicImageApiKey } from "./image-keys.server";

export const IMAGE_PROVIDER_OPTIONS = [
  { value: "openai", label: "OpenAI (gpt-image-1)" },
  { value: "gemini", label: "Google Gemini" },
  { value: "lovable", label: "Lovable AI Gateway" },
] as const;

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (data !== true) throw new Error("Acesso restrito a administradores");
}

export const listImageApiKeysFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PublicImageApiKey[]> => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { toPublicKey } = await import("./image-keys.server");
    const { data, error } = await supabaseAdmin
      .from("image_api_keys")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => toPublicKey(row as any));
  });

export const createImageApiKeyFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { label: string; provider: string; apiKey: string; model?: string }) =>
    z
      .object({
        label: z.string().trim().min(2).max(60),
        provider: z.enum(["openai", "gemini", "lovable"]),
        apiKey: z.string().trim().min(10).max(500),
        model: z.string().trim().max(80).optional(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { MAX_IMAGE_API_KEYS } = await import("./image-keys.server");

    const { count, error: countError } = await supabaseAdmin
      .from("image_api_keys")
      .select("id", { count: "exact", head: true });
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) >= MAX_IMAGE_API_KEYS) {
      throw new Error(`Limite de ${MAX_IMAGE_API_KEYS} APIs cadastradas atingido.`);
    }

    const { error } = await supabaseAdmin.from("image_api_keys").insert({
      label: data.label,
      provider: data.provider,
      api_key: data.apiKey,
      model: data.model || null,
      position: count ?? 0,
      status: "active",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateImageApiKeyFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id: string;
      label?: string;
      provider?: string;
      apiKey?: string;
      model?: string | null;
      position?: number;
      status?: string;
    }) =>
      z
        .object({
          id: z.string().uuid(),
          label: z.string().trim().min(2).max(60).optional(),
          provider: z.enum(["openai", "gemini", "lovable"]).optional(),
          apiKey: z.string().trim().min(10).max(500).optional(),
          model: z.string().trim().max(80).nullable().optional(),
          position: z.number().int().min(0).max(100).optional(),
          status: z.enum(["active", "exhausted", "disabled"]).optional(),
        })
        .parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (data.label !== undefined) patch['label'] = data.label;
    if (data.provider !== undefined) patch['provider'] = data.provider;
    if (data.apiKey !== undefined) patch['api_key'] = data.apiKey;
    if (data.model !== undefined) patch['model'] = data.model || null;
    if (data.position !== undefined) patch['position'] = data.position;
    if (data.status !== undefined) {
      patch['status'] = data.status;
      if (data.status === "active") patch['last_error'] = null;
    }

    const { error } = await supabaseAdmin.from("image_api_keys").update(patch as never).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteImageApiKeyFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("image_api_keys").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
