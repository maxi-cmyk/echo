import { NextResponse } from "next/server";
import OpenAI from "openai";

// Lazily initialize OpenAI to prevent build-time errors when API keys are missing
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
  : null;

export async function POST(req: Request) {
  try {
    const { fileUrl, mediaType } = await req.json();

    if (!openai) {
      console.warn("OpenAI API key missing, skipping analysis");
      return NextResponse.json({
        summary: "AI Analysis unavailable (Missing API Key)",
        people: "Unknown",
        date: "Unknown",
      });
    }

    if (!fileUrl) {
      return NextResponse.json({ error: "Missing fileUrl" }, { status: 400 });
    }

    // Basic handling for videos or non-images
    if (mediaType === "video") {
      return NextResponse.json({
        summary: "Video uploaded. AI analysis for video is currently limited.",
        people: "Unknown",
        date: "Unknown",
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "extract the metadata of the file, and output it as a JSON object with keys: 'date' and 'location', and if you can't extract it return null."
            },
            {
              type: "image_url",
              image_url: {
                url: fileUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    let result;
    try {
      result = JSON.parse(content || "{}");
    } catch (e) {
      console.error("Failed to parse JSON from AI", content);
      result = {
        summary: "Analysis completed but format was invalid.",
        people: "Unknown",
        date: "Unknown",
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
