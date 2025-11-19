import { Card, CardContent } from "@/components/ui/card"
import { Shield, Clock, Heart, Brain, Sparkles } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface WelcomeScreenProps {
  user?: User | null
  profile?: any
}

export function WelcomeScreen({ user, profile }: WelcomeScreenProps) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const userName = profile?.full_name || user?.email?.split("@")[0] || "there"

  if (!user) {
    return (
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-4 rounded-full">
              <Brain className="h-10 w-10 text-emerald-600" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-4 rounded-full">
            <Brain className="h-10 w-10 text-emerald-600" />
          </div>
        </div>
        <h2 className="text-4xl font-serif font-bold text-gray-900 text-balance">
          {getGreeting()}, {userName}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
          Welcome to your personal mental wellness companion. I'm here to provide compassionate support and guidance
          tailored to your needs. Choose a therapeutic approach that feels right for you today.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-6 text-center space-y-3">
            <div className="bg-emerald-100 p-3 rounded-full w-fit mx-auto">
              <Shield className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Safe & Confidential</h3>
            <p className="text-sm text-gray-600">Your conversations are encrypted and completely private</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6 text-center space-y-3">
            <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Available 24/7</h3>
            <p className="text-sm text-gray-600">Mental health support whenever you need it most</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6 text-center space-y-3">
            <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Personalized Care</h3>
            <p className="text-sm text-gray-600">AI-powered responses tailored to your unique needs</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 rounded-xl p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-gray-900">Your Wellness Journey</h3>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          Every conversation is a step forward. You're taking control of your mental health, and that's something to be
          proud of.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="text-center">
            <div className="font-semibold text-emerald-600">6</div>
            <div className="text-gray-600">Therapy Modes</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">24/7</div>
            <div className="text-gray-600">Availability</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-600">∞</div>
            <div className="text-gray-600">Conversations</div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto">
        <p className="text-sm text-amber-800">
          <strong className="text-amber-900">Important:</strong> This AI assistant provides supportive guidance but is
          not a replacement for professional mental health care. If you're experiencing a crisis, please contact
          emergency services or a mental health professional immediately.
        </p>
      </div>
    </div>
  )
}
