import { Ollama } from "@langchain/community/llms/ollama";

interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
}

export class DocumentAnalystAgent {
  private model: Ollama;

  constructor() {
    this.model = new Ollama({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: process.env.OLLAMA_MODEL || "llama3.1",
      temperature: 0.2,
    });
  }

  async analyze(extractedFields: ExtractedField[]) {
    const prompt = `You are an expert document analyst specializing in parking citations.

Analyze the following extracted citation data and provide a JSON response:

Extracted Data:
${JSON.stringify(extractedFields, null, 2)}

Analyze and return ONLY valid JSON in this exact format:
{
  "completeness": "complete|partial|insufficient",
  "missingFields": ["field1", "field2"],
  "violationType": "parking meter expired|no parking zone|other",
  "severity": "minor|moderate|severe",
  "inconsistencies": ["any issues found"],
  "appealability": "high|medium|low",
  "reasoning": "brief explanation"
}`;

    const response = await this.model.invoke(prompt);

    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error("Failed to parse analysis:", error);
      return {
        completeness: "partial",
        missingFields: [],
        violationType: "unknown",
        severity: "moderate",
        inconsistencies: [],
        appealability: "medium",
        reasoning: "Could not fully analyze citation data",
      };
    }
  }
}
