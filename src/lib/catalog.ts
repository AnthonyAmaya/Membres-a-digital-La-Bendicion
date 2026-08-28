import type {
  HowTheyCame,
  MaritalStatus,
  MemberStatus,
  MinistryRole,
  TrajectoryStep,
  TrajectoryStepDef,
  TrajectoryStepId,
  MinistryDef,
} from "./types";

export const CHURCH = {
  name: "La Bendición",
  motto: "Amparando · Librando · Salvando",
  mottoParts: ["Amparando", "Librando", "Salvando"] as const,
};

export const DEFAULT_TRAJECTORY_STEPS: TrajectoryStepDef[] = [
  {
    id: "visitante",
    label: "Visitante",
    description: "Primer contacto con la iglesia",
    sortOrder: 0,
  },
  {
    id: "nuevo_creyente",
    label: "Nuevo creyente",
    description: "Decisión de seguir a Cristo",
    sortOrder: 1,
  },
  {
    id: "discipulado",
    label: "Discipulado",
    description: "Formación y seguimiento pastoral",
    sortOrder: 2,
  },
  {
    id: "bautismo",
    label: "Bautismo",
    description: "Bautismo en agua",
    sortOrder: 3,
  },
  {
    id: "membresia",
    label: "Membresía",
    description: "Forma parte de La Bendición",
    sortOrder: 4,
  },
  {
    id: "servicio",
    label: "Servicio",
    description: "Sirve en un ministerio",
    sortOrder: 5,
  },
  {
    id: "liderazgo",
    label: "Liderazgo",
    description: "Lidera y cuida a otros",
    sortOrder: 6,
  },
];

export const TRAJECTORY_STEPS = DEFAULT_TRAJECTORY_STEPS;

export const DEFAULT_MINISTRIES: MinistryDef[] = [
  {
    id: "alabanza",
    label: "Alabanza y adoración",
    description: "Música, coro y alabanza",
    sortOrder: 0,
  },
  {
    id: "intercesion",
    label: "Intercesión",
    description: "Oración e intercesión",
    sortOrder: 1,
  },
  {
    id: "ninos",
    label: "Niños",
    description: "Escuela bíblica e infantil",
    sortOrder: 2,
  },
  {
    id: "jovenes",
    label: "Jóvenes",
    description: "Ministerio de jóvenes",
    sortOrder: 3,
  },
  {
    id: "evangelismo",
    label: "Evangelismo",
    description: "Alcance y misiones",
    sortOrder: 4,
  },
  {
    id: "bienvenida",
    label: "Bienvenida",
    description: "Ujieres y recepción",
    sortOrder: 5,
  },
  {
    id: "ensenanza",
    label: "Enseñanza",
    description: "Escuela bíblica y grupos",
    sortOrder: 6,
  },
  {
    id: "multimedia",
    label: "Multimedia",
    description: "Audio, video y redes",
    sortOrder: 7,
  },
  {
    id: "damas",
    label: "Damas",
    description: "Ministerio de mujeres",
    sortOrder: 8,
  },
  {
    id: "caballeros",
    label: "Caballeros",
    description: "Ministerio de hombres",
    sortOrder: 9,
  },
  {
    id: "diaconado",
    label: "Diaconado",
    description: "Servicio pastoral y práctico",
    sortOrder: 10,
  },
];

export const MINISTRIES = DEFAULT_MINISTRIES;

export const MINISTRY_ROLES: { id: MinistryRole; label: string }[] = [
  { id: "apoyo", label: "Apoyo" },
  { id: "servidor", label: "Servidor" },
  { id: "lider", label: "Líder" },
];

export const STATUSES: { id: MemberStatus; label: string }[] = [
  { id: "visitante", label: "Visitante" },
  { id: "nuevo_creyente", label: "Nuevo creyente" },
  { id: "activo", label: "Activo" },
  { id: "inactivo", label: "Inactivo" },
];

export const HOW_THEY_CAME: { id: HowTheyCame; label: string }[] = [
  { id: "invitacion", label: "Invitación de alguien" },
  { id: "familia", label: "Familia" },
  { id: "redes", label: "Redes sociales" },
  { id: "evento", label: "Evento o campaña" },
  { id: "por_cuenta_propia", label: "Por su cuenta" },
  { id: "otro", label: "Otro" },
];

export const MARITAL_STATUSES: { id: MaritalStatus; label: string }[] = [
  { id: "soltero", label: "Soltero/a" },
  { id: "casado", label: "Casado/a" },
  { id: "viudo", label: "Viudo/a" },
  { id: "otro", label: "Otro" },
];

export function emptyTrajectory(
  steps: TrajectoryStepDef[] = DEFAULT_TRAJECTORY_STEPS
): TrajectoryStep[] {
  return steps.map((step) => ({
    id: step.id,
    label: step.label,
    description: step.description,
    completed: false,
  }));
}

export function trajectoryForStatus(
  status: MemberStatus,
  steps: TrajectoryStepDef[] = DEFAULT_TRAJECTORY_STEPS
): TrajectoryStep[] {
  const today = new Date().toISOString().slice(0, 10);
  const completed = new Set<TrajectoryStepId>();

  if (status === "visitante") {
    completed.add("visitante");
  }
  if (status === "nuevo_creyente" || status === "activo") {
    completed.add("visitante");
    completed.add("nuevo_creyente");
  }

  return steps.map((step) => ({
    id: step.id,
    label: step.label,
    description: step.description,
    completed: completed.has(step.id),
    completedAt: completed.has(step.id) ? today : undefined,
  }));
}

export function ministryLabel(
  id: string,
  ministries: { id: string; label: string }[] = DEFAULT_MINISTRIES
) {
  return ministries.find((m) => m.id === id)?.label ?? id;
}

export function assignmentMinistryLabel(
  assignment: { ministryId: string; label?: string },
  ministries: { id: string; label: string }[] = DEFAULT_MINISTRIES
) {
  return assignment.label ?? ministryLabel(assignment.ministryId, ministries);
}

export function roleLabel(id: MinistryRole) {
  return MINISTRY_ROLES.find((r) => r.id === id)?.label ?? id;
}

export function statusLabel(id: MemberStatus) {
  return STATUSES.find((s) => s.id === id)?.label ?? id;
}

export function howTheyCameLabel(id?: HowTheyCame) {
  if (!id) return "—";
  return HOW_THEY_CAME.find((item) => item.id === id)?.label ?? id;
}

export function maritalLabel(id?: MaritalStatus) {
  if (!id) return "—";
  return MARITAL_STATUSES.find((item) => item.id === id)?.label ?? id;
}

export function stepMeta(
  id: TrajectoryStepId,
  steps: TrajectoryStepDef[] = DEFAULT_TRAJECTORY_STEPS
) {
  return (
    steps.find((step) => step.id === id) ?? {
      id,
      label: id,
      description: "",
      sortOrder: 0,
    }
  );
}
