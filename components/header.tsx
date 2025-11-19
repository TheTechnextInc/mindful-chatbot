"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, BarChart3, Settings, LogOut, HelpCircle, Home, AlertCircle } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import { useState } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface HeaderProps {
  user?: SupabaseUser | null
  profile?: any
  currentView?: "welcome" | "chat" | "analytics"
  onViewChange?: (view: "welcome" | "chat" | "analytics") => void
}

export function Header({ user, profile, currentView = "welcome", onViewChange }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isAlertLoading, setIsAlertLoading] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleLogoClick = () => {
    router.push("/dashboard")
  }

  const handleHelpClick = () => {
    router.push("/help")
  }

  const handleSettingsClick = () => {
    router.push("/settings")
  }

  const handleEmergencyAlert = async () => {
    if (!profile?.emergency_email) {
      alert("Please set an emergency contact in your settings first.")
      router.push("/settings")
      return
    }

    if (
      !confirm(
        "Are you sure you want to send an emergency alert to your emergency contact?"
      )
    ) {
      return
    }

    setIsAlertLoading(true)
    try {
      const response = await fetch("/api/emergency/send-alert", {
        method: "POST",
      })

      if (response.ok) {
        alert(
          "Emergency alert sent to your emergency contact. Help is on the way."
        )
      } else {
        alert("Failed to send emergency alert. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Emergency alert error:", error)
      alert("Error sending emergency alert.")
    } finally {
      setIsAlertLoading(false)
    }
  }

  const userName = profile?.full_name || user?.email?.split("@")[0] || "User"

  if (!user) {
    return (
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
                MindfulChat
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your AI Mental Health Companion
              </p>
            </div>
          </div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-lg">
            <Brain className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-serif font-bold text-gray-900 dark:text-white">
              MindfulChat
            </h1>
          </div>
        </button>

        <nav className="flex items-center gap-1 sm:gap-2 flex-1 justify-center">
          <Button
            variant={currentView === "welcome" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange?.("welcome")}
            className={`${
              currentView === "welcome"
                ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                : "dark:hover:bg-gray-800"
            }`}
          >
            <Home className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>

          <Button
            variant={currentView === "analytics" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange?.("analytics")}
            className={`${
              currentView === "analytics"
                ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                : "dark:hover:bg-gray-800"
            }`}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Progress</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleHelpClick}
            className="dark:hover:bg-gray-800"
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Help</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSettingsClick}
            className="dark:hover:bg-gray-800"
          >
            <Settings className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Settings</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleEmergencyAlert}
            disabled={isAlertLoading}
            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
            title="Send emergency alert to your emergency contact"
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">SOS</span>
          </Button>
        </nav>

        {/* User Info and Sign Out */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {currentView === "chat" && (
            <Badge
              variant="secondary"
              className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 hidden sm:flex text-xs"
            >
              Active
            </Badge>
          )}

          <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 mx-2">
            {userName}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
