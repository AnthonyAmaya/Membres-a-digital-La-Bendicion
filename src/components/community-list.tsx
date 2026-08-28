"use client";

import { Search } from "lucide-react";

import { MemberAvatar } from "@/components/member-avatar";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { assignmentMinistryLabel } from "@/lib/catalog";
import { fullName } from "@/lib/format";
import type { Member, MemberStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CommunityList({
  members,
  query,
  onQuery,
  status,
  onStatus,
  selectedId,
  onSelect,
  showResumen = true,
}: {
  members: Member[];
  query: string;
  onQuery: (value: string) => void;
  status: MemberStatus | "todos";
  onStatus: (value: MemberStatus | "todos") => void;
  selectedId: string | "resumen";
  onSelect: (id: string | "resumen") => void;
  showResumen?: boolean;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Buscar en la comunidad"
            className="h-10 rounded-xl border-0 bg-slate-100 pl-9 text-sm shadow-none"
            autoComplete="off"
            name="buscar-dashboard"
          />
        </div>
        <select
          value={status}
          onChange={(event) =>
            onStatus(event.target.value as MemberStatus | "todos")
          }
          className="h-10 max-w-[7.2rem] shrink-0 rounded-xl border-0 bg-slate-100 px-2 text-xs text-foreground outline-none"
          aria-label="Filtrar por estado"
        >
          <option value="todos">Todos</option>
          <option value="visitante">Visitante</option>
          <option value="nuevo_creyente">Nuevos</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      <div className="mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {showResumen ? (
          <button
            type="button"
            onClick={() => onSelect("resumen")}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition",
              selectedId === "resumen"
                ? "bg-violet-50 ring-1 ring-violet-200"
                : "hover:bg-slate-50"
            )}
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white">
              LB
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">
                Resumen de la iglesia
              </span>
              <span className="text-xs text-muted-foreground">
                {members.length} personas
              </span>
            </span>
          </button>
        ) : null}

        {members.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => onSelect(member.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition",
              selectedId === member.id
                ? "bg-violet-50 ring-1 ring-violet-200"
                : "hover:bg-slate-50"
            )}
          >
            <MemberAvatar member={member} className="size-10 text-xs" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">
                {fullName(member)}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {member.occupation ||
                  (member.ministries[0]
                    ? assignmentMinistryLabel(member.ministries[0])
                    : "Sin ocupación")}
              </span>
            </span>
            <StatusBadge status={member.status} />
          </button>
        ))}

        {members.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            Nadie coincide con esa búsqueda.
          </p>
        ) : null}
      </div>
    </div>
  );
}
