"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { MessageCircle, Clock, Target, Brain, Zap, Award } from "lucide-react"

interface AnalyticsDashboardProps {
  user: User
}

interface AnalyticsData {
  totalSessions: number
  totalMessages: number
  averageSessionLength: number
  mostUsedMode: string
  weeklyProgress: Array<{ day: string; sessions: number; messages: number }>
  modeUsage: Array<{ mode: string; count: number; color: string }>
  recentSessions: Array<{
    id: string
    therapy_mode: string
    created_at: string
    message_count: number
  }>
  improvementMetrics: {
    consistency: number
    engagement: number
    progress: number
  }
}

const THERAPY_MODE_COLORS = {
  "General Support": "#10b981",
  "CBT Therapy": "#3b82f6",
  Mindfulness: "#8b5cf6",
  "Anxiety Support": "#f59e0b",
  "Depression Support": "#ef4444",
  "Stress Management": "#06b6d4",
}

export function AnalyticsDashboard({ user }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const supabase = createClient()
      const now = new Date()
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

      // Fetch sessions
      const { data: sessions } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })

      // Fetch messages
      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())

      // Fetch analytics data
      const { data: analyticsData } = await supabase
        .from("user_analytics")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())

      if (sessions && messages && analyticsData) {
        // Process data
        const modeUsage = Object.entries(
          sessions.reduce((acc: Record<string, number>, session) => {
            acc[session.therapy_mode] = (acc[session.therapy_mode] || 0) + 1
            return acc
          }, {}),
        ).map(([mode, count]) => ({
          mode,
          count: count as number,
          color: THERAPY_MODE_COLORS[mode as keyof typeof THERAPY_MODE_COLORS] || "#6b7280",
        }))

        // Weekly progress
        const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
          const dayStart = new Date(date.setHours(0, 0, 0, 0))
          const dayEnd = new Date(date.setHours(23, 59, 59, 999))

          const daySessions = sessions.filter(
            (s) => new Date(s.created_at) >= dayStart && new Date(s.created_at) <= dayEnd,
          ).length

          const dayMessages = messages.filter(
            (m) => new Date(m.created_at) >= dayStart && new Date(m.created_at) <= dayEnd,
          ).length

          return {
            day: dayName,
            sessions: daySessions,
            messages: dayMessages,
          }
        }).reverse()

        // Recent sessions with message counts
        const recentSessions = sessions.slice(0, 5).map((session) => ({
          ...session,
          message_count: messages.filter((m) => m.session_id === session.id).length,
        }))

        // Calculate improvement metrics
        const totalInteractions = analyticsData.length
        const consistencyScore = Math.min((sessions.length / (daysAgo / 7)) * 20, 100) // Sessions per week
        const engagementScore = Math.min((messages.length / sessions.length) * 10, 100) // Messages per session
        const progressScore = Math.min(totalInteractions * 2, 100) // Overall activity

        setAnalytics({
          totalSessions: sessions.length,
          totalMessages: messages.length,
          averageSessionLength: messages.length / sessions.length || 0,
          mostUsedMode: modeUsage[0]?.mode || "General Support",
          weeklyProgress,
          modeUsage,
          recentSessions,
          improvementMetrics: {
            consistency: Math.round(consistencyScore),
            engagement: Math.round(engagementScore),
            progress: Math.round(progressScore),
          },
        })
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Your Progress</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">Start chatting to see your progress analytics!</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Your Mental Wellness Journey</h2>
          <p className="text-gray-600 mt-1">Track your progress and insights</p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalSessions}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages Exchanged</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalMessages}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Session Length</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(analytics.averageSessionLength)}</p>
                <p className="text-xs text-gray-500">messages per session</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Preferred Mode</p>
                <p className="text-lg font-bold text-gray-900">{analytics.mostUsedMode}</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Improvement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            Wellness Metrics
          </CardTitle>
          <CardDescription>Your progress across key mental health indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Consistency</span>
                <span className="text-sm text-gray-600">{analytics.improvementMetrics.consistency}%</span>
              </div>
              <Progress value={analytics.improvementMetrics.consistency} className="h-2" />
              <p className="text-xs text-gray-500">Regular engagement with therapy sessions</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Engagement</span>
                <span className="text-sm text-gray-600">{analytics.improvementMetrics.engagement}%</span>
              </div>
              <Progress value={analytics.improvementMetrics.engagement} className="h-2" />
              <p className="text-xs text-gray-500">Depth of conversation in sessions</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">{analytics.improvementMetrics.progress}%</span>
              </div>
              <Progress value={analytics.improvementMetrics.progress} className="h-2" />
              <p className="text-xs text-gray-500">Total therapeutic activity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Your therapy sessions and messages over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#10b981" name="Sessions" />
                <Bar dataKey="messages" fill="#3b82f6" name="Messages" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Therapy Mode Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Therapy Mode Preferences</CardTitle>
            <CardDescription>Distribution of your therapy session types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.modeUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ mode, percent }) => `${mode} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.modeUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>Your latest therapy conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-emerald-100">
                    <Brain className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">{session.therapy_mode}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(session.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">{session.message_count} messages</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
