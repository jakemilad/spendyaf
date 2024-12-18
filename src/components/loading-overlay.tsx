'use client'

import { LoadingAnimation } from "./loading-animation"
import { cn } from "@/lib/utils"

interface LoadingOverlayProps {
    isOpen: boolean
    message?: string
}

export function LoadingOverlay({ isOpen, message }: LoadingOverlayProps) {
    if (!isOpen) return null

    return (
        <div className={cn(
            "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
            "animate-in fade-in-0 duration-300",
        )}>
            <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                <div className="bg-card p-8 rounded-lg shadow-lg border w-[90vw] max-w-md">
                    <LoadingAnimation 
                        variant="processing" 
                        message={message} 
                    />
                </div>
            </div>
        </div>
    )
}
