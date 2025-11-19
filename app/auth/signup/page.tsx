"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useState } from "react"
import { Brain, CheckCircle } from 'lucide-react'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    emergencyEmail: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    if (formData.emergencyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emergencyEmail)) {
      setError("Please enter a valid emergency email")
      setIsLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName,
            emergency_email: formData.emergencyEmail,
          },
        },
      })
      if (error) throw error
      router.push("/auth/signup-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-full">
              <Brain className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Join MindfulChat</h1>
          <p className="text-gray-600 dark:text-gray-400">Start your personalized mental wellness journey</p>
        </div>

        <Card className="shadow-lg border-0 dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center dark:text-white">Create Account</CardTitle>
            <CardDescription className="text-center dark:text-gray-400">Fill in your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="dark:text-gray-300">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="h-11 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-11 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyEmail" className="dark:text-gray-300">Emergency Contact Email (Optional)</Label>
                <Input
                  id="emergencyEmail"
                  type="email"
                  placeholder="emergency.contact@example.com"
                  value={formData.emergencyEmail}
                  onChange={(e) => handleInputChange("emergencyEmail", e.target.value)}
                  className="h-11 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">We'll send them progress updates and support information</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="h-11 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Must be at least 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="dark:text-gray-300">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="h-11 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                  className="dark:border-slate-600"
                />
                <Label htmlFor="terms" className="text-sm dark:text-gray-300">
                  I agree to the{" "}
                  <Link href="/terms" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">6 specialized therapy approaches</p>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Personalized AI responses</p>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Progress tracking & analytics</p>
          </div>
        </div>
      </div>
    </div>
  )
}
