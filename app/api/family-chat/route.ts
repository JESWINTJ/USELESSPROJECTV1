import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { speaker, personality, context, allMembers } = await request.json()

    // Check if API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Please add the Google AI integration to your project." },
        { status: 500 },
      )
    }

    const systemPrompt = `You are ${speaker}, a family member with this personality: ${personality}

You are having a casual conversation with your family members: ${allMembers.join(", ")}.

Rules:
- Keep responses short and natural (1-2 sentences max)
- Stay in character based on your personality
- React to what others have said or bring up new random topics
- Make it feel like a real family conversation
- Be conversational and spontaneous
- Sometimes ask questions, sometimes make statements
- Include typical family dynamics and interactions

Recent conversation context:
${context || "This is the start of the conversation"}

Respond as ${speaker} would naturally respond in this family setting.`

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      prompt: `Continue the family conversation naturally as ${speaker}.`,
      maxTokens: 100,
    })

    return NextResponse.json({ message: text.trim() })
  } catch (error) {
    console.error("Error in family chat:", error)
    return NextResponse.json(
      { error: "Failed to generate family chat message. Make sure Gemini integration is properly configured." },
      { status: 500 },
    )
  }
}
