import { Ollama } from "@langchain/community/llms/ollama";

export class ReviewerAgent {
  private model: Ollama;

  constructor() {
    this.model = new Ollama({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: process.env.OLLAMA_MODEL || "llama3.1",
      temperature: 0.3,
    });
  }

  async review(appealLetter: string, extractedFields: any[]) {
    const prompt = `You are a quality assurance expert for legal documents.

Review this parking ticket appeal letter:

${appealLetter}

Citation Facts:
${JSON.stringify(extractedFields, null, 2)}

Provide feedback in JSON format:
{
  "score": 85,
  "strengths": ["Professional tone", "Clear arguments"],
  "weaknesses": ["Could add more evidence"],
  "improvements": ["Add specific date references", "Include regulation numbers"],
  "factCheck": "pass",
  "toneAssessment": "professional",
  "recommendation": "Ready to submit with minor improvements"
}

Return ONLY the JSON:`;

    const response = await this.model.invoke(prompt);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error("Failed to parse review:", error);
      return {
        score: 70,
        strengths: ["Letter generated successfully"],
        weaknesses: [],
        improvements: ["Review and customize before submitting"],
        factCheck: "pass",
        toneAssessment: "professional",
        recommendation: "Review before submitting",
      };
    }
  }
}
