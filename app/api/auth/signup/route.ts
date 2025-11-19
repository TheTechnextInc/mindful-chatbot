import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, emergencyEmail, fullName } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || "Failed to create user" }, { status: 400 })
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email,
      full_name: fullName || email.split("@")[0],
      emergency_email: emergencyEmail || null,
    })

    if (profileError) {
      return NextResponse.json({ error: "Failed to create user profile" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      userId: authData.user.id,
    })
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
