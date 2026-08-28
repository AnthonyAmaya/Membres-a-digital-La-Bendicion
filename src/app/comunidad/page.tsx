"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, UserPlus } from "lucide-react";

import { MemberCard } from "@/components/member-card";
import { useMembers } from "@/components/members-provider";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STATUSES, assignmentMinistryLabel } from "@/lib/catalog";
import { fullName } from "@/lib/format";
import type { MemberStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const selectClass =
  "h-8 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default function ComunidadPage() {
  const { members, ministries, ready } = useMembers();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<MemberStatus | "todos">("todos");
  const [ministry, setMinistry] = useState("todos");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((member) => {
      if (status !== "todos" && member.status !== status) return false;
      if (
        ministry !== "todos" &&
        !member.ministries.some((item) => item.ministryId === ministry)
      ) {
        return false;
      }
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
  }, [members, ministries, query, status, ministry]);

  if (!ready) {
    return <p className="text-muted-foreground">Cargando la comunidad…</p>;
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Comunidad
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} de {members.length} personas
            {query.trim() ? ` para “${query.trim()}”` : ""}. Busca, filtra y abre
            la ficha de cada una.
          </p>
        </div>
        <Link
          href="/comunidad/nuevo"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          <UserPlus />
          Nuevo creyente
        </Link>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, teléfono, ocupación o ministerio"
            className="pl-8"
            autoComplete="off"
            name="buscar-comunidad"
          />
        </div>
        <select
          className={selectClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as MemberStatus | "todos")}
        >
          <option value="todos">Todos los estados</option>
          {STATUSES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={ministry}
          onChange={(e) => setMinistry(e.target.value)}
        >
          <option value="todos">Todos los ministerios</option>
          {ministries.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium text-foreground">
              No hay personas con esos filtros.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Prueba otra búsqueda o registra a quien llegó este domingo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}
