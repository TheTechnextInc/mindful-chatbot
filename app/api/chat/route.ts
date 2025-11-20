import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { detectCrisisKeywords } from "@/lib/crisis-detector"
import { sendEmail } from "@/lib/email-sender"

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { message, systemPrompt, mode, userId, sessionId } = await request.json()

    if (!PERPLEXITY_API_KEY) {
      return NextResponse.json({ error: "Perplexity API key not configured" }, { status: 500 })
    }

    let crisisDetected = false
    let crisisMatches: string[] = []

    if (userId && sessionId) {
      const detection = detectCrisisKeywords(message)

      if (detection.found) {
        console.log("[v0] Crisis keywords detected:", detection.matches)
        crisisDetected = true
        crisisMatches = detection.matches

        // Check crisis count in current session
        const supabase = await createClient()

        const { data: sessionMessages } = await supabase
          .from("messages")
          .select("content, role")
          .eq("session_id", sessionId)
          .eq("role", "user")
          .order("created_at", { ascending: false })
          .limit(10)

        let crisisCount = 0
        if (sessionMessages) {
          for (const msg of sessionMessages) {
            const msgDetection = detectCrisisKeywords(msg.content)
            if (msgDetection.found) {
              crisisCount++
            }
          }
        }

        // Add current message to count
        crisisCount++

        console.log("[v0] Crisis keyword count in session:", crisisCount)

        if (crisisCount >= 3) {
          console.log("[v0] CRISIS THRESHOLD REACHED - Triggering automatic emergency alert")

          const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

          if (profile?.emergency_email) {
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #dc2626; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="margin: 0;">🚨 URGENT: Automatic Crisis Alert</h2>
                </div>
                
                <div style="background-color: #fff5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin-bottom: 20px;">
                  <p style="margin: 0 0 10px 0; color: #991b1b;"><strong>AUTOMATIC ALERT TRIGGERED</strong></p>
                  <p style="margin: 0; color: #666;"><strong>${profile.full_name || profile.email}</strong> has expressed concerning thoughts in their chat session.</p>
                  <p style="margin: 10px 0 0 0; color: #666;">The system detected multiple crisis indicators suggesting they may need immediate support.</p>
                </div>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="margin: 0 0 10px 0;"><strong>Detection Summary:</strong></p>
                  <p style="margin: 0; color: #666;">Crisis keywords detected: ${crisisCount} times</p>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Keywords: ${crisisMatches.slice(0, 3).join(", ")}</p>
                </div>
                
                <div style="background-color: #fff5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin-bottom: 20px;">
                  <p style="margin: 0; color: #991b1b;"><strong>Action Required:</strong> Please reach out to them immediately. They may be in distress and need someone to talk to.</p>
                </div>
                
                <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="margin: 0; font-size: 14px; color: #166534;"><strong>Crisis Resources:</strong></p>
                  <p style="margin: 5px 0; font-size: 13px; color: #166534;">🇺🇸 National Suicide Prevention Lifeline: 988</p>
                  <p style="margin: 5px 0; font-size: 13px; color: #166534;">📱 Crisis Text Line: Text HOME to 741741</p>
                  <p style="margin: 5px 0; font-size: 13px; color: #166534;">🌍 International: https://www.iasp.info/resources/Crisis_Centres/</p>
                </div>
                
                <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">This is an automated crisis alert from MindfulChat</p>
              </div>
            `

            try {
              await sendEmail({
                from: "MindfulChat Crisis Alert",
                to: profile.emergency_email,
                subject: "🚨 URGENT: Crisis Alert - Immediate Attention Needed",
                html: emailHtml,
              })

              await supabase.from("emergency_notifications").insert({
                user_id: userId,
                emergency_email: profile.emergency_email,
                notification_type: "concern_alert",
                progress_data: {
                  alert_type: "automatic_crisis_detection",
                  crisis_count: crisisCount,
                  keywords_detected: crisisMatches,
                  timestamp: new Date().toISOString(),
                  trigger: "threshold_reached",
                },
              })

              console.log("[v0] Automatic crisis alert sent successfully")
            } catch (emailError) {
              console.error("[v0] Failed to send automatic crisis alert:", emailError)
            }
          } else {
            console.log("[v0] No emergency contact configured for user")
          }
        }
      }
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
      .replace(/\[\d+\]/g, "")
      .replace(/$$\d+$$/g, "")
      .replace(/Source:.*$/gm, "")
      .replace(/References?:.*$/gm, "")
      .replace(/According to.*?,/g, "")
      .replace(/\s+/g, " ")
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

        await supabase.from("messages").insert({
          session_id: sessionId,
          user_id: userId,
          role: "user",
          content: message,
          therapy_mode: mode,
        })

        await supabase.from("messages").insert({
          session_id: sessionId,
          user_id: userId,
          role: "assistant",
          content: assistantResponse,
          therapy_mode: mode,
        })

        await supabase.from("user_analytics").insert({
          user_id: userId,
          session_id: sessionId,
          therapy_mode: mode,
          interaction_type: crisisDetected ? "crisis_message_detected" : "message_sent",
          metadata: {
            message_length: message.length,
            response_length: assistantResponse.length,
            crisis_detected: crisisDetected,
            crisis_keywords: crisisMatches,
          },
        })
      } catch (dbError) {
        console.error("Database error:", dbError)
      }
    }

    return NextResponse.json({ response: assistantResponse })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process your message. Please try again." }, { status: 500 })
  }
}
