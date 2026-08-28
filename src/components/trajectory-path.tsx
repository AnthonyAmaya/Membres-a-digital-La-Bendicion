"use client";

import { Check } from "lucide-react";

import { formatShortDate } from "@/lib/format";
import type { TrajectoryStep } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TrajectoryPath({
  steps,
  onToggle,
  compact = false,
}: {
  steps: TrajectoryStep[];
  onToggle?: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <ol className="grid gap-3">
      {steps.map((step, index) => {
        const done = Boolean(step.completed);
        const interactive = Boolean(onToggle);

        return (
          <li key={step.id}>
            <button
              type="button"
              disabled={!interactive}
              aria-pressed={done}
              onClick={() => onToggle?.(step.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
                done
                  ? "border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200"
                  : "border-border bg-card",
                interactive && "hover:border-emerald-300 hover:shadow-sm",
                !interactive && "cursor-default"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  done
                    ? "bg-emerald-600 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="size-4" /> : index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-heading font-semibold text-foreground">
                    {step.label}
                  </span>
                  {done ? (
                    <span className="text-xs font-semibold text-emerald-700">
                      Completado
                      {step.completedAt ? ` · ${formatShortDate(step.completedAt)}` : ""}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Pendiente</span>
                  )}
                </span>
                {!compact && step.description ? (
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {step.description}
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
