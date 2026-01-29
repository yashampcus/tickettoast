import { NextRequest, NextResponse } from "next/server";
import { DocumentAnalystAgent } from "@/lib/agents/analyst";
import { StrategyAgent } from "@/lib/agents/strategist";
import { WriterAgent } from "@/lib/agents/writer";
import { ReviewerAgent } from "@/lib/agents/reviewer";

interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const { extractedFields, userContext, selectedStrategy } =
      await request.json();

    if (!extractedFields || extractedFields.length === 0) {
      return NextResponse.json(
        { error: "No extracted fields provided" },
        { status: 400 },
      );
    }

    console.log("Starting AI appeal generation with Ollama...");

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Helper to send events
          const sendEvent = (event: string, data: any) => {
            controller.enqueue(
              encoder.encode(
                `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
              ),
            );
          };

          sendEvent("progress", { step: "analyst", status: "in-progress" });

          const startTime1 = Date.now();
          const analyst = new DocumentAnalystAgent();
          const analysis = await analyst.analyze(extractedFields);
          const duration1 = Date.now() - startTime1;

          console.log("Analysis complete:", analysis);
          sendEvent("progress", {
            step: "analyst",
            status: "complete",
            duration: duration1,
            result: analysis,
          });

          // Step 2: Generate strategies
          console.log("Step 2: Generating strategies...");
          sendEvent("progress", { step: "strategist", status: "in-progress" });

          const startTime2 = Date.now();
          const strategist = new StrategyAgent();
          const strategies = await strategist.generateStrategies(
            analysis,
            extractedFields,
          );
          const duration2 = Date.now() - startTime2;

          console.log("Strategies generated:", strategies.length);
          sendEvent("progress", {
            step: "strategist",
            status: "complete",
            duration: duration2,
            result: strategies,
          });

          // Step 3: Select strategy
          const chosenStrategy = selectedStrategy || strategies[0];
          sendEvent("progress", { step: "writer", status: "in-progress" });

          const startTime3 = Date.now();
          const writer = new WriterAgent();
          const appealLetter = await writer.generateAppeal(
            extractedFields,
            chosenStrategy,
            userContext,
          );
          const duration3 = Date.now() - startTime3;
          sendEvent("progress", {
            step: "writer",
            status: "complete",
            duration: duration3,
            result: appealLetter,
          });

          sendEvent("progress", { step: "reviewer", status: "in-progress" });

          const startTime4 = Date.now();
          const reviewer = new ReviewerAgent();
          const review = await reviewer.review(appealLetter, extractedFields);
          const duration4 = Date.now() - startTime4;

          console.log("Review complete, score:", review.score);
          sendEvent("progress", {
            step: "reviewer",
            status: "complete",
            duration: duration4,
            result: review,
          });

          // Send final complete event
          sendEvent("complete", {
            success: true,
            analysis,
            strategies,
            chosenStrategy,
            appealLetter,
            review,
            metadata: {
              model: "Ollama (Free, Local)",
              processingTime: Date.now(),
            },
          });

          controller.close();
        } catch (error) {
          console.error("AI Appeal Generation Error:", error);
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({
                error: "Failed to generate appeal",
                details: error instanceof Error ? error.message : String(error),
              })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI Appeal Generation Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate appeal",
        details: error instanceof Error ? error.message : String(error),
        hint: "Make sure Ollama is running (ollama serve) and models are installed",
      },
      { status: 500 },
    );
  }
}
