'use client'

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface MotionWrapperProps {
  children: ReactNode
  className?: string
  animation?: "fadeIn" | "fadeInUp" | "slideIn" | "scale"
  delay?: number
}

const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.3 }
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.3 }
  }
}

export function MotionWrapper({ 
  children, 
  className, 
  animation = "fadeIn",
  delay = 0 
}: MotionWrapperProps) {
  const selectedAnimation = animations[animation]
  
  return (
    <motion.div
      className={className}
      initial={selectedAnimation.initial}
      animate={selectedAnimation.animate}
      transition={{
        ...selectedAnimation.transition,
        delay
      }}
    >
      {children}
    </motion.div>
  )
}