import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { message, systemPrompt, mode, userId, sessionId } = await request.json()

    if (!PERPLEXITY_API_KEY) {
      return NextResponse.json({ error: "Perplexity API key not configured" }, { status: 500 })
    }

    const enhancedSystemPrompt = `${systemPrompt}

IMPORTANT RESPONSE GUIDELINES:
- Do NOT include any reference numbers, citations, or source links in your response
- Do NOT use brackets like [1], [2], etc.
- Do NOT mention sources or where information comes from
- Provide direct, personal, conversational responses as if speaking face-to-face
- Keep responses concise and focused on the user's immediate emotional needs
- Use "I" statements and speak directly to the user
- Avoid academic or clinical language unless specifically needed for the therapeutic approach`

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: enhancedSystemPrompt,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.4,
        max_tokens: 200,
        return_citations: false,
        return_images: false,
        return_related_questions: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`)
    }

    const data = await response.json()
    let assistantResponse =
      data.choices[0]?.message?.content?.trim() ||
      "I'm sorry, I couldn't process your message right now. Please try again."

    assistantResponse = assistantResponse
      .replace(/\[\d+\]/g, "") // Remove [1], [2], etc.
      .replace(/$$\d+$$/g, "") // Remove (1), (2), etc.
      .replace(/Source:.*$/gm, "") // Remove source lines
      .replace(/References?:.*$/gm, "") // Remove reference lines
      .replace(/According to.*?,/g, "") // Remove "According to..." phrases
      .replace(/\s+/g, " ") // Clean up extra whitespace
      .trim()

    if (assistantResponse && !/[.!?]$/.test(assistantResponse)) {
      assistantResponse += "."
    }

    const sentences = assistantResponse.split(/(?<=[.!?])\s+/)
    if (sentences.length > 3) {
      assistantResponse = sentences.slice(0, 3).join(" ")
      if (!/[.!?]$/.test(assistantResponse)) {
        assistantResponse += "."
      }
    }

    if (userId) {
      try {
        const supabase = await createClient()

        // Save user message
        await supabase.from("messages").insert({
          session_id: sessionId,
          user_id: userId,
          role: "user",
          content: message,
          therapy_mode: mode,
        })

        // Save assistant response
        await supabase.from("messages").insert({
          session_id: sessionId,
          user_id: userId,
          role: "assistant",
          content: assistantResponse,
          therapy_mode: mode,
        })

        // Track analytics
        await supabase.from("user_analytics").insert({
          user_id: userId,
          session_id: sessionId,
          therapy_mode: mode,
          interaction_type: "message_sent",
          metadata: {
            message_length: message.length,
            response_length: assistantResponse.length,
          },
        })
      } catch (dbError) {
        console.error("Database error:", dbError)
        // Don't fail the request if database operations fail
      }
    }

    return NextResponse.json({ response: assistantResponse })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process your message. Please try again." }, { status: 500 })
  }
}
