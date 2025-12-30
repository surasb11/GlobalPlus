import { GoogleGenAI, Type } from "@google/genai";
import { MetricData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateInsight = async (metric: MetricData, currentValue: number): Promise<string> => {
  try {
    const prompt = `
      Analyze the following global statistic:
      Metric: ${metric.label}
      Current Value: ${currentValue.toLocaleString()} ${metric.unit}
      Description: ${metric.description}

      Provide a brief, fascinating 2-sentence insight about this number. 
      Focus on context, scale, or impact. Do not mention the date.
      Return plain text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No insight generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to fetch insights at this time.";
  }
};

export interface ComparisonResult {
  analysis: string;
  insight: string;
}

interface ComparisonItem {
  label: string;
  value: number;
  unit: string;
  context: string;
}

export const compareMetricsAnalysis = async (items: ComparisonItem[]): Promise<ComparisonResult | null> => {
  try {
    const itemsText = items.map((item, index) => `
      Item ${index + 1}:
      - Metric: ${item.label}
      - Value: ${item.value.toLocaleString()} ${item.unit}
      - Context: ${item.context}
    `).join('\n');

    const prompt = `
      Compare the following statistics:
      
      ${itemsText}

      Task:
      1. Provide a detailed analysis paragraph (approx 80-100 words) explaining the relationship, contrasts, or trends visible between these data points. If they are unrelated, explain the scale difference or economic implication of each.
      2. Provide a separate, punchy "Data Insight" summary (1 sentence) that highlights the most interesting takeaway.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            insight: { type: Type.STRING }
          },
          required: ["analysis", "insight"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ComparisonResult;
    }
    return null;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};