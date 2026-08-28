import type { Member } from "./types";

export function fullName(member: Pick<Member, "firstName" | "lastName">) {
  return `${member.firstName} ${member.lastName}`.trim();
}

export function initials(member: Pick<Member, "firstName" | "lastName">) {
  const first = member.firstName.trim().charAt(0);
  const last = member.lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || "LB";
}

export function formatDate(iso?: string) {
  if (!iso) return "—";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(iso?: string) {
  if (!iso) return "—";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function ageFromBirthDate(iso?: string) {
  if (!iso) return undefined;
  const birth = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export function trajectoryProgress(member: Member) {
  const done = member.trajectory.filter((step) => step.completed).length;
  const total = member.trajectory.length || 1;
  return Math.round((done / total) * 100);
}

export function currentStepLabel(member: Member) {
  const completed = member.trajectory.filter((step) => step.completed);
  if (completed.length === 0) return "Sin iniciar";
  const last = completed[completed.length - 1];
  return last.label || last.id;
}
