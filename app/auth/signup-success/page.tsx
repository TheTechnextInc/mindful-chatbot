import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-emerald-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-emerald-900">Account Created Successfully!</CardTitle>
            <CardDescription>Please check your email to verify your account</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Mail className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-800">
                We've sent a verification email to your inbox. Please click the link in the email to activate your
                account.
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>Didn't receive the email?</p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>Check your spam/junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Wait a few minutes and try again</li>
              </ul>
            </div>

            <div className="pt-4">
              <Link href="/auth/login">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Return to Sign In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
