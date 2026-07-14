import { CheckCircle2, Circle, CircleDot } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProgressStep } from "@/lib/customer-api";

export function ProgressTracker({ steps }: { steps: ProgressStep[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={step.name} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <span
                className={cn(
                  "absolute left-[11px] top-6 h-full w-px",
                  step.status === "completed" ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <span className="z-10 shrink-0">
              {step.status === "completed" && (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              )}
              {step.status === "in_progress" && (
                <CircleDot className="h-6 w-6 text-primary" />
              )}
              {step.status === "pending" && (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
            </span>
            <div>
              <p
                className={cn(
                  "font-medium",
                  step.status === "pending" && "text-muted-foreground"
                )}
              >
                {step.name}
              </p>
              {step.date && (
                <p className="text-sm text-muted-foreground">
                  {new Date(step.date).toLocaleString()}
                </p>
              )}
              {!step.date && step.status === "in_progress" && (
                <p className="text-sm text-muted-foreground">In progress</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
