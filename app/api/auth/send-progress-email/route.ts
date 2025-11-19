import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email-sender"

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, progressData, notificationType } = body

    const supabase = await createClient()

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name, emergency_email")
      .eq("id", userId)
      .single()

    if (profileError || !profile?.emergency_email) {
      return NextResponse.json(
        { error: "Emergency email not configured." },
        { status: 400 }
      )
    }

    let emailSubject = ""
    let emailHtml = ""

    if (notificationType === "milestone") {
      emailSubject = `${profile.full_name} reached a mental wellness milestone on MindfulChat.`
      emailHtml = `
        <h2>Great Progress Update!</h2>
        <p>Hi,</p>
        <p>${profile.full_name} has reached a significant milestone in their mental wellness journey on MindfulChat:</p>
        <ul>
          <li>Sessions Completed: ${progressData.sessionsCompleted || 0}</li>
          <li>Therapy Mode: ${progressData.therapyMode || "N/A"}</li>
          <li>Progress: ${progressData.progressPercentage || 0}%</li>
        </ul>
        <p>This is wonderful progress. Keep supporting them!</p>
        <p>Best regards,<br/>MindfulChat Team</p>
      `
    } else if (notificationType === "weekly_progress") {
      emailSubject = `Weekly Progress Report for ${profile.full_name} on MindfulChat.`
      emailHtml = `
        <h2>Weekly Progress Report</h2>
        <p>Hi,</p>
        <p>Here's the weekly update for ${profile.full_name}:</p>
        <ul>
          <li>Sessions This Week: ${progressData.weeklySessionCount || 0}</li>
          <li>Messages Exchanged: ${progressData.messageCount || 0}</li>
          <li>Primary Therapy Mode: ${progressData.primaryMode || "N/A"}</li>
          <li>Overall Progress: ${progressData.overallProgress || 0}%</li>
        </ul>
        <p>Keep encouraging them on their wellness journey!</p>
        <p>Best regards,<br/>MindfulChat Team</p>
      `
    } else if (notificationType === "concern_alert") {
      emailSubject = `Mental Wellness Check-in for ${profile.full_name}.`
      emailHtml = `
        <h2>Mental Wellness Check-in</h2>
        <p>Hi,</p>
        <p>${profile.full_name} may need additional support or guidance. They've shared concerns about:</p>
        <p>${progressData.concernMessage || "Mental wellness challenges"}</p>
        <p>We recommend checking in with them to provide support and encouragement.</p>
        <p>If they express thoughts of self-harm or suicide, please contact emergency services immediately.</p>
        <p>Best regards,<br/>MindfulChat Team</p>
      `
    }

    console.log("[v0] Sending progress email to:", profile.emergency_email)
    console.log("[v0] Email type:", notificationType)

    const emailResult = await sendEmail({
      from: 'MindfulChat Progress',
      to: profile.emergency_email,
      subject: emailSubject,
      html: emailHtml,
    })

    const { error: logError } = await supabase
      .from("emergency_notifications")
      .insert([
        {
          user_id: userId,
          emergency_email: profile.emergency_email,
          notification_type: notificationType,
          progress_data: {
            ...progressData,
            email_sent: emailResult.success,
          },
        },
      ])

    if (logError) {
      console.error("[v0] Error logging notification:", logError)
    }

    return NextResponse.json(
      {
        success: true,
        message: "Progress notification sent.",
        email: profile.emergency_email,
        type: notificationType,
        emailSent: emailResult.success,
        note: emailResult.success 
          ? "Email sent successfully via EmailJS" 
          : "Email sending failed. Check console for details."
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Error sending progress email:", error)
    return NextResponse.json(
      { error: "Failed to send progress notification." },
      { status: 500 }
    )
  }
}
