import { Ollama } from "@langchain/community/llms/ollama";

export class StrategyAgent {
  private model: Ollama;

  constructor() {
    this.model = new Ollama({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: process.env.OLLAMA_MODEL || "llama3.1",
      temperature: 0.7,
    });
  }

  async generateStrategies(analysis: any, extractedFields: any[]) {
    const prompt = `You are an expert in parking ticket appeal strategies.

Citation Analysis:
${JSON.stringify(analysis, null, 2)}

Citation Details:
${JSON.stringify(extractedFields, null, 2)}

Generate 3 ranked appeal strategies. Return ONLY valid JSON array in this format:
[
  {
    "name": "Signage Issue Appeal",
    "probability": 75,
    "requiredEvidence": ["photo of unclear signage", "photos from multiple angles"],
    "keyArguments": ["Signage was unclear or missing", "Reasonable person would be confused"],
    "risks": ["May need strong photographic evidence"],
    "reasoning": "If signage was inadequate, strong grounds for appeal"
  },
  {
    "name": "Meter Malfunction",
    "probability": 60,
    "requiredEvidence": ["photo of meter", "receipt if attempted to pay"],
    "keyArguments": ["Meter was broken", "Made good faith effort to pay"],
    "risks": ["City may claim meter was functioning"],
    "reasoning": "Mechanical failures are valid defense"
  }
]`;

    const response = await this.model.invoke(prompt);

    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error("Failed to parse strategies:", error);
      // Return default strategy
      return [
        {
          name: "General Appeal",
          probability: 50,
          requiredEvidence: ["photos", "documentation"],
          keyArguments: ["Request review of circumstances"],
          risks: ["May need more specific grounds"],
          reasoning: "General appeal based on citation review",
        },
      ];
    }
  }
}
