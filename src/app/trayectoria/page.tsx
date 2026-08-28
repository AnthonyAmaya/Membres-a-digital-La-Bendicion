"use client";

import { TrajectoryEditor } from "@/components/trajectory-editor";
import { useMembers } from "@/components/members-provider";

export default function TrayectoriaPage() {
  const { ready } = useMembers();

  if (!ready) {
    return <p className="text-muted-foreground">Cargando el camino…</p>;
  }

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Trayectoria
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          El camino en La Bendición: las paradas que cada persona va cruzando.
        </p>
      </div>

      <TrajectoryEditor />
    </div>
  );
}
