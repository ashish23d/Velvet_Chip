
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Category } from '../types.ts';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Using mock data. Please set process.env.API_KEY.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateProductDescription = async (product: Product): Promise<string> => {
  if (!ai) {
    return new Promise(resolve => setTimeout(() => resolve(`An exquisite ${product.name} crafted from the finest materials. This ${product.category.replace('-', ' ')} features ${Object.values(product.specifications).join(', ').toLowerCase()}. A must-have for any fashion enthusiast.`), 1000));
  }
  
  try {
    const prompt = `
      You are a fashion copywriter for an elegant women's clothing brand called 'Awaany'.
      Write a short, appealing, and sophisticated product description (around 30-40 words) for the following item.
      Focus on the feeling, style, and quality. Do not just list the specifications.
      
      Product Name: ${product.name}
      Category: ${product.category}
      Specifications: ${JSON.stringify(product.specifications)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 1,
        topK: 1,
        maxOutputTokens: 100,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    return response.text.trim();

  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    // Fallback to a simpler description on error
    return `Discover the charm of the ${product.name}. A perfect addition to your collection, offering both style and comfort.`;
  }
};

export const getSearchSuggestions = async (query: string, categories: Category[]): Promise<{ suggestedQueries: string[], suggestedCategories: string[] }> => {
  if (!ai || query.length < 3) {
    return { suggestedQueries: [], suggestedCategories: [] };
  }

  const categoryNames = categories.map(c => c.name);

  try {
    const prompt = `
      You are a smart search assistant for 'Awaany', an e-commerce website specializing in women's fashion.
      Based on the user's search query, provide relevant search query suggestions and category suggestions.

      User's current search query: "${query}"

      List of available categories:
      - ${categoryNames.join('\n- ')}

      Analyze the user's query and generate:
      1.  A list of 3-5 likely and helpful search queries a user might be trying to type. These should be variations or completions of the user's query.
      2.  A list of 1-3 relevant category names from the provided list. Only include categories that are highly relevant to the search query.
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedQueries: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of 3-5 relevant search query suggestions."
            },
            suggestedCategories: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of 1-3 relevant category names from the available list."
            }
          }
        },
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const jsonResponse = JSON.parse(response.text.trim());
    return jsonResponse;

  } catch (error) {
    console.error("Error generating search suggestions with Gemini:", error);
    // Fallback to a simple logic on error
    const matchingCategories = categories
        .filter(c => c.name && c.name.toLowerCase().includes(query.toLowerCase()))
        .map(c => c.name);
    return {
        suggestedQueries: [],
        suggestedCategories: matchingCategories
    };
  }
};
