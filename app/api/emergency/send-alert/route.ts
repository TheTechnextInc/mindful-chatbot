import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email-sender"

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile?.emergency_email) {
      return NextResponse.json(
        { error: "No emergency contact configured" },
        { status: 400 }
      )
    }

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0;">🚨 EMERGENCY ALERT</h2>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0;"><strong>${profile.full_name || user.email}</strong> has triggered an emergency alert.</p>
            <p style="margin: 0; color: #666;">They may need immediate support or someone to talk to.</p>
          </div>
          
          <div style="background-color: #fff5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin-bottom: 20px;">
            <p style="margin: 0; color: #991b1b;"><strong>Important:</strong> Please reach out to them as soon as possible. They have designated you as their emergency contact.</p>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: #166534;"><strong>Crisis Resources:</strong></p>
            <p style="margin: 5px 0; font-size: 13px; color: #166534;">🇺🇸 National Suicide Prevention Lifeline: 988</p>
            <p style="margin: 5px 0; font-size: 13px; color: #166534;">🇬🇧 Crisis Text Line: Text HOME to 741741</p>
            <p style="margin: 5px 0; font-size: 13px; color: #166534;">🌍 International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/</p>
          </div>
          
          <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">This is an automated alert from MindfulChat</p>
        </div>
      `

    console.log("[v0] Sending emergency email to:", profile.emergency_email)

    const emailResult = await sendEmail({
      from: 'MindfulChat Alert',
      to: profile.emergency_email,
      subject: "🚨 Mental Health Emergency Alert from MindfulChat",
      html: emailHtml,
    })

    // Log emergency alert to database
    await supabase.from("emergency_notifications").insert({
      user_id: user.id,
      emergency_email: profile.emergency_email,
      notification_type: "concern_alert",
      progress_data: {
        alert_type: "emergency",
        user_name: profile.full_name || user.email,
        timestamp: new Date().toISOString(),
        email_sent: emailResult.success,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Emergency alert sent to your emergency contact",
      emailSent: emailResult.success,
      note: emailResult.success 
        ? "Email sent successfully via EmailJS" 
        : "Email sending failed. Check console for details."
    })
  } catch (error) {
    console.error("[v0] Emergency alert error:", error)
    return NextResponse.json(
      { error: "Failed to send emergency alert" },
      { status: 500 }
    )
  }
}
