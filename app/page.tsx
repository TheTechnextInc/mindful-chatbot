import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LogIn, UserPlus, Brain } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-gray-900 dark:text-white">MindfulChat</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Your AI Mental Health Companion</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center space-y-6">
              <div className="text-6xl mb-4">🧠</div>
              <h2 className="text-2xl font-serif text-gray-900 dark:text-white">Welcome to MindfulChat</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please sign in or create an account to start your mental health journey with personalized AI therapy
                support.
              </p>
              <div className="space-y-3">
                <Link href="/auth/login" className="w-full">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
