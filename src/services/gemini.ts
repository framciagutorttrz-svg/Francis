import { GoogleGenAI } from "@google/genai";

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export async function checkAndOpenApiKey() {
  if (typeof window.aistudio === 'undefined') return true;
  const hasKey = await window.aistudio.hasSelectedApiKey();
  if (!hasKey) {
    await window.aistudio.openSelectKey();
    return true; // Assume success as per guidelines
  }
  return true;
}

export async function generateVeoVideo(prompt: string, imageBase64?: string, mimeType?: string) {
  await checkAndOpenApiKey();
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const config: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  };

  if (imageBase64 && mimeType) {
    config.image = {
      imageBytes: imageBase64,
      mimeType: mimeType
    };
  }

  let operation = await ai.models.generateVideos(config);

  return operation;
}

export async function pollVideoOperation(operationId: any) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let operation = operationId;
  
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  
  return operation.response?.generatedVideos?.[0]?.video?.uri;
}
