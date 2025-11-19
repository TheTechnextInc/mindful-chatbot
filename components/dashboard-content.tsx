"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { WelcomeScreen } from "./welcome-screen"
import { TherapyModeSelector } from "./therapy-mode-selector"
import { ChatInterface } from "./chat-interface"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { Header } from "./header"

interface DashboardContentProps {
  user: User
  profile: any
}

export function DashboardContent({ user, profile }: DashboardContentProps) {
  const [currentView, setCurrentView] = useState<"welcome" | "chat" | "analytics">("welcome")
  const [selectedMode, setSelectedMode] = useState<any>(null)

  const handleModeSelect = (mode: any) => {
    setSelectedMode(mode)
    setCurrentView("chat")
  }

  const handleBackToModes = () => {
    setCurrentView("welcome")
    setSelectedMode(null)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 bg-emerald-600 rounded-full animate-pulse mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header user={user} profile={profile} currentView={currentView} onViewChange={setCurrentView} />

      <main className="container mx-auto px-4 py-8">
        {currentView === "welcome" && (
          <>
            <WelcomeScreen user={user} profile={profile} />
            <TherapyModeSelector onModeSelect={handleModeSelect} />
          </>
        )}

        {currentView === "chat" && selectedMode && (
          <ChatInterface mode={selectedMode} user={user} onBack={handleBackToModes} />
        )}

        {currentView === "analytics" && <AnalyticsDashboard user={user} />}
      </main>
    </div>
  )
}
