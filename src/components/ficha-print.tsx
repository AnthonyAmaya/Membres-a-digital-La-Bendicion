import {
  CHURCH,
  assignmentMinistryLabel,
  howTheyCameLabel,
  maritalLabel,
  roleLabel,
} from "@/lib/catalog";
import { photoPublicUrl } from "@/lib/photo-url";
import {
  ageFromBirthDate,
  formatDate,
  fullName,
  trajectoryProgress,
} from "@/lib/format";
import type { Member } from "@/lib/types";

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-slate-200 py-1.5 text-sm">
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className="text-foreground">{value || "—"}</dd>
    </div>
  );
}

export function FichaPrint({ member }: { member: Member }) {
  const age = ageFromBirthDate(member.birthDate);
  const progress = trajectoryProgress(member);

  return (
    <article className="mx-auto max-w-[800px] bg-white text-foreground print:max-w-none">
      <header className="flex items-center gap-4 border-b-4 border-[#0077b6] pb-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- print layout needs a plain image */}
        <img
          src="/logo.png"
          alt="Iglesia La Bendición"
          className="size-20 rounded-full bg-black object-contain p-0.5"
        />
        <div>
          <p className="font-heading text-xs font-semibold tracking-[0.22em] text-[#0077b6] uppercase">
            Iglesia
          </p>
          <h1 className="font-heading text-3xl font-extrabold tracking-wide text-[#013a63] uppercase">
            {CHURCH.name}
          </h1>
          <p className="text-sm tracking-widest text-[#0077b6] uppercase">
            {CHURCH.motto}
          </p>
        </div>
      </header>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {member.photoPath ? (
            // eslint-disable-next-line @next/next/no-img-element -- print layout needs a plain image
            <img
              src={photoPublicUrl(member.photoPath)}
              alt={fullName(member)}
              className="size-20 rounded-full object-cover"
            />
          ) : null}
          <div>
            <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
              Ficha de la persona
            </p>
            <h2 className="font-heading mt-1 text-2xl font-bold">
              {fullName(member)}
            </h2>
          </div>
        </div>
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-right text-sm">
          <p className="font-semibold text-emerald-800">{progress}% de trayectoria</p>
          <p className="text-xs text-muted-foreground">
            Actualizada {formatDate(member.updatedAt.slice(0, 10))}
          </p>
        </div>
      </div>

      <section className="mt-6">
        <h3 className="mb-2 font-heading text-sm font-bold tracking-wide text-slate-500 uppercase">
          Datos personales
        </h3>
        <dl>
          <Row label="Nombre" value={fullName(member)} />
          <Row
            label="Sexo"
            value={
              member.gender === "femenino"
                ? "Femenino"
                : member.gender === "masculino"
                  ? "Masculino"
                  : undefined
            }
          />
          <Row
            label="Nacimiento"
            value={
              member.birthDate
                ? `${formatDate(member.birthDate)}${age != null ? ` (${age} años)` : ""}`
                : undefined
            }
          />
          <Row label="Estado civil" value={maritalLabel(member.maritalStatus)} />
          <Row label="Ocupación" value={member.occupation} />
        </dl>
      </section>

      <section className="mt-6">
        <h3 className="mb-2 font-heading text-sm font-bold tracking-wide text-slate-500 uppercase">
          Contacto
        </h3>
        <dl>
          <Row label="Teléfono" value={member.phone} />
          <Row label="Correo" value={member.email} />
          <Row label="Dirección" value={member.address} />
          <Row label="Ciudad" value={member.city} />
        </dl>
      </section>

      <section className="mt-6">
        <h3 className="mb-2 font-heading text-sm font-bold tracking-wide text-slate-500 uppercase">
          Vida en la iglesia
        </h3>
        <dl>
          <Row
            label="Estado"
            value={
              member.status === "nuevo_creyente"
                ? "Nuevo creyente"
                : member.status === "visitante"
                  ? "Visitante"
                  : member.status === "activo"
                    ? "Activo"
                    : "Inactivo"
            }
          />
          <Row label="Cómo llegó" value={howTheyCameLabel(member.howTheyCame)} />
          <Row label="Invitado por" value={member.invitedBy} />
          <Row label="Conversión" value={formatDate(member.conversionDate)} />
          <Row
            label="Registro"
            value={formatDate(member.createdAt.slice(0, 10))}
          />
        </dl>
      </section>

      <section className="mt-6">
        <h3 className="mb-2 font-heading text-sm font-bold tracking-wide text-slate-500 uppercase">
          Qué hace
        </h3>
        {member.ministries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no tiene un ministerio asignado.
          </p>
        ) : (
          <ul className="grid gap-1 text-sm">
            {member.ministries.map((item) => (
              <li
                key={item.ministryId}
                className="flex items-center justify-between rounded border border-slate-200 px-3 py-1.5"
              >
                <span>{assignmentMinistryLabel(item)}</span>
                <span className="font-medium text-violet-700">
                  {roleLabel(item.role)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h3 className="mb-2 font-heading text-sm font-bold tracking-wide text-slate-500 uppercase">
          Trayectoria
        </h3>
        <ol className="grid gap-1">
          {member.trajectory.map((step, index) => (
            <li
              key={step.id}
              className="flex items-center justify-between rounded border border-slate-200 px-3 py-1.5 text-sm"
            >
              <span>
                {index + 1}. {step.label}
              </span>
              <span className={step.completed ? "font-semibold text-emerald-700" : "text-slate-400"}>
                {step.completed ? formatDate(step.completedAt) : "Pendiente"}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {member.notes ? (
        <section className="mt-6">
          <h3 className="mb-2 font-heading text-sm font-bold tracking-wide text-slate-500 uppercase">
            Notas pastorales
          </h3>
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed">
            {member.notes}
          </p>
        </section>
      ) : null}

      <footer className="mt-10 grid grid-cols-2 gap-8 pt-8 text-sm">
        <div className="border-t border-slate-400 pt-2">
          Firma del pastor
        </div>
        <div className="border-t border-slate-400 pt-2">
          Fecha de impresión: {formatDate(new Date().toISOString().slice(0, 10))}
        </div>
      </footer>
    </article>
  );
}
