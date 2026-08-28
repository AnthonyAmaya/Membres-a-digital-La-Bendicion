import { Check } from "lucide-react";

import type { TrajectoryStep } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CaminoBoard({
  steps,
  counts,
}: {
  steps: Array<Pick<TrajectoryStep, "id" | "label" | "completed"> & { count?: number }>;
  counts?: boolean;
}) {
  if (steps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Todavía no hay pasos en el camino.</p>
    );
  }

  const maxCount = Math.max(...steps.map((step) => step.count ?? 0), 1);

  return (
    <section className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200 sm:p-5">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
        Camino en la iglesia
      </p>
      <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => {
          const done = Boolean(step.completed);
          const count = step.count ?? 0;
          return (
            <li
              key={step.id}
              className={cn(
                "rounded-2xl bg-white p-3.5 shadow-sm ring-1",
                counts
                  ? "ring-slate-200"
                  : done
                    ? "ring-emerald-300 bg-emerald-50"
                    : "ring-slate-200"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    counts || done
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {counts ? count : done ? <Check className="size-4" /> : index + 1}
                </span>
                <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {counts ? `Paso ${index + 1}` : done ? "Hecho" : "Pendiente"}
                </span>
              </div>
              <p className="mt-3 text-[15px] leading-snug font-semibold text-foreground">
                {step.label}
              </p>
              {counts ? (
                <>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {count === 1 ? "1 persona" : `${count} personas`}
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
