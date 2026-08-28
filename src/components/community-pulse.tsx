import { STATUSES } from "@/lib/catalog";
import { trajectoryProgress } from "@/lib/format";
import type { Member, MemberStatus } from "@/lib/types";

const STATUS_COLOR: Record<
  MemberStatus,
  { fill: string; text: string; track: string }
> = {
  visitante: { fill: "#f59e0b", text: "#422006", track: "#fef3c7" },
  nuevo_creyente: { fill: "#8b5cf6", text: "#ffffff", track: "#ede9fe" },
  activo: { fill: "#10b981", text: "#064e3b", track: "#d1fae5" },
  inactivo: { fill: "#94a3b8", text: "#1e293b", track: "#e2e8f0" },
};

export function CommunityPulse({ members }: { members: Member[] }) {
  const total = members.length;
  const byStatus = STATUSES.map((status) => ({
    ...status,
    count: members.filter((member) => member.status === status.id).length,
  }));
  const serving = members.filter((member) => member.ministries.length > 0).length;
  const avgProgress = total
    ? Math.round(
        members.reduce((sum, member) => sum + trajectoryProgress(member), 0) /
          total
      )
    : 0;

  return (
    <section className="rounded-3xl bg-slate-50 p-4 sm:p-5">
      <h3 className="font-heading text-base font-semibold text-foreground">
        Pulso de la comunidad
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {total === 0
          ? "Cuando registres a alguien, aquí verás en qué estado está, si ya sirve y cuánto ha avanzado."
          : `De las ${total} ${total === 1 ? "persona" : "personas"}: en qué estado están, cuántas ya sirven y cuánto han avanzado en el camino.`}
      </p>

      {total === 0 ? (
        <p className="mt-6 rounded-2xl bg-white px-4 py-8 text-center text-sm text-muted-foreground ring-1 ring-slate-200">
          Todavía no hay personas en la comunidad.
        </p>
      ) : (
        <div className="mt-5 grid gap-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
              Cómo está cada persona
            </p>
            <div
              className="mt-3 flex h-16 gap-1 overflow-hidden rounded-2xl bg-[#eef2f6] p-1"
              role="img"
              aria-label={byStatus
                .map((item) => `${item.label}: ${item.count}`)
                .join(", ")}
            >
              {byStatus.map((item) => {
                if (item.count === 0) return null;
                return (
                  <div
                    key={item.id}
                    className="flex min-w-7 items-center justify-center rounded-xl px-1 text-sm font-semibold tabular-nums"
                    style={{
                      flexGrow: item.count,
                      flexBasis: 0,
                      backgroundColor: STATUS_COLOR[item.id].fill,
                      color: STATUS_COLOR[item.id].text,
                    }}
                    title={`${item.label}: ${item.count}`}
                  >
                    {item.count}
                  </div>
                );
              })}
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
              {byStatus.map((item) => (
                <li key={item.id} className="flex items-baseline gap-2">
                  <span
                    className="mt-1 size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: STATUS_COLOR[item.id].fill }}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="font-heading text-lg font-semibold text-foreground tabular-nums">
                      {item.count}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PulseBar
              label="Ya sirven en un ministerio"
              value={`${serving} de ${total}`}
              percent={Math.round((serving / total) * 100)}
              fill={STATUS_COLOR.activo.fill}
              track={STATUS_COLOR.activo.track}
              caption={
                serving === 0
                  ? "Nadie tiene un ministerio asignado todavía."
                  : serving === 1
                    ? "1 persona ya tiene un ministerio."
                    : `${serving} personas ya tienen un ministerio.`
              }
            />
            <PulseBar
              label="Avance del camino"
              value={`${avgProgress}%`}
              percent={avgProgress}
              fill={STATUS_COLOR.visitante.fill}
              track={STATUS_COLOR.visitante.track}
              caption="Promedio de pasos que la comunidad ya completó en su trayectoria."
            />
          </div>
        </div>
      )}
    </section>
  );
}

function PulseBar({
  label,
  value,
  percent,
  caption,
  fill,
  track,
}: {
  label: string;
  value: string;
  percent: number;
  caption: string;
  fill: string;
  track: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex items-end justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="font-heading text-2xl font-semibold text-foreground tabular-nums">
          {value}
        </p>
      </div>
      <div
        className="mt-3 h-3.5 overflow-hidden rounded-full"
        style={{ backgroundColor: track }}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(0, Math.min(100, percent))}%`,
            backgroundColor: fill,
          }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}
