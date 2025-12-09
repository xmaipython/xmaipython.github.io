import { GoogleGenAI } from "@google/genai";
import { ViewAngle } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

// Initialize the client.
// Note: In a real production app, you might proxy this through a backend to protect the key,
// but for this client-side demo we use the env var directly as per instructions.
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Helper to convert blob/url to base64
export const urlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting URL to Base64:", error);
    throw error;
  }
};

export const generateTryOnImage = async (
  personImageBase64: string,
  clothImageBase64: string,
  angle: ViewAngle
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash-image'; 
    // Note: We use 'gemini-2.5-flash-image' for this demo. 
    // 'gemini-3-pro-image-preview' would offer higher quality but might require specific account permissions/billing.

    const prompt = `
      You are an expert AI fashion stylist and visual effects artist.
      
      Task:
      Generate a highly photorealistic image of the person provided in the first image wearing the clothing provided in the second image.
      
      Constraints:
      1. Perspective: Generate the view from ${angle}.
      2. Identity: Preserve the person's facial features, skin tone, hair, and body shape exactly.
      3. Clothing: Fit the clothing naturally onto the person's body. Account for realistic fabric physics, gravity, folds, and lighting.
      4. Lighting: Match the lighting of the person's original environment.
      5. Background: Keep the background clean and consistent with the original person's image if possible, or use a neutral studio background.
      6. Quality: High resolution, sharp details.
      
      Input 1: Person
      Input 2: Clothing/Texture
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            text: prompt
          },
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
          }
        ]
      },
      // We don't use responseMimeType: 'image/jpeg' here because the model might return text + image.
      // We parse the output manually.
    });

    // Extract image from response
    // The model typically returns an inlineData part if it generates an image.
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content generated");
    }

    // Find the image part
    const imagePart = parts.find(p => p.inlineData);

    if (imagePart && imagePart.inlineData) {
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }

    throw new Error("No image data found in response. The model may have refused the request due to safety filters.");

  } catch (error) {
    console.error("Gemini Try-On Generation Error:", error);
    throw error;
  }
};
