import { FileText, ArrowUpDown, RefreshCcw, PieChart, Brain, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = {
  icon: typeof FileText;
  label: string;
  delay: number;
};

const steps: Step[] = [
  { icon: FileText, label: "Fetching statement data...", delay: 0 },
  { icon: ArrowUpDown, label: "Processing transactions...", delay: 0.2 },
  { icon: Brain, label: "Categorizing merchants...", delay: 0.4 },
  { icon: Calculator, label: "Calculating totals...", delay: 0.6 },
  { icon: PieChart, label: "Generating insights...", delay: 0.8 },
];

export function LoadingAnimation({ 
  message = "Loading...",
  variant = "default"
}: { 
  message?: string;
  variant?: "default" | "processing";
}) {
  if (variant === "default") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4">
        <div className="flex items-center gap-2">
          <RefreshCcw className="h-6 w-6 animate-spin text-primary" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-6 gap-6">
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {steps.map(({ icon: Icon, label, delay }, index) => (
          <div 
            key={label}
            className={cn(
              "flex items-center gap-3 text-sm transition-opacity duration-300",
              "animate-in fade-in-0 slide-in-from-left-5",
            )}
            style={{ animationDelay: `${delay}s` }}
          >
            <Icon 
              className={cn(
                "h-5 w-5 transition-colors",
                "animate-bounce",
              )}
              style={{ 
                animationDelay: `${delay}s`,
                color: "hsl(var(--primary))"
              }}
            />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}