import { PrimaryButton } from "@/components/primary-button";
import { getSession } from "@/features/auth/services/getSession";
import { BookOpen, Plane, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { user } = await getSession()
 
  if (user) {
    redirect("/protected/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/95 to-primary/90">
      {/* Header */}
      <div className="p-4 flex justify-end">
        <Link href="/public/auth/login">
          <PrimaryButton className="bg-accent text-accent-foreground hover:bg-accent/90 text-sm">Login</PrimaryButton>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full" />
          <div className="relative bg-accent/90 p-4 rounded-3xl shadow-2xl">
            <Plane className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground text-balance mb-3">AME Exam Trainer</h1>
        <p className="text-primary-foreground/80 text-sm sm:text-base mb-8 max-w-2xl text-balance">
          Master your Aircraft Maintenance Engineer certification with our comprehensive study platform and vibrant
          community
        </p>

        <Link href="/public/auth/login">
          <PrimaryButton className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-xl px-8 py-3 text-base">
            Get Started
          </PrimaryButton>
        </Link>
      </div>

      {/* Features */}
      <div className="px-4 py-8 max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-background/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/90 mb-3">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-primary-foreground mb-2">Comprehensive Study</h3>
            <p className="text-primary-foreground/70 text-xs">
              Access thousands of questions across all AME exam topics
            </p>
          </div>

          <div className="bg-background/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/90 mb-3">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-primary-foreground mb-2">Community Driven</h3>
            <p className="text-primary-foreground/70 text-xs">
              Learn from peers, share knowledge, and contribute questions
            </p>
          </div>

          <div className="bg-background/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/90 mb-3">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-primary-foreground mb-2">Track Progress</h3>
            <p className="text-primary-foreground/70 text-xs">
              Monitor your performance and identify areas for improvement
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center text-primary-foreground/60 text-xs">Study smarter, pass faster</div>
    </div>
  )
}
