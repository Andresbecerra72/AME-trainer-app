import { redirect } from "next/navigation"
import { PrimaryButton } from "@/components/primary-button"
import { Plane, Users, BookOpen, Trophy } from "lucide-react"
import Link from "next/link"
import { getSession } from "@/features/auth/services/getSession";

export default async function LandingPage() {
  console.log("Rendering Landing Page...");
  const { user, profile } = await getSession()
 

  console.log("LANDING PAGE PROFILE:", profile);
  console.log("LANDING PAGE USER:", user);

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/95 to-primary/90">
      {/* Header */}
      <div className="p-6 flex justify-end">
        <Link href="/auth/login">
          <PrimaryButton className="bg-accent text-accent-foreground hover:bg-accent/90">Login</PrimaryButton>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full" />
          <div className="relative bg-accent/90 p-6 rounded-3xl shadow-2xl">
            <Plane className="w-16 h-16 text-primary" />
          </div>
        </div>

        <h1 className="text-5xl font-bold text-primary-foreground text-balance mb-4">AME Exam Trainer</h1>
        <p className="text-primary-foreground/80 text-xl mb-12 max-w-2xl text-balance">
          Master your Aircraft Maintenance Engineer certification with our comprehensive study platform and vibrant
          community
        </p>

        <Link href="/auth/login">
          <PrimaryButton className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-xl px-12 py-4 text-lg">
            Get Started
          </PrimaryButton>
        </Link>
      </div>

      {/* Features */}
      <div className="px-6 py-12 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-background/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/90 mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-primary-foreground mb-2">Comprehensive Study</h3>
            <p className="text-primary-foreground/70 text-sm">
              Access thousands of questions across all AME exam topics
            </p>
          </div>

          <div className="bg-background/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/90 mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-primary-foreground mb-2">Community Driven</h3>
            <p className="text-primary-foreground/70 text-sm">
              Learn from peers, share knowledge, and contribute questions
            </p>
          </div>

          <div className="bg-background/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/90 mb-4">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-primary-foreground mb-2">Track Progress</h3>
            <p className="text-primary-foreground/70 text-sm">
              Monitor your performance and identify areas for improvement
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 text-center text-primary-foreground/60 text-sm">Study smarter, pass faster</div>
    </div>
  )
}
