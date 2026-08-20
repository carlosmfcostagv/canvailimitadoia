import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AIProviderService } from "./ai.server";

export const enhancePromptFn = createServerFn({ method: "POST" })
  .validator((data: { prompt: string }) => z.object({ prompt: z.string() }).parse(data))
  .handler(async ({ data }) => {
    return AIProviderService.enhancePrompt(data.prompt);
  });

export const generateImageFn = createServerFn({ method: "POST" })
  .validator((data: { prompt: string, settings: any }) => z.object({ prompt: z.string(), settings: z.any() }).parse(data))
  .handler(async ({ data }) => {
    return AIProviderService.generateImage(data);
  });

export const generateVideoFn = createServerFn({ method: "POST" })
  .validator((data: { prompt: string, settings: any }) => z.object({ prompt: z.string(), settings: z.any() }).parse(data))
  .handler(async ({ data }) => {
    return AIProviderService.generateVideo(data);
  });

export const generateStructuredPromptFn = createServerFn({ method: "POST" })
  .validator((data: { idea: string }) => z.object({ idea: z.string() }).parse(data))
  .handler(async ({ data }) => {
    return AIProviderService.generateStructuredPrompt(data.idea);
  });
