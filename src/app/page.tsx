import { HeroSection, FeaturesSection, CTASection } from "@/components/animated-sections"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/auth.config"
import { getUserStatements } from "@/app/actions"
import Insights from "@/components/ui/Insights.svg"

export default async function Home() {
  const session = await getServerSession(authOptions)
  let targetPath = '/dashboard'

  if (session?.user) {
    const statements = await getUserStatements() || []
    targetPath = statements.length > 0 ? '/dashboard' : '/upload-statement'
  }

  const features = [
    {
      title: "Smart Transaction Summary",
      description: "AI-powered categorization breaks down your spending with precision",
      image: Insights,
      alt: "Statement summary showing categorized transactions"
    },
    {
      title: "Spending Distribution",
      description: "Interactive donut chart visualizes your spending patterns",
      image: "/piechart.png",
      alt: "Donut chart showing spending distribution"
    },
    {
      title: "Time Series Analysis",
      description: "Track spending trends with daily transaction timeline",
      image: "/timeseries.png",
      alt: "Time series graph of spending"
    },
    {
      title: "Smart Insights",
      description: "Get personalized spending insights and recommendations",
      image: "/insights.png",
      alt: "Monthly insights dashboard"
    }
  ]

  return (
    <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <HeroSection targetPath={targetPath} />
      {/* <FeaturesSection features={features} /> */}
      {/* <CTASection targetPath={targetPath} /> */}
    </div>
  )
}
