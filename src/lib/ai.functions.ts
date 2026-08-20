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
    const result = await AIProviderService.generateImage(data);
    return result as {
      id: string;
      type: 'image' | 'video' | 'i2v' | 'prompt';
      status: 'queued' | 'processing' | 'completed' | 'failed';
      url: string;
      prompt: string;
      date: string;
    };
  });

export const generateVideoFn = createServerFn({ method: "POST" })
  .validator((data: { prompt: string, settings: any }) => z.object({ prompt: z.string(), settings: z.any() }).parse(data))
  .handler(async ({ data }) => {
    const result = await AIProviderService.generateVideo(data);
    return result as {
      id: string;
      type: 'image' | 'video' | 'i2v' | 'prompt';
      status: 'queued' | 'processing' | 'completed' | 'failed';
      url: string;
      prompt: string;
      date: string;
    };
  });

export const generateStructuredPromptFn = createServerFn({ method: "POST" })
  .validator((data: { idea: string }) => z.object({ idea: z.string() }).parse(data))
  .handler(async ({ data }) => {
    return AIProviderService.generateStructuredPrompt(data.idea);
  });

export const getGenerationStatusFn = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    return AIProviderService.getStatus(data.id);
  });
