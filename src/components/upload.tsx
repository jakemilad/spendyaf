"use client"

import { FileUpload } from "@/components/file-upload";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DbStatement } from "@/app/types/types";
import { MotionWrapper } from "./motion-wrapper";

interface UploadProps {
    statements: DbStatement[]
    categories: string[]
}

export function Upload({statements, categories}: UploadProps) {
    const { data: session } = useSession();
    const router = useRouter();

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Upload Statement</h1>
                    <p className="text-muted-foreground">
                        Upload your transaction data to start tracking your expenses
                    </p>
                </div>
                <MotionWrapper
                    animation="fadeInUp"
                    delay={0.2}
                >
                    <div className="grid md:grid-cols-5 gap-8">
                        <div className="md:col-span-3">
                        <FileUpload onUploadSuccess={async () => {
                            router.push('/dashboard');
                        }} />
                        {statements.length > 0 && (
                            <div className="mt-4 text-sm text-muted-foreground text-center">
                                You have uploaded {statements.length} statement{statements.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="text-lg font-semibold mb-4">Available Categories</h3>
                            {categories.length > 0 ? (
                                <>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {categories.map((category) => (
                                            <div key={category} 
                                                className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                                {category}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-4">
                                        These categories will be used to automatically classify your transactions.
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground mb-4">
                                    No categories set up yet. Set up categories to automatically classify your transactions.
                                </p>
                            )}
                            <Link 
                                href="/categories" 
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
                            >
                                Customize Categories
                            </Link>
                        </div>
                    </div>
                </div>
                </MotionWrapper>
            </div>
        </div>
    )
}