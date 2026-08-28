"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Printer, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { MemberForm } from "@/components/member-form";
import type { MemberPhotoChange } from "@/components/member-form";
import { useMember } from "@/components/members-provider";
import { StatusBadge } from "@/components/status-badge";
import { TrajectoryPath } from "@/components/trajectory-path";
import { MemberAvatar } from "@/components/member-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  assignmentMinistryLabel,
  howTheyCameLabel,
  maritalLabel,
  roleLabel,
} from "@/lib/catalog";
import {
  ageFromBirthDate,
  formatDate,
  fullName,
  trajectoryProgress,
} from "@/lib/format";
import type { MemberInput } from "@/lib/types";

export default function FichaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { member, ready, updateMember, deleteMember, toggleStep } = useMember(
    params.id
  );
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!ready) {
    return <p className="text-muted-foreground">Cargando la ficha…</p>;
  }

  if (!member) {
    return (
      <div className="grid gap-3">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          No encontramos a esta persona
        </h1>
        <p className="text-sm text-muted-foreground">
          Puede que se haya eliminado o que el enlace ya no exista.
        </p>
        <Link href="/comunidad" className={buttonVariants()}>
          Volver a la comunidad
        </Link>
      </div>
    );
  }

  const age = ageFromBirthDate(member.birthDate);
  const progress = trajectoryProgress(member);
  const memberId = member.id;
  const memberName = fullName(member);

  async function handleEdit(data: MemberInput, photo?: MemberPhotoChange) {
    await updateMember(memberId, data, photo);
    setEditing(false);
    toast.success("La ficha se actualizó.");
  }

  async function handleDelete() {
    await deleteMember(memberId);
    toast.success("La persona se quitó de la comunidad.");
    router.push("/comunidad");
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <MemberAvatar member={member} className="size-16 text-lg" size="lg" />
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
              Ficha
            </p>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {fullName(member)}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={member.status} />
              <span className="text-sm text-muted-foreground">
                {member.occupation || "Sin ocupación"}
                {age != null ? ` · ${age} años` : ""}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil />
            Editar
          </Button>
          <Link
            href={`/comunidad/${member.id}/imprimir`}
            className={buttonVariants()}
          >
            <Printer />
            Imprimir ficha
          </Link>
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 />
            Quitar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos y contacto</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <Info label="Teléfono" value={member.phone} />
              <Info label="Correo" value={member.email} />
              <Info label="Dirección" value={member.address} />
              <Info label="Ciudad" value={member.city} />
              <Info label="Estado civil" value={maritalLabel(member.maritalStatus)} />
              <Info label="Cómo llegó" value={howTheyCameLabel(member.howTheyCame)} />
              <Info label="Invitado por" value={member.invitedBy} />
              <Info label="Conversión" value={formatDate(member.conversionDate)} />
              <Info
                label="Registro"
                value={formatDate(member.createdAt.slice(0, 10))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Qué hace</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <p className="text-sm text-muted-foreground">
                Ocupación:{" "}
                <span className="font-medium text-foreground">
                  {member.occupation || "Sin registrar"}
                </span>
              </p>
              {member.ministries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todavía no sirve en un ministerio. Edita la ficha para
                  asignarlo.
                </p>
              ) : (
                <ul className="grid gap-2">
                  {member.ministries.map((item) => (
                    <li
                      key={item.ministryId}
                      className="flex items-center justify-between rounded-lg bg-violet-50 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-foreground">
                        {assignmentMinistryLabel(item)}
                      </span>
                      <span className="text-violet-700">{roleLabel(item.role)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {member.notes ? (
            <Card>
              <CardHeader>
                <CardTitle>Notas pastorales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{member.notes}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trayectoria en la iglesia</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avance</span>
                <span className="font-semibold text-emerald-700">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Toca un paso para marcarlo o desmarcarlo. Así el pastor ve en qué
              va cada persona.
            </p>
            <TrajectoryPath
              steps={member.trajectory}
              onToggle={(stepId) => {
                toggleStep(member.id, stepId);
                toast.success("Trayectoria actualizada.");
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Sheet open={editing} onOpenChange={setEditing}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-xl"
        >
          <SheetHeader>
            <SheetTitle>Editar ficha</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            <MemberForm
              initial={member}
              submitLabel="Guardar cambios"
              onSubmit={handleEdit}
              onCancel={() => setEditing(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Quitar a {memberName}?</DialogTitle>
            <DialogDescription>
              Se elimina de la comunidad de este navegador. Esta acción no se
              puede deshacer, salvo que restaures los ejemplos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Sí, quitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/70 py-1.5 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">
        {value || "—"}
      </span>
    </div>
  );
}
