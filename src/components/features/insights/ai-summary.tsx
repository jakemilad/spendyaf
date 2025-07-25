'use client'

import { getAISummary } from "@/app/actions"
import { DbStatement } from "@/app/types/types"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { RefreshCcw, Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import { AISummaryAnimation } from "@/components/animations/animation-ai-summary"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const CACHE_KEY_PREFIX = 'ai-summary-'
const RATE_LIMIT_DURATION = 30000 
const MAX_RETRIES = 3

interface AiSummaryProps {
    statement: DbStatement
}

interface SummaryCache {
    text: string
    timestamp: number
}

export function AiSummary({ statement }: AiSummaryProps) {
    const [aiSummary, setAiSummary] = useState("")
    const [isGenerated, setIsGenerated] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [retryCount, setRetryCount] = useState(0)
    const [lastRequestTime, setLastRequestTime] = useState(0)
    const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)

    useEffect(() => {
        const cachedData = localStorage.getItem(`${CACHE_KEY_PREFIX}${statement.id}`)
        if (cachedData) {
            const { text, timestamp } = JSON.parse(cachedData) as SummaryCache
            const age = Date.now() - timestamp
            if (age < 24 * 60 * 60 * 1000) { 
                setAiSummary(text)
                setIsGenerated(true)
            }
        }
    }, [statement.id])

    const handleError = useCallback((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : "An error occurred"
        setError(errorMessage)
        toast.error("Error", {
            description: errorMessage,
        })
        setIsLoading(false)
    }, [])

    const checkRateLimit = useCallback(() => {
        const now = Date.now()
        if (now - lastRequestTime < RATE_LIMIT_DURATION) {
            throw new Error(`Please wait ${Math.ceil((RATE_LIMIT_DURATION - (now - lastRequestTime)) / 1000)} seconds before trying again`)
        }
        return true
    }, [lastRequestTime])

    const generateSummary = useCallback(async (forceRefresh = false) => {
        try {
            checkRateLimit()
            setIsLoading(true)
            setError(null)
            setFeedback(null)

            const response = await getAISummary(statement, forceRefresh)
            
            const cacheData: SummaryCache = {
                text: response,
                timestamp: Date.now(),
            }
            localStorage.setItem(`${CACHE_KEY_PREFIX}${statement.id}`, JSON.stringify(cacheData))
            
            setAiSummary(response)
            setIsGenerated(true)
            setLastRequestTime(Date.now())
            setRetryCount(0)
        } catch (error) {
            if (retryCount < MAX_RETRIES) {
                setRetryCount(prev => prev + 1)
                setTimeout(() => generateSummary(forceRefresh), 1000 * retryCount)
            } else {
                handleError(error)
            }
        } finally {
            setIsLoading(false)
        }
    }, [statement, retryCount, handleError, checkRateLimit])

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(aiSummary)
        toast.success("Copied!", {
            description: "Summary copied to clipboard",
        })
    }, [aiSummary])

    const handleFeedback = useCallback((type: 'positive' | 'negative') => {
        setFeedback(type)
        toast.success("Thank you!", {
            description: "Your feedback helps us improve.",
        })
    }, [])

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full">
                <Card className="flex flex-col h-full">
                    <CardHeader>
                        {isGenerated ? (
                            <div className="flex-1 text-left justify-between pb-2">
                                <CardTitle className="pb-2">
                                    <span className="font-bold text-xl">{statement.file_name} AI Summary</span>
                                </CardTitle>
                                <CardDescription>
                                    <span className="text-muted-foreground flex items-center justify-center gap-2">
                                        Don't like this summary?
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => generateSummary(true)}
                                                    disabled={isLoading}
                                                    aria-label="Refresh summary"
                                                >
                                                    <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Generate new summary</TooltipContent>
                                        </Tooltip>
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
                    </CardHeader>
                    <CardContent>
                        {error ? (
                            <div className="text-center text-red-500 p-4 rounded-lg bg-red-50">
                                <p>{error}</p>
                                <Button
                                    variant="outline"
                                    onClick={() => generateSummary(false)}
                                    className="mt-2"
                                >
                                    Try Again
                                </Button>
                            </div>
                        ) : isGenerated ? (
                            <div className="text-left relative group">
                                <p className="text-base leading-relaxed p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out">{aiSummary}</p>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleCopy}
                                                aria-label="Copy summary"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Copy to clipboard</TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-col items-center flex">
                                {isLoading ? (
                                    <AISummaryAnimation />
                                ) : (
                                    <Button
                                        onClick={() => generateSummary(false)}
                                        className="flex items-center gap-2 hover:bg-secondary"
                                        variant="default"
                                        disabled={isLoading}
                                    >
                                        Summarize
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                    {isGenerated && !error && (
                        <CardFooter className="justify-center gap-4">
                            <span className="text-sm text-muted-foreground">Was this summary helpful?</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleFeedback('positive')}
                                        disabled={feedback !== null}
                                        aria-label="Positive feedback"
                                        className={cn(feedback === 'positive' && "text-green-600")}
                                    >
                                        <ThumbsUp className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>This was helpful</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleFeedback('negative')}
                                        disabled={feedback !== null}
                                        aria-label="Negative feedback"
                                        className={cn(feedback === 'negative' && "text-red-600")}
                                    >
                                        <ThumbsDown className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>This needs improvement</TooltipContent>
                            </Tooltip>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </TooltipProvider>
    )
}
