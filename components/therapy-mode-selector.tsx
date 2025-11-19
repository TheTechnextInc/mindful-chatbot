"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star } from "lucide-react"

interface TherapyMode {
  id: string
  name: string
  description: string
  icon: string
  systemPrompt: string
  color: string
  popularity?: "popular" | "recommended"
}

interface TherapyModeSelectorProps {
  onModeSelect: (mode: TherapyMode) => void
}

const therapyModes: TherapyMode[] = [
  {
    id: "general",
    name: "General Support",
    description: "Compassionate listening and general mental health guidance for everyday challenges",
    icon: "💬",
    color: "emerald",
    popularity: "popular",
    systemPrompt: `You are Dr. Sarah, a warm and empathetic mental health counselor. Provide supportive, non-judgmental responses that help users process their emotions and thoughts. Use active listening techniques, validate feelings, and offer gentle guidance. Keep responses conversational and caring. End each response with a period.`,
  },
  {
    id: "cbt",
    name: "CBT Therapy",
    description: "Cognitive Behavioral Therapy techniques to identify and challenge negative thought patterns",
    icon: "🧠",
    color: "blue",
    popularity: "recommended",
    systemPrompt: `You are Dr. Marcus, a CBT specialist. Help users identify cognitive distortions, challenge negative thoughts, and develop healthier thinking patterns. Use CBT techniques like thought records, behavioral experiments, and cognitive restructuring. Be structured but supportive. End each response with a period.`,
  },
  {
    id: "mindfulness",
    name: "Mindfulness",
    description: "Present-moment awareness and meditation techniques for inner peace and clarity",
    icon: "🧘",
    color: "purple",
    systemPrompt: `You are Zen Master Lin, a mindfulness teacher. Guide users through present-moment awareness, breathing exercises, and meditation techniques. Help them observe thoughts without judgment and find inner calm. Use gentle, peaceful language. End each response with a period.`,
  },
  {
    id: "anxiety",
    name: "Anxiety Support",
    description: "Specialized support for managing anxiety, panic, and overwhelming worry",
    icon: "🌊",
    color: "teal",
    systemPrompt: `You are Dr. Emma, an anxiety specialist. Provide calming support for anxiety, panic attacks, and excessive worry. Teach grounding techniques, breathing exercises, and anxiety management strategies. Be reassuring and help users feel safe. End each response with a period.`,
  },
  {
    id: "depression",
    name: "Depression Support",
    description: "Understanding and gentle guidance for navigating depression and low mood",
    icon: "🌅",
    color: "orange",
    systemPrompt: `You are Dr. Hope, a depression specialist. Offer compassionate support for depression, low mood, and hopelessness. Help users find small steps forward, recognize their strengths, and build hope. Be patient, understanding, and encouraging. End each response with a period.`,
  },
  {
    id: "stress",
    name: "Stress Management",
    description: "Practical strategies for managing work, life, and relationship stress",
    icon: "⚡",
    color: "red",
    systemPrompt: `You are Coach Alex, a stress management expert. Help users identify stress triggers, develop coping strategies, and create better work-life balance. Provide practical, actionable advice with an energetic but supportive approach. End each response with a period.`,
  },
]

export function TherapyModeSelector({ onModeSelect }: TherapyModeSelectorProps) {
  const getColorClasses = (color: string) => {
    const colorMap = {
      emerald:
        "border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20",
      blue: "border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-700 dark:hover:bg-blue-900/20",
      purple:
        "border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-800 dark:hover:border-purple-700 dark:hover:bg-purple-900/20",
      teal: "border-teal-200 hover:border-teal-300 hover:bg-teal-50 dark:border-teal-800 dark:hover:border-teal-700 dark:hover:bg-teal-900/20",
      orange:
        "border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-800 dark:hover:border-orange-700 dark:hover:bg-orange-900/20",
      red: "border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-900/20",
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.emerald
  }

  const getBadgeColor = (color: string) => {
    const badgeMap = {
      emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
      blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
      purple: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
      teal: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200",
      orange: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
      red: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
    }
    return badgeMap[color as keyof typeof badgeMap] || badgeMap.emerald
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h3 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Therapeutic Approach
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Select the type of support that resonates with you today
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-500" />
            <span>Popular choice</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="h-5 px-2 text-xs">
              Recommended
            </Badge>
            <span>Highly effective</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {therapyModes.map((mode) => (
          <Card
            key={mode.id}
            className={`relative hover:shadow-lg transition-all duration-300 cursor-pointer group dark:bg-gray-800 dark:border-gray-700 ${getColorClasses(
              mode.color,
            )}`}
            onClick={() => onModeSelect(mode)}
          >
            {mode.popularity && (
              <div className="absolute -top-2 -right-2 z-10">
                {mode.popularity === "popular" ? (
                  <div className="bg-amber-500 text-white p-1 rounded-full">
                    <Star className="h-3 w-3" />
                  </div>
                ) : (
                  <Badge className="bg-emerald-600 text-white text-xs px-2 py-1">Recommended</Badge>
                )}
              </div>
            )}

            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{mode.icon}</div>
                  <div>
                    <CardTitle className="text-xl font-semibold group-hover:text-gray-900 dark:group-hover:text-white dark:text-white transition-colors">
                      {mode.name}
                    </CardTitle>
                  </div>
                </div>
              </div>
              <CardDescription className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {mode.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <Button
                className="w-full group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 bg-white border border-gray-200 text-gray-700 hover:border-emerald-600 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-emerald-600"
                onClick={(e) => {
                  e.stopPropagation()
                  onModeSelect(mode)
                }}
              >
                <span>Start Session</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 max-w-3xl mx-auto border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-center">💡 Tips for Your Session</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Be honest about your feelings - this is a safe space</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Take your time - there's no rush to respond</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>You can switch modes anytime during our conversation</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Your progress is automatically tracked and private</p>
          </div>
        </div>
      </div>
    </div>
  )
}
