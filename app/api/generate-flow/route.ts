import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!, // from .env.local
  defaultHeaders: {
    "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER || "",
    "X-Title": process.env.OPENROUTER_X_TITLE || "",
  },
});

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json(
        { error: "Missing query parameter." },
        { status: 400 }
      );
    }

    const prompt = `
You are a call-flow designer.
Given the following user query:
"${query}"
Generate a JSON call flow that meets the user's requirements.
The JSON must be in the following format and nothing else:
{
  "nodes": [
    { "id": "1", "position": { "x": 50, "y": 50 }, "data": { "label": "ACCEPT", "verb": "accept", "params": {} } },
    { "id": "2", "position": { "x": 250, "y": 50 }, "data": { "label": "PLAY", "verb": "play", "params": { "media": "sound:hello-world" } } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "animated": true }
  ]
}
Please output only valid JSON.
`;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates call flow JSON specifications.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 500,
    });

    // Log the entire response for debugging.
    console.log("OpenRouter API Response:", JSON.stringify(response, null, 2));

    let content = response.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "LLM did not return any content.", raw: response },
        { status: 500 }
      );
    }

    // Check if the content is wrapped in a code fence and remove it.
    if (content.startsWith("```")) {
      // Remove the starting fence (e.g., "```json")
      const firstLineEnd = content.indexOf("\n");
      content = content.substring(firstLineEnd + 1);

      // Remove the ending fence ("```")
      const fenceIndex = content.lastIndexOf("```");
      if (fenceIndex !== -1) {
        content = content.substring(0, fenceIndex).trim();
      }
    }

    let flowJson;
    try {
      flowJson = JSON.parse(content);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError, "Raw content:", content);
      return NextResponse.json(
        { error: "Failed to parse JSON from LLM response.", raw: content },
        { status: 500 }
      );
    }

    return NextResponse.json(flowJson);
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: error.message || "Unexpected error occurred." },
      { status: 500 }
    );
  }
}
