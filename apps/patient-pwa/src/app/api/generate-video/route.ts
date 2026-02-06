import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
    }

    // Sora 2 API - Low-Stim prompt for dementia patients
    // Using type assertion because OpenAI SDK types haven't caught up with Sora 2 image-to-video API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const video = await openai.videos.create({
      model: "sora-2",
      prompt:
        "A subtle, 5-second high-fidelity animation of the provided photo. Apply a gentle 'breathing' effect to the subject with a soft, warm morning light enhancement. The subject performs a single, slow, recognizable action like a slight head tilt or a warm smile. Ensure 24fps for cinematic smoothness. Avoid rapid camera movement, flashes, or complex transitions to maintain cognitive comfort. High contrast, 21:1 ratio. Include subtle synchronized environmental audio like soft birds chirping or gentle wind.",
      input: [
        {
          type: "image",
          image: { url: imageUrl },
        },
      ],
      duration: 5,
      fps: 24,
      size: "1280x720", // 720p landscape, optimized for fast pre-fetch
      response_format: "mp4", // H.264 for best hardware acceleration
    } as any);

    // Poll for video completion (Sora generates videos asynchronously)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result = video as any;
    while (result.status === "pending" || result.status === "in_progress") {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result = await (openai.videos as any).retrieve(result.id);
    }

    if (result.status === "failed") {
      throw new Error(result.error?.message || "Video generation failed");
    }

    // Access the video URL from the output
    const videoUrl = result.output?.url || result.url;
    return NextResponse.json({ videoUrl });
  } catch (error) {
    console.error("Video Generation Error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
