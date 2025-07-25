import { FileText, ArrowUpDown, RefreshCcw, PieChart, Brain, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Step = {
  icon: typeof FileText;
  label: string;
  delay: number;
};

interface LoadingAnimationProps {
  steps: Step[];
  currentStep: number;
}

export function LoadingAnimation({ steps, currentStep }: LoadingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-6 gap-6">
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {steps.map(({ icon: Icon, label }, index) => (
          <div 
            key={label}
            className={cn(
              "flex items-center gap-3 text-sm transition-opacity duration-300",
              index <= currentStep ? "opacity-100" : "opacity-50"
            )}
          >
            <Icon 
              className={cn(
                "h-5 w-5 transition-colors",
                index === currentStep ? "animate-pulse text-primary" : "text-muted-foreground"
              )}
            />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Step {currentStep + 1} of {steps.length}
      </p>
    </div>
  );
}