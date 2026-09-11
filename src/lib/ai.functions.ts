import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AIProviderService } from "./ai.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AuthedContext = {
  supabase: any;
  userId: string;
};

async function ensureBalance(context: AuthedContext, operation: string) {
  const { supabase, userId } = context;
  await supabase.rpc("bootstrap_user");

  const [{ data: cost, error: costError }, { data: profile, error: profileError }] =
    await Promise.all([
      supabase.from("generation_costs").select("credits").eq("operation", operation).maybeSingle(),
      supabase.from("profiles").select("credits").eq("id", userId).maybeSingle(),
    ]);

  if (costError) throw new Error(costError.message);
  if (profileError) throw new Error(profileError.message);

  const needed = cost?.credits ?? 0;
  const balance = profile?.credits ?? 0;
  if (balance < needed) {
    throw new Error(`Créditos insuficientes. Esta geração custa ${needed} créditos.`);
  }
  return needed;
}

async function chargeCredits(context: AuthedContext, operation: string) {
  const { error } = await context.supabase.rpc("consume_credits", { _operation: operation });
  if (error) throw new Error(error.message);
}

export const enhancePromptFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { prompt: string }) => z.object({ prompt: z.string() }).parse(data))
  .handler(async ({ data }) => {
    return AIProviderService.enhancePrompt(data.prompt);
  });

export const generateImageFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { prompt: string; settings: any }) =>
    z.object({ prompt: z.string(), settings: z.any() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await ensureBalance(context as AuthedContext, "image");
    const result = await AIProviderService.generateImage(data);
    await chargeCredits(context as AuthedContext, "image");
    return result as any;
  });

export const generateVideoFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { prompt: string; settings: any }) =>
    z.object({ prompt: z.string(), settings: z.any() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const operation = data.settings?.type === "i2v" ? "i2v" : "video";
    await ensureBalance(context as AuthedContext, operation);
    const result = await AIProviderService.generateVideo(data);
    await chargeCredits(context as AuthedContext, operation);
    return result as any;
  });

export const generateStructuredPromptFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { idea: string }) => z.object({ idea: z.string() }).parse(data))
  .handler(async ({ data }) => {
    return AIProviderService.generateStructuredPrompt(data.idea);
  });

export const getGenerationStatusFn = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    return AIProviderService.getStatus(data.id);
  });
