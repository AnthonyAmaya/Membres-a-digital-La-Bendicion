"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useMembers } from "@/components/members-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fullName, trajectoryProgress } from "@/lib/format";
import type { TrajectoryStepDef } from "@/lib/types";
import { cn } from "@/lib/utils";

function StepStation({
  step,
  index,
  total,
}: {
  step: TrajectoryStepDef;
  index: number;
  total: number;
}) {
  const { members, updateStep, deleteStep, moveStep } = useMembers();
  const [label, setLabel] = useState(step.label);
  const [description, setDescription] = useState(step.description);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLabel(step.label);
    setDescription(step.description);
  }, [step.label, step.description]);

  const dirty = label.trim() !== step.label || description !== step.description;
  const people = members.filter((member) =>
    member.trajectory.some((item) => item.id === step.id && item.completed)
  );

  async function saveIfNeeded() {
    if (!dirty || saving) return;
    if (!label.trim()) {
      toast.error("El paso necesita un nombre.");
      setLabel(step.label);
      return;
    }
    setSaving(true);
    try {
      await updateStep(step.id, { label: label.trim(), description });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`¿Quitar el paso “${step.label}”? Se borra de todas las fichas.`)) {
      return;
    }
    try {
      await deleteStep(step.id);
      toast.success("Paso eliminado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar.");
    }
  }

  const isLast = index === total - 1;

  return (
    <li
      className={cn(
        "relative flex min-w-0 flex-col",
        "sm:[&:nth-child(2n)_[data-path]]:hidden",
        "xl:[&:nth-child(2n)_[data-path]]:flex",
        "xl:[&:nth-child(4n)_[data-path]]:hidden"
      )}
    >
      {isLast ? null : (
        <div
          className="absolute top-12 bottom-[-2rem] left-6 w-0.5 bg-emerald-300 sm:hidden"
          aria-hidden
        />
      )}
      <div className="flex items-center">
        <span
          className={cn(
            "relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full text-base font-bold shadow-sm",
            people.length > 0
              ? "bg-emerald-600 text-white"
              : "bg-white text-emerald-800 ring-2 ring-emerald-300"
          )}
        >
          {index + 1}
        </span>
        {isLast ? null : (
          <div
            data-path
            className="mx-1 hidden h-1.5 min-w-4 flex-1 items-center sm:flex"
            aria-hidden
          >
            <div className="h-1.5 flex-1 rounded-full bg-emerald-300" />
            <ChevronRight className="-mr-1 size-4 shrink-0 text-emerald-400" />
          </div>
        )}
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col rounded-2xl bg-white p-3 shadow-sm ring-1 ring-emerald-100">
        <div className="flex items-start justify-between gap-1">
          <p className="text-[11px] font-semibold tracking-wide text-emerald-700 uppercase">
            Parada {index + 1}
          </p>
          <div className="flex">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={index === 0}
              onClick={() => moveStep(step.id, "up")}
              aria-label="Mover paso atrás"
            >
              <ArrowUp />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={isLast}
              onClick={() => moveStep(step.id, "down")}
              aria-label="Mover paso adelante"
            >
              <ArrowDown />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={remove}
              aria-label="Quitar paso"
            >
              <Trash2 />
            </Button>
          </div>
        </div>
        <Input
          id={`step-label-${step.id}`}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={saveIfNeeded}
          aria-label="Nombre del paso"
          className="mt-1 h-8 border-0 bg-slate-50 px-2 font-semibold shadow-none"
        />
        <Input
          id={`step-desc-${step.id}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={saveIfNeeded}
          aria-label="Descripción del paso"
          placeholder="Qué significa este paso"
          className="mt-1 h-8 border-0 bg-transparent px-2 text-sm shadow-none"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {people.length === 0
            ? "Nadie ha llegado todavía."
            : people.length === 1
              ? "1 persona ya pasó por aquí."
              : `${people.length} personas ya pasaron por aquí.`}
        </p>
        {people.length > 0 ? (
          <ul className="mt-2 flex flex-1 flex-col gap-1">
            {people.map((member) => (
              <li key={member.id}>
                <Link
                  href={`/comunidad/${member.id}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1 text-sm hover:bg-emerald-50"
                >
                  <span className="truncate font-medium text-foreground">
                    {fullName(member)}
                  </span>
                  <span className="ml-2 shrink-0 text-xs text-emerald-700">
                    {trajectoryProgress(member)}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        {dirty ? (
          <p className="mt-2 text-[11px] text-amber-700">
            {saving ? "Guardando…" : "Sal del campo para guardar."}
          </p>
        ) : null}
      </div>
    </li>
  );
}

export function TrajectoryEditor() {
  const { steps, addStep } = useMembers();
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!label.trim()) {
      toast.error("Escribe el nombre del nuevo paso.");
      return;
    }
    setAdding(true);
    try {
      await addStep({ label: label.trim(), description: description.trim() });
      setLabel("");
      setDescription("");
      toast.success("Paso agregado al camino.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo agregar.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <section className="rounded-3xl bg-emerald-50/70 p-4 ring-1 ring-emerald-100 sm:p-6">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800 uppercase">
        El recorrido
      </p>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Cada círculo es una parada. Se recorre de izquierda a derecha: de
        visitante hacia el servicio y el liderazgo.
      </p>

      {steps.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Todavía no hay paradas. Agrega la primera abajo.
        </p>
      ) : (
        <ol className="mt-8 grid grid-cols-1 gap-x-2 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <StepStation
              key={step.id}
              step={step}
              index={index}
              total={steps.length}
            />
          ))}
        </ol>
      )}

      <form
        className="mt-8 grid gap-2 rounded-2xl border border-dashed border-emerald-200 bg-white/80 p-3 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] sm:items-center sm:gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
      >
        <Input
          id="new-step-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Nueva parada, ej. Escuela bíblica"
          className="h-10"
        />
        <Input
          id="new-step-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Qué significa en el camino"
          className="h-10"
        />
        <Button type="submit" disabled={adding} className="h-10">
          <Plus />
          {adding ? "Agregando…" : "Agregar parada"}
        </Button>
      </form>
    </section>
  );
}
