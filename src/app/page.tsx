import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { getUserStatements } from "@/app/actions"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"

export default async function Home() {
  const session = await getServerSession(authOptions)
  let targetPath = '/dashboard'

  if (session?.user) {
    const statements = await getUserStatements() || []
    if (statements.length > 0) {
      targetPath = '/dashboard'
    } else {
      targetPath = '/upload-statement'
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <section className="grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            You're Spendy AF, <br className="hidden sm:inline" />
            let's manage your transactions.
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            AI-powered transaction management tool that helps you
            keep track of your spending and manage your finances.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href={targetPath}
            className={buttonVariants()}
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  )
}
