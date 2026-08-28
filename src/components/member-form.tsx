"use client";

import { useEffect, useState } from "react";
import { Camera, Trash2 } from "lucide-react";

import { MemberAvatar } from "@/components/member-avatar";
import { useMembers } from "@/components/members-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  HOW_THEY_CAME,
  MARITAL_STATUSES,
  MINISTRY_ROLES,
  STATUSES,
  trajectoryForStatus,
} from "@/lib/catalog";
import { photoPublicUrl } from "@/lib/photo-url";
import type {
  Gender,
  HowTheyCame,
  MaritalStatus,
  Member,
  MemberInput,
  MemberStatus,
  MinistryAssignment,
  MinistryRole,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export type MemberPhotoChange = {
  file?: File | null;
  remove?: boolean;
};

type FormState = {
  firstName: string;
  lastName: string;
  gender: Gender | "";
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  maritalStatus: MaritalStatus | "";
  occupation: string;
  howTheyCame: HowTheyCame | "";
  invitedBy: string;
  conversionDate: string;
  status: MemberStatus;
  notes: string;
  ministries: MinistryAssignment[];
};

function fromMember(member?: Partial<Member>): FormState {
  return {
    firstName: member?.firstName ?? "",
    lastName: member?.lastName ?? "",
    gender: member?.gender ?? "",
    birthDate: member?.birthDate ?? "",
    phone: member?.phone ?? "",
    email: member?.email ?? "",
    address: member?.address ?? "",
    city: member?.city ?? "",
    maritalStatus: member?.maritalStatus ?? "",
    occupation: member?.occupation ?? "",
    howTheyCame: member?.howTheyCame ?? "",
    invitedBy: member?.invitedBy ?? "",
    conversionDate: member?.conversionDate ?? "",
    status: member?.status ?? "nuevo_creyente",
    notes: member?.notes ?? "",
    ministries: member?.ministries ?? [],
  };
}

function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function MemberForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  wide = false,
}: {
  initial?: Partial<Member>;
  submitLabel: string;
  onSubmit: (data: MemberInput, photo?: MemberPhotoChange) => void | Promise<void>;
  onCancel?: () => void;
  wide?: boolean;
}) {
  const { steps, ministries } = useMembers();
  const [form, setForm] = useState<FormState>(() => fromMember(initial));
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(() =>
    photoPublicUrl(initial?.photoPath)
  );

  useEffect(() => {
    if (!photoFile) return;
    const url = URL.createObjectURL(photoFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleMinistry(ministryId: string) {
    setForm((prev) => {
      const exists = prev.ministries.find((item) => item.ministryId === ministryId);
      if (exists) {
        return {
          ...prev,
          ministries: prev.ministries.filter((item) => item.ministryId !== ministryId),
        };
      }
      return {
        ...prev,
        ministries: [...prev.ministries, { ministryId, role: "servidor" }],
      };
    });
  }

  function setRole(ministryId: string, role: MinistryRole) {
    setForm((prev) => ({
      ...prev,
      ministries: prev.ministries.map((item) =>
        item.ministryId === ministryId ? { ...item, role } : item
      ),
    }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("El nombre y el apellido son obligatorios.");
      return;
    }
    setError(null);
    onSubmit(
      {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        gender: form.gender || undefined,
        birthDate: form.birthDate || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        maritalStatus: form.maritalStatus || undefined,
        occupation: form.occupation.trim() || undefined,
        howTheyCame: form.howTheyCame || undefined,
        invitedBy: form.invitedBy.trim() || undefined,
        conversionDate: form.conversionDate || undefined,
        status: form.status,
        ministries: form.ministries,
        trajectory: initial?.trajectory?.length
          ? initial.trajectory
          : trajectoryForStatus(form.status, steps),
        notes: form.notes.trim() || undefined,
      },
      { file: photoFile, remove: removePhoto }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className={cn(wide && "grid gap-8 lg:grid-cols-2 lg:items-start")}>
      <section className="grid gap-4">
        <h2 className="font-heading text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Datos personales
        </h2>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div className="size-20 overflow-hidden rounded-full bg-slate-600 ring-2 ring-slate-200 lg:size-24">
            {preview && !removePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="size-full object-cover" />
            ) : (
              <MemberAvatar
                member={{
                  firstName: form.firstName || "N",
                  lastName: form.lastName || "C",
                }}
                className="size-20 text-lg lg:size-24"
              />
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="photo">Foto de la persona</Label>
            <input
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="max-w-xs text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                if (file && file.size > 5 * 1024 * 1024) {
                  setError("La foto no puede pesar más de 5 MB.");
                  event.target.value = "";
                  return;
                }
                setError(null);
                setPhotoFile(file);
                setRemovePhoto(false);
              }}
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG o WebP. Hasta 5 MB. Así relacionas el nombre con la cara.
            </p>
            {(preview && !removePhoto) || photoFile ? (
              <Button
                type="button"
                variant="ghost"
                className="h-8 w-fit px-2 text-foreground"
                onClick={() => {
                  setPhotoFile(null);
                  setRemovePhoto(true);
                  setPreview(undefined);
                }}
              >
                <Trash2 className="size-4" />
                Quitar foto
              </Button>
            ) : (
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Camera className="size-3.5" />
                Sin foto todavía
              </p>
            )}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" htmlFor="firstName">
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              placeholder="Ej. Elena"
              required
            />
          </Field>
          <Field label="Apellido" htmlFor="lastName">
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              placeholder="Ej. Paredes"
              required
            />
          </Field>
          <Field label="Sexo" htmlFor="gender">
            <select
              id="gender"
              className={selectClass}
              value={form.gender}
              onChange={(e) => update("gender", e.target.value as Gender | "")}
            >
              <option value="">Sin especificar</option>
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
            </select>
          </Field>
          <Field label="Fecha de nacimiento" htmlFor="birthDate">
            <Input
              id="birthDate"
              type="date"
              value={form.birthDate}
              onChange={(e) => update("birthDate", e.target.value)}
            />
          </Field>
          <Field label="Estado civil" htmlFor="maritalStatus">
            <select
              id="maritalStatus"
              className={selectClass}
              value={form.maritalStatus}
              onChange={(e) =>
                update("maritalStatus", e.target.value as MaritalStatus | "")
              }
            >
              <option value="">Sin especificar</option>
              {MARITAL_STATUSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ocupación" htmlFor="occupation">
            <Input
              id="occupation"
              value={form.occupation}
              onChange={(e) => update("occupation", e.target.value)}
              placeholder="A qué se dedica"
            />
          </Field>
        </div>
      </section>

      <div className="grid gap-6">
      <section className="grid gap-4">
        <h2 className="font-heading text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Contacto
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Teléfono" htmlFor="phone">
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="555-000-0000"
            />
          </Field>
          <Field label="Correo" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="nombre@correo.com"
            />
          </Field>
          <Field label="Dirección" htmlFor="address" className="sm:col-span-2">
            <Input
              id="address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </Field>
          <Field label="Ciudad" htmlFor="city">
            <Input
              id="city"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="font-heading text-sm font-semibold tracking-wide text-slate-500 uppercase">
          En la iglesia
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Estado" htmlFor="status">
            <select
              id="status"
              className={selectClass}
              value={form.status}
              onChange={(e) => update("status", e.target.value as MemberStatus)}
            >
              {STATUSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cómo llegó" htmlFor="howTheyCame">
            <select
              id="howTheyCame"
              className={selectClass}
              value={form.howTheyCame}
              onChange={(e) =>
                update("howTheyCame", e.target.value as HowTheyCame | "")
              }
            >
              <option value="">Sin especificar</option>
              {HOW_THEY_CAME.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Invitado por" htmlFor="invitedBy">
            <Input
              id="invitedBy"
              value={form.invitedBy}
              onChange={(e) => update("invitedBy", e.target.value)}
              placeholder="Nombre de quien lo trajo"
            />
          </Field>
          <Field label="Fecha de conversión" htmlFor="conversionDate">
            <Input
              id="conversionDate"
              type="date"
              value={form.conversionDate}
              onChange={(e) => update("conversionDate", e.target.value)}
            />
          </Field>
        </div>
      </section>
      </div>
      </div>

      <section className="grid gap-3">
        <h2 className="font-heading text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Qué hace en la iglesia
        </h2>
        <p className="text-sm text-muted-foreground">
          Marca los ministerios en los que sirve y el rol que tiene en cada uno.
        </p>
        {ministries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-muted-foreground">
            Todavía no hay ministerios. Agrégalos en la página de Ministerios
            para poder asignarlos aquí.
          </p>
        ) : (
          <div
            className={cn(
              "grid gap-2",
              wide && "sm:grid-cols-2 xl:grid-cols-3"
            )}
          >
            {ministries.map((ministry) => {
              const assignment = form.ministries.find(
                (item) => item.ministryId === ministry.id
              );
              return (
                <div
                  key={ministry.id}
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between",
                    assignment ? "border-violet-300 bg-violet-50" : "border-border"
                  )}
                >
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 size-4 accent-violet-600"
                      checked={Boolean(assignment)}
                      onChange={() => toggleMinistry(ministry.id)}
                    />
                    <span>
                      <span className="block font-medium text-foreground">
                        {ministry.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {ministry.description}
                      </span>
                    </span>
                  </label>
                  {assignment ? (
                    <select
                      className={cn(selectClass, "w-full sm:w-40")}
                      value={assignment.role}
                      onChange={(e) =>
                        setRole(ministry.id, e.target.value as MinistryRole)
                      }
                    >
                      {MINISTRY_ROLES.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Field label="Notas pastorales" htmlFor="notes">
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Seguimiento, familia, necesidades o próxima conversación"
        />
      </Field>

      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="lg">
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" size="lg" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
