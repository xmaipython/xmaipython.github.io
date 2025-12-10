import { GoogleGenAI } from "@google/genai";
import { ViewAngle } from "../types";

// Helper to convert blob/url to base64
export const urlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert image to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateTryOnImage = async (
  personImageBase64: string,
  clothImageBase64: string,
  angle: ViewAngle
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prompt engineering for virtual try-on
  const prompt = `
    You are an expert fashion visualizer.
    Task: Generate a photorealistic full-body image of the person provided in the first image wearing the clothing provided in the second image.
    
    Requirements:
    1. Angle: Generate the image specifically from the **${angle}**.
    2. Identity: Preserve the person's skin tone, body shape, and facial features as much as possible.
    3. Clothing: The clothing must look natural, fitting the body correctly with realistic fabric physics (folds, shadows).
    4. Background: Use a clean, neutral, high-end studio background (soft grey or white).
    5. Quality: High resolution, photorealistic, 4k quality.
    
    Output ONLY the generated image.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Using Flash Image for speed and general generation
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: personImageBase64
            }
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: clothImageBase64
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    // Extract image from response
    // The model might return text if it refuses, or an image in inlineData
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content generated.");
    }

    // Look for image part
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    // If no image found, check for refusal text
    const textPart = parts.find(p => p.text);
    if (textPart) {
      throw new Error(`Generation failed: ${textPart.text}`);
    }

    throw new Error("No image data returned from API.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Unknown error occurred during generation.");
  }
};