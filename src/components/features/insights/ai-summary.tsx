'use client'

import { getAISummary } from "@/app/actions"
import { DbStatement } from "@/app/types/types"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { RefreshCcw, Copy, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react"
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
        setAiSummary("")
        setIsGenerated(false)
        setIsLoading(false)
        setError(null)
        setFeedback(null)
        setRetryCount(0)
        
        const cleanupCache = () => {
            const keys = Object.keys(localStorage)
            keys.filter(key => key.startsWith(CACHE_KEY_PREFIX)).forEach(key => {
                try {
                    const data = localStorage.getItem(key)
                    if (data) {
                        const { timestamp } = JSON.parse(data) as SummaryCache
                        const age = Date.now() - timestamp
                        if (age >= 24 * 60 * 60 * 1000) {
                            localStorage.removeItem(key)
                        }
                    }
                } catch (error) {
                    localStorage.removeItem(key)
                }
            })
        }
        cleanupCache()
        
        const uniqueCacheKey = `${CACHE_KEY_PREFIX}${statement.id}-${statement.file_name}-${statement.created_at}`
        const cachedData = localStorage.getItem(uniqueCacheKey)
        if (cachedData) {
            try {
                const { text, timestamp } = JSON.parse(cachedData) as SummaryCache
                const age = Date.now() - timestamp
                if (age < 24 * 60 * 60 * 1000) { 
                    setAiSummary(text)
                    setIsGenerated(true)
                }
            } catch (error) {
                console.error('Error parsing cached data:', error)
                localStorage.removeItem(uniqueCacheKey)
            }
        }
    }, [statement.id, statement.file_name, statement.created_at])

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
            const uniqueCacheKey = `${CACHE_KEY_PREFIX}${statement.id}-${statement.file_name}-${statement.created_at}`
            localStorage.setItem(uniqueCacheKey, JSON.stringify(cacheData))
            
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
                <Card className="flex flex-col h-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950/50">
                    <CardHeader className="pb-6">
                        {isGenerated ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                                        <Sparkles className="h-6 w-6 text-blue-500" />
                                        AI Analysis
                                    </CardTitle>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => generateSummary(true)}
                                                disabled={isLoading}
                                                className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950"
                                                aria-label="Refresh summary"
                                            >
                                                <RefreshCcw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                                                Refresh
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Generate new summary</TooltipContent>
                                    </Tooltip>
                                </div>
                                <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                                    Insights for <span className="font-semibold text-gray-800 dark:text-gray-200">{statement.file_name}</span>
                                </CardDescription>
                            </div>
                        ) : (
                            <div className="text-center space-y-3">
                                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-3">
                                    <Sparkles className="h-6 w-6 text-blue-500" />
                                    AI Analysis Ready
                                </CardTitle>
                                <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                                    Generate insights for <span className="font-semibold">{statement.file_name}</span>
                                </CardDescription>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="px-6">
                        {error ? (
                            <div className="text-center p-6 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                                <div className="text-red-600 dark:text-red-400 font-medium mb-3">{error}</div>
                                <Button
                                    variant="outline"
                                    onClick={() => generateSummary(false)}
                                    className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
                                >
                                    Try Again
                                </Button>
                            </div>
                        ) : isGenerated ? (
                            <div className="relative group">
                                <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-800 dark:to-gray-900/80 shadow-sm">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
                                    <div className="relative p-6">
                                        <div className="prose prose-gray dark:prose-invert max-w-none">
                                            <div className="text-gray-800 dark:text-gray-200 leading-7 text-base font-medium whitespace-pre-wrap">
                                                {aiSummary}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={handleCopy}
                                                    className="h-8 w-8 p-0 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm"
                                                    aria-label="Copy summary"
                                                >
                                                    <Copy className="h-3.5 w-3.5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Copy to clipboard</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-8">
                                {isLoading ? (
                                    <div className="space-y-4">
                                        <AISummaryAnimation />
                                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Analyzing your financial data...</p>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center border border-blue-200 dark:border-blue-800">
                                            <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <Button
                                            onClick={() => generateSummary(false)}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-base font-medium"
                                            disabled={isLoading}
                                        >
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Generate AI Summary
                                        </Button>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Get personalized insights about your spending patterns</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                    {isGenerated && !error && (
                        <CardFooter className="pt-6 px-6">
                            <div className="w-full">
                                <div className="flex items-center justify-center gap-4 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">How was this summary?</span>
                                    <div className="flex gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleFeedback('positive')}
                                                    disabled={feedback !== null}
                                                    aria-label="Positive feedback"
                                                    className={cn(
                                                        "border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/30",
                                                        feedback === 'positive' && "bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-700"
                                                    )}
                                                >
                                                    <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
                                                    Helpful
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>This was helpful</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleFeedback('negative')}
                                                    disabled={feedback !== null}
                                                    aria-label="Negative feedback"
                                                    className={cn(
                                                        "border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30",
                                                        feedback === 'negative' && "bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-700"
                                                    )}
                                                >
                                                    <ThumbsDown className="h-3.5 w-3.5 mr-1.5" />
                                                    Needs work
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>This needs improvement</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                                {feedback && (
                                    <div className="mt-3 text-center">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Thank you for your feedback!</span>
                                    </div>
                                )}
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </TooltipProvider>
    )
}
