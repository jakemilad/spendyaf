import { HeroSection, FeaturesSection, CTASection } from "@/components/animations/animated-sections"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/auth.config"
import { getUserStatements } from "@/app/actions"

export default async function Home() {
  const session = await getServerSession(authOptions)
  let targetPath = '/dashboard'

  if (session?.user) {
    const statements = await getUserStatements() || []
    targetPath = statements.length > 0 ? '/dashboard' : '/upload-statement'
  }

  return (
    <>
      <HeroSection targetPath={targetPath} />
      <FeaturesSection />
      {/* <CTASection targetPath={targetPath} /> */}
    </>
  )
}
