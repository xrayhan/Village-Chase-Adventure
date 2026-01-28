
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRuralBackground = async (): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: 'A vivid, high-contrast digital 2D game background of a Bangladeshi village. Features lush green paddy fields, coconut trees, traditional thatched-roof huts (tin-shed houses), a bright blue sky with fluffy white clouds, and a dirt path at the bottom. Side-scrolling cartoon art style.',
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Error generating background:", error);
  }
  return null;
};

export const generateGameCommentary = async (score: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a funny, short 1-sentence commentary in Bengali for a chase game where a female leader in a saree is escaping a male leader with a beard and a bamboo stick in a village. The current score is ${score}. Make it witty and relevant to a village chase.`,
    });
    return response.text || "দৌড়ান! পেছনে কিন্তু বাঁশ নিয়ে আসছে!";
  } catch (error) {
    return "সাবধানে! গর্তে পা দেবেন না!";
  }
};
