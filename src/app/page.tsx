import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { getUserStatements } from "@/app/actions"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/auth.config"

export default async function Home() {
  const session = await getServerSession(authOptions)
  let targetPath = '/dashboard'

  if (session?.user) {
    const statements = await getUserStatements() || []
    targetPath = statements.length > 0 ? '/dashboard' : '/upload-statement'
  }

  return (
    <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            You're Spendy AF, <br className="hidden sm:inline" />
            let's manage your transactions.
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            Transform your financial data into actionable insights with our AI-powered expense analyzer.
          </p>
          <div className="mt-4 flex gap-4">
            <Link href={targetPath} className={buttonVariants({ size: "lg" })}>
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Summary Table Feature */}
          <div className="group relative rounded-xl border p-6 shadow-sm transition-all hover:shadow-md">
            <div className="aspect-video overflow-hidden rounded-lg">
              <img 
                src="/dashboard-summary.png" 
                alt="Transaction Summary Table"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="mt-4 text-xl font-semibold">Smart Transaction Categorization</h3>
            <p className="text-muted-foreground">Automatically categorizes your spending with AI precision</p>
          </div>

          {/* Pie Chart Feature */}
          <div className="group relative rounded-xl border p-6 shadow-sm transition-all hover:shadow-md">
            <div className="aspect-video overflow-hidden rounded-lg">
              <img 
                src="/spending-distribution.png" 
                alt="Spending Distribution Chart"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="mt-4 text-xl font-semibold">Visual Spending Breakdown</h3>
            <p className="text-muted-foreground">See your spending patterns at a glance with interactive charts</p>
          </div>

          {/* Time Series Feature */}
          <div className="group relative rounded-xl border p-6 shadow-sm transition-all hover:shadow-md">
            <div className="aspect-video overflow-hidden rounded-lg">
              <img 
                src="/time-series.png" 
                alt="Spending Over Time"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="mt-4 text-xl font-semibold">Spending Trends</h3>
            <p className="text-muted-foreground">Track your daily spending patterns with interactive timelines</p>
          </div>

          {/* AI Insights Feature */}
          <div className="group relative rounded-xl border p-6 shadow-sm transition-all hover:shadow-md">
            <div className="aspect-video overflow-hidden rounded-lg">
              <img 
                src="/ai-insights.png" 
                alt="AI-Powered Insights"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="mt-4 text-xl font-semibold">AI-Powered Insights</h3>
            <p className="text-muted-foreground">Get personalized recommendations to optimize your spending</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="my-16 rounded-2xl bg-slate-950 px-6 py-16 text-center text-white">
        <h2 className="text-2xl font-bold md:text-3xl">Made by Jake Milad</h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">
          Some links:
        </p>
        <Link 
          href={targetPath}
          className={buttonVariants({ variant: "secondary", size: "lg", className: "mt-6" })}
        >
          LinkedIn
        </Link>
      </section>
    </div>
  )
}
