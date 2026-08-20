import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AIProviderService } from "./ai.server";

export const enhancePromptFn = createServerFn({ method: "POST" })
  .input(z.object({ prompt: z.string() }))
  .handler(async ({ data }) => {
    return AIProviderService.enhancePrompt(data.prompt);
  });

export const generateImageFn = createServerFn({ method: "POST" })
  .input(z.object({ prompt: z.string(), settings: z.any() }))
  .handler(async ({ data }) => {
    return AIProviderService.generateImage(data);
  });

export const generateVideoFn = createServerFn({ method: "POST" })
  .input(z.object({ prompt: z.string(), settings: z.any() }))
  .handler(async ({ data }) => {
    return AIProviderService.generateVideo(data);
  });

export const generateStructuredPromptFn = createServerFn({ method: "POST" })
  .input(z.object({ idea: z.string() }))
  .handler(async ({ data }) => {
    return AIProviderService.generateStructuredPrompt(data.idea);
  });
