'use client'
import { useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { getUserStatements } from "@/app/actions";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StatementSummary } from "@/components/statement-summary";

export default async function Dashboard() {
  const { data: session } = useSession();
  const [statements, setStatements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatements() {
      if (session?.user) {
        const data = await getUserStatements();
        setStatements(data || []);
        setLoading(false);
      }
    }
    fetchStatements();
  }, [session]);

  if (!session) return null;

  if (loading) {
    return (
      <div className="container mx-auto flex items-center justify-center h-[50vh]">
        <p>Loading...</p>
      </div>
    );
  }

  if (statements.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-8">Welcome, {session.user?.name}</h1>
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>No Statements Found</CardTitle>
            <CardDescription>
              You haven't uploaded any statements yet. Get started by uploading your first statement.
            </CardDescription>
          </CardHeader>
          <div className="p-6 flex justify-center">
            <Button asChild>
              <Link href="/upload-statement">Upload Your First Statement</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex gap-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-8">Welcome, {session.user?.name}</h1>
        <Card className="mb-6 max-w-xl">
          <CardHeader>
            <CardTitle>Need to add more statements?</CardTitle>
            <CardDescription>
              Keep your financial tracking up to date by uploading your latest statements.
            </CardDescription>
          </CardHeader>
          <div className="p-6 flex justify-center">
            <Button asChild>
              <Link href="/upload-statement">Upload New Statement</Link>
            </Button>
          </div>
        </Card>
      </div>

      <Suspense fallback={<div>Loading statements...</div>}>
        <StatementSummary statements={statements} />
      </Suspense>
    </div>
  );
}
