'use client'

import { getAISummary } from "@/app/actions"
import { DbStatement } from "@/app/types/types"
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { RefreshCcw } from "lucide-react";
import { useState } from "react"
import { AISummaryAnimation } from "@/components/animation-ai-summary"

interface AiSummaryProps {
    statement: DbStatement
}

export function AiSummary({ statement }: AiSummaryProps) {
    const [aiSummary, setAiSummary] = useState("");
    const [isGenerated, setIsGenerated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleAiSummary = async () => {
        try {
            setIsLoading(true);
            const response = await getAISummary(statement, false);
            setAiSummary(response)
            setIsGenerated(true)
        } catch (error) {
            console.log(error);
            setError(error instanceof Error ? error.message : "An error occurred");
            setIsLoading(false);
        }
    }

    const handleRefresh = async () => {
        try {
            setIsLoading(true);
            const response = await getAISummary(statement, true);
            setAiSummary(response);
        } catch (error) {
            console.log(error);
            setError(error instanceof Error ? error.message : "An error occurred");
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-full">
            <Card className="flex flex-col h-full">
                <CardHeader>
                    {isGenerated ? (
                        <div className="flex-1 text-center justify-between pb-2">
                            <CardTitle className="pb-2">
                                <span className="font-bold text-xl">{statement.file_name} AI Summary</span>
                            </CardTitle>
                            <CardDescription>
                                <span className="text-muted-foreground">
                                    Don't like this summary? Click here
                                    <RefreshCcw onClick={handleRefresh} />
                                </span>
                            </CardDescription>
                        </div>
                    ) : (
                        <div className="flex-1 text-center items-center">
                            <CardTitle className="pb-2">
                                <span className="font-bold text-xl">Click to Generate Summary for {statement.file_name}</span>
                            </CardTitle>
                        </div>
                    )}
                    {/* <span className="font-medium">{transaction.Merchant}</span>
                        <span className="text-muted-foreground">${transaction.Amount}</span> */}
                </CardHeader>
                <CardContent>
                    {error ? (
                        <div className="text-center text-red-500">{error}</div>
                    ) : isGenerated ? (
                        <div className="text-center">
                            <span>{aiSummary}</span>
                        </div>
                    ) : (
                        <div className="flex-col items-center flex">
                            {isLoading ? (
                                <AISummaryAnimation />
                            ) : (
                                <Button
                                    onClick={handleAiSummary}
                                    className="flex items-center gap-2 hover:bg-secondary"
                                    variant="default"
                                >
                                    Summarize
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
