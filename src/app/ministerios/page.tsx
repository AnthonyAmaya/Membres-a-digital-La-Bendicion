"use client";

import { MinistryEditor } from "@/components/ministry-editor";
import { useMembers } from "@/components/members-provider";

export default function MinisteriosPage() {
  const { ready } = useMembers();

  if (!ready) {
    return <p className="text-muted-foreground">Cargando ministerios…</p>;
  }

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Ministerios
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          El pastor arma aquí en qué puede servir cada persona. La misma lista
          aparece en las fichas y en el filtro de la comunidad.
        </p>
      </div>

      <MinistryEditor />
    </div>
  );
}
