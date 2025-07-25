'use client'

import { LoadingAnimation } from "@/components/loading/loading-animation"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { FileText, ArrowUpDown, Brain, Calculator, PieChart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle } from "lucide-react"

interface LoadingOverlayProps {
    isOpen: boolean
    message?: string
}

export function LoadingOverlay({ isOpen, message = "Processing..." }: LoadingOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [isCompleted, setIsCompleted] = useState(false)

    const steps = [
        { icon: FileText, label: "Sending prompt to AI", delay: 0 },
        { icon: ArrowUpDown, label: "Processing transactions", delay: 2 },
        { icon: Brain, label: "Parsing results", delay: 4 },
        { icon: Calculator, label: "Calculating totals", delay: 6 },
        { icon: PieChart, label: "Generating insights", delay: 8 },
    ]

    useEffect(() => {
        let timers: NodeJS.Timeout[] = []
        if (isOpen) {
            steps.forEach((step, index) => {
                const timer = setTimeout(() => {
                    setCurrentStep(index)
                    if (index === steps.length - 1) {
                        // Delay before showing completion
                        const completionTimer = setTimeout(() => {
                            setIsCompleted(true)
                        }, 1000)
                        timers.push(completionTimer)
                    }
                }, step.delay * 1000)
                timers.push(timer)
            })
        } else {
            setCurrentStep(0)
            setIsCompleted(false)
        }

        return () => {
            timers.forEach(timer => clearTimeout(timer))
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                key="overlay"
                className={cn(
                    "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="p-8 rounded-lg shadow-lg border w-[90vw] max-w-md relative"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: isCompleted ? '100%' : `${((currentStep + 1) / steps.length) * 100}%` }}
                            transition={{ ease: "linear", duration: 1 }}
                        />
                    </div>

                    {!isCompleted ? (
                        <>
                            <LoadingAnimation 
                                steps={steps}
                                currentStep={currentStep}
                            />
                            {message && (
                                <p className="mt-4 text-sm text-gray-600">
                                    {message}
                                </p>
                            )}
                        </>
                    ) : (
                        <motion.div
                            className="flex flex-col items-center justify-center p-6"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <CheckCircle className="h-12 w-12 text-green-500 animate-bounce" />
                            <p className="mt-4 text-lg text-green-600">All steps completed!</p>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
