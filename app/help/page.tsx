"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Phone, MessageSquare, Globe } from "lucide-react"

export default function HelpPage() {
  const router = useRouter()

  const resources = [
    {
      title: "National Suicide Prevention Lifeline",
      description: "24/7 crisis support and prevention",
      phone: "988",
      icon: Phone,
      color: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
    },
    {
      title: "Crisis Text Line",
      description: "Text HOME to 741741",
      phone: "Text 741741",
      icon: MessageSquare,
      color: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    },
    {
      title: "International Association for Suicide Prevention",
      description: "Find helplines worldwide",
      url: "https://www.iasp.info/resources/Crisis_Centres/",
      icon: Globe,
      color: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    },
    {
      title: "NAMI Helpline",
      description: "Mental health support and resources",
      phone: "1-800-950-NAMI (6264)",
      icon: Phone,
      color: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    },
    {
      title: "SAMHSA National Helpline",
      description: "Substance abuse and mental health services",
      phone: "1-800-662-4357",
      icon: Phone,
      color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400",
    },
    {
      title: "Anxiety and Depression Association of America",
      description: "Resources and support for anxiety and depression",
      url: "https://adaa.org/",
      icon: Globe,
      color: "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-gray-200 dark:hover:bg-gray-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Help & Support</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          If you're struggling with mental health, here are some resources that can help.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource, index) => {
            const Icon = resource.icon
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition dark:bg-gray-800">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${resource.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-gray-900 dark:text-white">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{resource.description}</p>
                  {resource.phone && (
                    <a
                      href={`tel:${resource.phone.replace(/\D/g, "")}`}
                      className="block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-center font-medium transition"
                    >
                      Call: {resource.phone}
                    </a>
                  )}
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-center font-medium transition"
                    >
                      Visit Website
                    </a>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="border-0 shadow-lg mt-8 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Remember</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              You are not alone. Seeking help is a sign of strength, not weakness. MindfulChat is designed to provide
              support, but if you're in crisis, please reach out to a mental health professional or emergency service
              immediately.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
