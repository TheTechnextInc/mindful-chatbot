"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Moon, Sun, AlertCircle } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [emergencyEmail, setEmergencyEmail] = useState("")
  const [newEmergencyEmail, setNewEmergencyEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
      } else {
        const { data: profile } = await supabase.from("profiles").select("emergency_email").eq("id", user.id).single()

        if (profile?.emergency_email) {
          setEmergencyEmail(profile.emergency_email)
          setNewEmergencyEmail(profile.emergency_email)
        }
      }
      setIsLoading(false)
    }
    checkAuth()

    // Load saved preferences
    const savedDarkMode = localStorage.getItem("darkMode") === "true"
    const savedNotifications = localStorage.getItem("notifications") !== "false"
    setDarkMode(savedDarkMode)
    setNotifications(savedNotifications)
  }, [router])

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value)
    localStorage.setItem("darkMode", String(value))
    if (value) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleNotificationsToggle = (value: boolean) => {
    setNotifications(value)
    localStorage.setItem("notifications", String(value))
  }

  const handleSaveEmergencyEmail = async () => {
    if (!newEmergencyEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmergencyEmail)) {
      setSaveMessage("Please enter a valid email address.")
      return
    }

    setIsSaving(true)
    setSaveMessage("")

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setSaveMessage("You must be logged in to update your emergency contact.")
        setIsSaving(false)
        return
      }

      const { error } = await supabase.from("profiles").update({ emergency_email: newEmergencyEmail }).eq("id", user.id)

      if (error) {
        setSaveMessage("Error updating emergency contact. Please try again.")
      } else {
        setEmergencyEmail(newEmergencyEmail)
        setSaveMessage("Emergency contact updated successfully.")
      }
    } catch (error) {
      setSaveMessage("An error occurred while updating your emergency contact.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <p className="text-gray-900 dark:text-white">Loading...</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

        <div className="space-y-4">
          {/* Dark Mode */}
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                Dark Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Toggle dark mode for a comfortable viewing experience.
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleDarkModeToggle(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    !darkMode
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => handleDarkModeToggle(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    darkMode
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  Dark
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Receive notifications for reminders and updates.</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleNotificationsToggle(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    !notifications
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  Off
                </button>
                <button
                  onClick={() => handleNotificationsToggle(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    notifications
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  On
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Set an emergency contact email to receive alerts when you use the SOS button or when we detect
                concerning patterns.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Emergency Contact Email
                  </label>
                  <Input
                    type="email"
                    value={newEmergencyEmail}
                    onChange={(e) => setNewEmergencyEmail(e.target.value)}
                    placeholder="emergency.contact@example.com"
                    className="h-11 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {emergencyEmail ? `Current: ${emergencyEmail}` : "No emergency contact set"}
                  </p>
                </div>
                {saveMessage && (
                  <p
                    className={`text-sm ${saveMessage.includes("successfully") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {saveMessage}
                  </p>
                )}
                <Button
                  onClick={handleSaveEmergencyEmail}
                  disabled={isSaving}
                  className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                >
                  {isSaving ? "Saving..." : "Update Emergency Contact"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
