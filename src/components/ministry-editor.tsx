"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useMembers } from "@/components/members-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { roleLabel } from "@/lib/catalog";
import { fullName } from "@/lib/format";
import type { MinistryDef } from "@/lib/types";

function MinistryCard({
  ministry,
  index,
  total,
}: {
  ministry: MinistryDef;
  index: number;
  total: number;
}) {
  const { members, updateMinistry, deleteMinistry, moveMinistry } = useMembers();
  const [label, setLabel] = useState(ministry.label);
  const [description, setDescription] = useState(ministry.description);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLabel(ministry.label);
    setDescription(ministry.description);
  }, [ministry.label, ministry.description]);

  const dirty =
    label.trim() !== ministry.label || description !== ministry.description;

  const people = members.filter((member) =>
    member.ministries.some((item) => item.ministryId === ministry.id)
  );

  async function saveIfNeeded() {
    if (!dirty || saving) return;
    if (!label.trim()) {
      toast.error("El ministerio necesita un nombre.");
      setLabel(ministry.label);
      return;
    }
    setSaving(true);
    try {
      await updateMinistry(ministry.id, { label: label.trim(), description });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (
      !confirm(
        `¿Quitar el ministerio “${ministry.label}”? Se borra de todas las fichas.`
      )
    ) {
      return;
    }
    try {
      await deleteMinistry(ministry.id);
      toast.success("Ministerio eliminado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar.");
    }
  }

  return (
    <article className="flex h-full min-h-[13rem] flex-col rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-800">
          {index + 1}
        </span>
        <div className="flex gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={index === 0}
            onClick={() => moveMinistry(ministry.id, "up")}
            aria-label="Subir ministerio"
          >
            <ArrowUp />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={index === total - 1}
            onClick={() => moveMinistry(ministry.id, "down")}
            aria-label="Bajar ministerio"
          >
            <ArrowDown />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            onClick={remove}
            aria-label="Quitar ministerio"
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      <Input
        id={`ministry-label-${ministry.id}`}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={saveIfNeeded}
        aria-label="Nombre del ministerio"
        className="mt-3 h-9 border-0 bg-slate-50 px-3 text-base font-semibold shadow-none"
      />
      <Input
        id={`ministry-desc-${ministry.id}`}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={saveIfNeeded}
        aria-label="Descripción del ministerio"
        placeholder="Qué hace este ministerio"
        className="mt-1.5 h-8 border-0 bg-transparent px-3 text-sm shadow-none"
      />
      <div className="mt-auto pt-3">
        {people.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nadie asignado todavía.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {people.map((member) => {
              const assignment = member.ministries.find(
                (item) => item.ministryId === ministry.id
              );
              return (
                <li key={member.id}>
                  <Link
                    href={`/comunidad/${member.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs text-violet-900 hover:bg-violet-100"
                  >
                    <span className="font-medium">{fullName(member)}</span>
                    {assignment ? (
                      <span className="text-violet-600">
                        · {roleLabel(assignment.role)}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {dirty ? (
          <p className="mt-2 text-[11px] text-amber-700">
            {saving ? "Guardando…" : "Sal del campo para guardar."}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function MinistryEditor() {
  const { ministries, addMinistry } = useMembers();
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!label.trim()) {
      toast.error("Escribe el nombre del nuevo ministerio.");
      return;
    }
    setAdding(true);
    try {
      await addMinistry({ label: label.trim(), description: description.trim() });
      setLabel("");
      setDescription("");
      toast.success("Ministerio agregado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo agregar.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <section className="grid gap-4">
      {ministries.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-muted-foreground">
          Todavía no hay ministerios. Agrega el primero abajo.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ministries.map((ministry, index) => (
            <li key={ministry.id}>
              <MinistryCard
                ministry={ministry}
                index={index}
                total={ministries.length}
              />
            </li>
          ))}
        </ul>
      )}

      <form
        className="grid gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_auto] sm:items-center sm:gap-3 sm:p-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
      >
        <Input
          id="new-ministry-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Nombre, ej. Hospitalidad"
          className="h-10 bg-white"
        />
        <Input
          id="new-ministry-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Qué hace, en una línea"
          className="h-10 bg-white"
        />
        <Button type="submit" disabled={adding} className="h-10">
          <Plus />
          {adding ? "Agregando…" : "Agregar ministerio"}
        </Button>
      </form>
    </section>
  );
}
