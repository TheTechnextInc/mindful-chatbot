"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, Share, Loader2, MessageCircle, ArrowLeft, Copy, Check, RefreshCw, Mic, Volume2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface TherapyMode {
  id: string
  name: string
  description: string
  icon: string
  systemPrompt: string
  color: string
}

interface ChatInterfaceProps {
  mode: TherapyMode
  user: User
  onBack: () => void
}

function getWelcomeMessage(mode: TherapyMode): string {
  const welcomeMessages = {
    general: "Hi, I'm Dr. Sarah. I'm here to listen and support you. What's weighing on your mind today?",
    cbt: "I'm Dr. Marcus, your CBT specialist. Let's identify and challenge those thoughts together. What thought pattern is bothering you?",
    mindfulness:
      "Welcome. I'm Zen Master Lin. Take a deep breath with me. What's pulling your attention away from this moment?",
    anxiety:
      "I'm Dr. Emma. Your anxiety is valid, and we'll work through this together. What's making you feel anxious right now?",
    depression: "Hello, I'm Dr. Hope. You've taken a brave step by being here. How are you feeling in this moment?",
    stress: "Hey there! I'm Coach Alex. Let's tackle that stress head-on. What's your biggest stressor today?",
  }

  return welcomeMessages[mode.id as keyof typeof welcomeMessages] || welcomeMessages.general
}

export function ChatInterface({ mode, user, onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: getWelcomeMessage(mode),
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (user?.id) {
      createSession()
    }
  }, [user])

  const createSession = async () => {
    try {
      if (!user?.id) {
        console.error("User not available for session creation")
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          therapy_mode: mode.name,
          title: `${mode.name} Session`,
        })
        .select()
        .single()

      if (error) throw error
      setSessionId(data.id)

      // Track session start
      await supabase.from("user_analytics").insert({
        user_id: user.id,
        session_id: data.id,
        therapy_mode: mode.name,
        interaction_type: "session_started",
      })
    } catch (error) {
      console.error("Error creating session:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (!user?.id) {
      console.error("User not available for chat")
      return
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input.trim(),
          systemPrompt: mode.systemPrompt,
          mode: mode.name,
          userId: user.id,
          sessionId: sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      speakMessage(data.response)
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        role: "assistant",
        content:
          "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. If you're in crisis, please reach out to a mental health professional or emergency services.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const copyMessage = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageIndex(index)
      toast({
        title: "Copied to clipboard",
        description: "Message copied successfully",
      })
      setTimeout(() => setCopiedMessageIndex(null), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message to clipboard",
        variant: "destructive",
      })
    }
  }

  const shareMessage = (content: string) => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(content)}`
    window.open(whatsappUrl, "_blank")
  }

  const regenerateResponse = async () => {
    if (messages.length < 2) return

    const lastUserMessage = messages[messages.length - 2]
    if (lastUserMessage.role !== "user") return

    if (!user?.id) {
      console.error("User not available for regeneration")
      return
    }

    setIsLoading(true)
    // Remove the last assistant message
    setMessages((prev) => prev.slice(0, -1))

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: lastUserMessage.content,
          systemPrompt: mode.systemPrompt,
          mode: mode.name,
          userId: user.id,
          sessionId: sessionId,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      speakMessage(data.response)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Failed to regenerate",
        description: "Could not generate a new response",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const speakMessage = (text: string) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    }
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false

      recognitionRef.current.onstart = () => {
        setIsListening(true)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.onresult = (event: any) => {
        let transcript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setInput((prev) => prev + " " + transcript)
      }
    }
  }, [])

  const handleVoiceInput = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-white/50">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{mode.icon}</div>
                <div>
                  <CardTitle className="text-xl font-serif text-gray-900">{mode.name}</CardTitle>
                  <p className="text-sm text-gray-600">{mode.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 text-white">Active Session</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="min-h-[600px] flex flex-col shadow-lg border-0">
        <CardContent className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[600px]">
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <MessageCircle className="h-5 w-5 text-emerald-600" />
                </div>
              )}

              <div className={`max-w-[75%] space-y-2 ${message.role === "user" ? "order-1" : ""}`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === "user" ? "bg-emerald-600 text-white ml-auto" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
                        onClick={() => copyMessage(message.content, index)}
                      >
                        {copiedMessageIndex === index ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Copy className="h-3 w-3 mr-1" />
                        )}
                        {copiedMessageIndex === index ? "Copied" : "Copy"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
                        onClick={() => shareMessage(message.content)}
                      >
                        <Share className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                      {index === messages.length - 1 && !isLoading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
                          onClick={regenerateResponse}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Regenerate
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
                        onClick={() => speakMessage(message.content)}
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Speak
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {message.role === "user" && (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-medium text-gray-700">You</span>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <p className="text-sm text-gray-600">Thinking...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t bg-gray-50 dark:bg-gray-800 p-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="flex-1 min-h-[60px] max-h-[120px] resize-none border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              disabled={isLoading}
            />
            <Button
              type="button"
              onClick={handleVoiceInput}
              disabled={isLoading}
              className={`self-end h-[60px] px-4 ${
                isListening ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
              title="Click to start/stop voice input"
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="self-end bg-emerald-600 hover:bg-emerald-700 h-[60px] px-6"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
            Press Enter to send, Shift+Enter for new line • Click the microphone for voice input • Your conversation is
            private and secure
          </p>
        </div>
      </Card>
    </div>
  )
}
