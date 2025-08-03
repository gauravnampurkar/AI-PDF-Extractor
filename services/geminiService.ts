
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { TableExtractionResponse } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TABLE_EXTRACTION_PROMPT = `You are an expert in data extraction. Analyze the provided image of a document page.
Your task is to identify all data tables present. For each table, extract all its rows and cells accurately.
Preserve the original structure of the table.
Return the data as a JSON object that adheres to the provided schema.
The root of the object must be a key "tables" which is an array of table objects.
Each table object must have:
1. A "title": A descriptive title for the table, derived from text near the table. If no title is apparent, provide a concise summary of the table's content (e.g., "Quarterly Sales Figures").
2. A "data" property: An array of arrays, where each inner array represents a row of cells (as strings).

If no tables are found on the page, return an object with an empty "tables" array.
Do not return markdown syntax like \`\`\`json. Only return the raw JSON object.`;

const TABLE_EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    tables: {
      type: Type.ARRAY,
      description: "A list of all tables found on the page.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "A descriptive title for the table, derived from text near the table or a summary of its content."
          },
          data: {
            type: Type.ARRAY,
            description: "The tabular data, represented as an array of rows. Each row is an array of strings.",
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              }
            }
          }
        },
        required: ["title", "data"]
      }
    }
  },
  required: ["tables"]
};

export async function extractTablesFromImage(base64Image: string): Promise<TableExtractionResponse> {
  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: base64Image,
    },
  };

  const textPart = {
    text: TABLE_EXTRACTION_PROMPT
  };
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: TABLE_EXTRACTION_SCHEMA,
      },
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    return result as TableExtractionResponse;
  } catch (error) {
    console.error("Error extracting tables from Gemini:", error);
    let errorMessage = "An unknown error occurred with the AI model.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    throw new Error(`Failed to parse tables from AI response. Reason: ${errorMessage}`);
  }
}
