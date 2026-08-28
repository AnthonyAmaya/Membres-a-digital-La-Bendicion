"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Pencil, UserPlus } from "lucide-react";

import { CaminoBoard } from "@/components/camino-board";
import { CommunityList } from "@/components/community-list";
import { MemberAvatar } from "@/components/member-avatar";
import { CommunityPulse } from "@/components/community-pulse";
import { useMembers } from "@/components/members-provider";
import { StatusBadge } from "@/components/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { assignmentMinistryLabel, roleLabel } from "@/lib/catalog";
import {
  currentStepLabel,
  fullName,
  trajectoryProgress,
} from "@/lib/format";
import type { Member, MemberStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { members, steps, ministries, ready, error, restoreDemo, loadExamples } =
    useMembers();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<MemberStatus | "todos">("todos");
  const [selectedId, setSelectedId] = useState<string | "resumen">("resumen");
  const [mobilePanel, setMobilePanel] = useState<"list" | "detail">("list");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((member) => {
      if (status !== "todos" && member.status !== status) return false;
      if (!q) return true;
      const haystack = [
        fullName(member),
        member.phone,
        member.email,
        member.occupation,
        member.city,
        ...member.ministries.map((item) =>
          assignmentMinistryLabel(item, ministries)
        ),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [members, ministries, query, status]);

  const selectedMember =
    selectedId === "resumen"
      ? undefined
      : members.find((member) => member.id === selectedId);

  function select(id: string | "resumen") {
    setSelectedId(id);
    setMobilePanel("detail");
  }

  if (!ready) {
    return (
      <div className="grid h-full animate-pulse gap-3 p-3 md:grid-cols-[20rem_1fr]">
        <div className="h-80 rounded-3xl bg-white" />
        <div className="h-80 rounded-3xl bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="font-medium text-foreground">No se pudo cargar el inicio.</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid h-[calc(100svh-7.5rem)] min-h-[32rem] gap-3 p-3 pb-20 md:h-full md:pb-3 md:grid-cols-[18.5rem_minmax(0,1fr)] lg:grid-cols-[20rem_minmax(0,1fr)]">
      <section
        className={cn(
          "min-h-0 flex-col rounded-3xl bg-white p-4 shadow-sm",
          mobilePanel === "list" ? "flex" : "hidden md:flex"
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h1 className="font-heading text-lg font-semibold text-foreground">
              Comunidad
            </h1>
            <p className="text-xs text-muted-foreground">
              {filtered.length} de {members.length}
            </p>
          </div>
          <Link
            href="/comunidad/nuevo"
            className={cn(
              buttonVariants({ size: "icon" }),
              "size-9 rounded-full bg-[#0077b6]"
            )}
            aria-label="Registrar creyente"
          >
            <UserPlus className="size-4" />
          </Link>
        </div>
        <CommunityList
          members={filtered}
          query={query}
          onQuery={setQuery}
          status={status}
          onStatus={setStatus}
          selectedId={selectedId}
          onSelect={select}
        />
      </section>

      <section
        className={cn(
          "min-h-0 flex-col overflow-y-auto rounded-3xl bg-white p-4 shadow-sm sm:p-5",
          mobilePanel === "detail" ? "flex" : "hidden md:flex"
        )}
      >
        <button
          type="button"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate-600 md:hidden"
          onClick={() => setMobilePanel("list")}
        >
          <ArrowLeft className="size-4" />
          Volver a la lista
        </button>

        {selectedMember ? (
          <MemberWorkspace member={selectedMember} />
        ) : (
          <ChurchWorkspace
            members={members}
            steps={steps}
            restoreDemo={restoreDemo}
            loadExamples={loadExamples}
          />
        )}
      </section>
    </div>
  );
}

function ChurchWorkspace({
  members,
  steps,
  restoreDemo,
  loadExamples,
}: {
  members: Member[];
  steps: { id: string; label: string }[];
  restoreDemo: () => Promise<void>;
  loadExamples: () => Promise<void>;
}) {
  const boardSteps = steps.map((step) => ({
    id: step.id,
    label: step.label,
    completed: members.some((member) =>
      member.trajectory.some((item) => item.id === step.id && item.completed)
    ),
    count: members.filter((member) =>
      member.trajectory.some((item) => item.id === step.id && item.completed)
    ).length,
  }));

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Resumen pastoral
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Un vistazo a quién está en la comunidad y cómo avanza el camino.
        </p>
      </div>

      <CaminoBoard steps={boardSteps} counts />

      <CommunityPulse members={members} />

      <p className="text-xs text-muted-foreground">
        Demo vacía: registra personas o carga ejemplos.{" "}
        <Button
          variant="link"
          className="h-auto p-0 text-xs"
          onClick={() => loadExamples()}
        >
          Cargar ejemplos
        </Button>
        {" · "}
        <Button
          variant="link"
          className="h-auto p-0 text-xs"
          onClick={() => {
            if (
              confirm(
                "¿Vaciar la comunidad? Se quitan las personas y las fotos. Quedan ministerios y el camino."
              )
            ) {
              restoreDemo();
            }
          }}
        >
          Vaciar
        </Button>
      </p>
    </div>
  );
}

function MemberWorkspace({ member }: { member: Member }) {
  const progress = trajectoryProgress(member);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <MemberAvatar member={member} className="size-14" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading truncate text-xl font-semibold text-foreground">
                {fullName(member)}
              </h2>
              <StatusBadge status={member.status} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {member.occupation || "Sin ocupación registrada"}
              {member.city ? ` · ${member.city}` : ""}
            </p>
          </div>
        </div>
        <Link
          href={`/comunidad/${member.id}`}
          className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
        >
          <Pencil className="size-4" />
          Abrir ficha
        </Link>
      </div>

      <CaminoBoard steps={member.trajectory} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Avance" value={`${progress}%`} />
        <Metric label="Paso actual" value={currentStepLabel(member)} />
        <Metric
          label="Ministerios"
          value={String(member.ministries.length)}
        />
      </div>

      <div className="rounded-3xl bg-slate-50 p-4">
        <h3 className="font-heading text-sm font-semibold text-foreground">
          Dónde sirve
        </h3>
        {member.ministries.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Todavía no tiene un ministerio asignado.
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {member.ministries.map((item) => (
              <li
                key={item.ministryId}
                className="rounded-full bg-white px-3 py-1 text-sm text-foreground ring-1 ring-slate-200"
              >
                {assignmentMinistryLabel(item)} · {roleLabel(item.role)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-heading mt-0.5 truncate text-lg font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}
