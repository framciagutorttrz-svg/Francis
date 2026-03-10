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
  
  // Use API_KEY if available (from key selection dialog), fallback to GEMINI_API_KEY
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
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

  try {
    let operation = await ai.models.generateVideos(config);
    return operation;
  } catch (error: any) {
    // If permission denied or model not found, prompt to select key again
    if (error.message?.includes('PERMISSION_DENIED') || 
        error.message?.includes('Requested entity was not found') ||
        error.message?.includes('403')) {
      await window.aistudio.openSelectKey();
    }
    throw error;
  }
}

export async function pollVideoOperation(operationId: any) {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  let operation = operationId;
  
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  
  return operation.response?.generatedVideos?.[0]?.video?.uri;
}
