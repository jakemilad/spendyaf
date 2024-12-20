'use client'

import { FileText, ListFilter, ScrollText } from "lucide-react"

export function AISummaryAnimation() {
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 animate-pulse">
                <FileText className="h-5 w-5 animate-bounce text-primary" style={{ animationDelay: '0ms' }} />
                <ListFilter className="h-5 w-5 animate-bounce text-primary" style={{ animationDelay: '150ms' }} />
                <ScrollText className="h-5 w-5 animate-bounce text-primary" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-muted-foreground animate-pulse">
                Summarizing your statement...
            </span>
        </div>
    )
}