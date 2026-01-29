import { Ollama } from "@langchain/community/llms/ollama";

export class WriterAgent {
  private model: Ollama;

  constructor() {
    this.model = new Ollama({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: process.env.OLLAMA_MODEL || "llama3.1",
      temperature: 0.8,
    });
  }

  async generateAppeal(
    extractedFields: any[],
    strategy: any,
    userContext?: string
  ) {
    const prompt = `You are a professional legal writer specializing in parking ticket appeals.

Citation Information:
${JSON.stringify(extractedFields, null, 2)}

Appeal Strategy to Use:
${JSON.stringify(strategy, null, 2)}

${userContext ? `Additional Context from User:\n${userContext}\n` : ""}

Write a professional, compelling appeal letter that:
1. Opens with a formal greeting and citation reference
2. States the grounds for appeal based on the strategy
3. Uses persuasive but respectful language
4. Requests dismissal or reduction of the fine
5. Closes professionally with contact information

Write the complete letter now:`;

    const response = await this.model.invoke(prompt);
    return response;
  }
}
