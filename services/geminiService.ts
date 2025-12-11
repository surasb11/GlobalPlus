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

export const compareMetricsAnalysis = async (
  metricA: MetricData, valA: number, regionA: string, yearA: number,
  metricB: MetricData, valB: number, regionB: string, yearB: number
): Promise<ComparisonResult | null> => {
  try {
    const prompt = `
      Compare these two statistics with their specific contexts:
      
      Item 1:
      - Metric: ${metricA.label}
      - Value: ${valA.toLocaleString()} ${metricA.unit}
      - Context: ${regionA}, Year ${yearA}

      Item 2:
      - Metric: ${metricB.label}
      - Value: ${valB.toLocaleString()} ${metricB.unit}
      - Context: ${regionB}, Year ${yearB}

      Task:
      1. Provide a detailed analysis paragraph (approx 60 words) explaining the relationship, contrast, or economic/social implication.
      2. Provide a separate, punchy "Data Insight" summary (1 sentence) that highlights the key takeaway.
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