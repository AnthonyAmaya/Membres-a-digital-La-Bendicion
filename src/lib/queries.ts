import { trajectoryForStatus } from "./catalog";
import { getDb, loadExampleMembers, resetDemoData } from "./db";
import { deletePhotoFile } from "./photos";
import type {
  Member,
  MemberInput,
  MinistryAssignment,
  MinistryDef,
  MinistryRole,
  TrajectoryStep,
  TrajectoryStepDef,
} from "./types";

type MemberRow = {
  id: string;
  first_name: string;
  last_name: string;
  gender: string | null;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  marital_status: string | null;
  occupation: string | null;
  how_they_came: string | null;
  invited_by: string | null;
  conversion_date: string | null;
  status: Member["status"];
  notes: string | null;
  photo_path: string | null;
  created_at: string;
  updated_at: string;
};

type StepRow = {
  id: string;
  label: string;
  description: string;
  sort_order: number;
};

type MinistryRow = StepRow;

function asMember(
  row: MemberRow,
  ministries: MinistryAssignment[],
  trajectory: TrajectoryStep[]
): Member {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    gender: (row.gender as Member["gender"]) || undefined,
    birthDate: row.birth_date || undefined,
    phone: row.phone || undefined,
    email: row.email || undefined,
    address: row.address || undefined,
    city: row.city || undefined,
    maritalStatus: (row.marital_status as Member["maritalStatus"]) || undefined,
    occupation: row.occupation || undefined,
    howTheyCame: (row.how_they_came as Member["howTheyCame"]) || undefined,
    invitedBy: row.invited_by || undefined,
    conversionDate: row.conversion_date || undefined,
    status: row.status,
    ministries,
    trajectory,
    notes: row.notes || undefined,
    photoPath: row.photo_path || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listTrajectorySteps(): TrajectoryStepDef[] {
  const rows = getDb()
    .prepare(
      "SELECT id, label, description, sort_order FROM trajectory_steps ORDER BY sort_order ASC"
    )
    .all() as StepRow[];
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    description: row.description,
    sortOrder: row.sort_order,
  }));
}

function progressForMember(memberId: string, steps: TrajectoryStepDef[]): TrajectoryStep[] {
  const rows = getDb()
    .prepare(
      "SELECT step_id, completed, completed_at, notes FROM member_trajectory WHERE member_id = ?"
    )
    .all(memberId) as {
    step_id: string;
    completed: number;
    completed_at: string | null;
    notes: string | null;
  }[];
  const byId = new Map(rows.map((row) => [row.step_id, row]));
  return steps.map((step) => {
    const progress = byId.get(step.id);
    return {
      id: step.id,
      label: step.label,
      description: step.description,
      completed: Boolean(progress?.completed),
      completedAt: progress?.completed_at || undefined,
      notes: progress?.notes || undefined,
    };
  });
}

export function listMinistries(): MinistryDef[] {
  const rows = getDb()
    .prepare(
      "SELECT id, label, description, sort_order FROM ministries ORDER BY sort_order ASC"
    )
    .all() as MinistryRow[];
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    description: row.description,
    sortOrder: row.sort_order,
  }));
}

function ministriesForMember(memberId: string): MinistryAssignment[] {
  const rows = getDb()
    .prepare(
      `SELECT mm.ministry_id, mm.role, m.label
       FROM member_ministries mm
       LEFT JOIN ministries m ON m.id = mm.ministry_id
       WHERE mm.member_id = ?
       ORDER BY COALESCE(m.sort_order, 999), mm.ministry_id`
    )
    .all(memberId) as {
    ministry_id: string;
    role: MinistryRole;
    label: string | null;
  }[];
  return rows.map((row) => ({
    ministryId: row.ministry_id,
    role: row.role,
    label: row.label || undefined,
  }));
}

export function listMembers(): Member[] {
  const steps = listTrajectorySteps();
  const rows = getDb()
    .prepare("SELECT * FROM members ORDER BY created_at DESC")
    .all() as MemberRow[];
  return rows.map((row) =>
    asMember(row, ministriesForMember(row.id), progressForMember(row.id, steps))
  );
}

export function getMember(id: string): Member | undefined {
  const row = getDb().prepare("SELECT * FROM members WHERE id = ?").get(id) as
    | MemberRow
    | undefined;
  if (!row) return undefined;
  return asMember(
    row,
    ministriesForMember(row.id),
    progressForMember(row.id, listTrajectorySteps())
  );
}

function saveRelations(memberId: string, input: MemberInput) {
  const db = getDb();
  db.prepare("DELETE FROM member_ministries WHERE member_id = ?").run(memberId);
  const insertMinistry = db.prepare(
    "INSERT INTO member_ministries (member_id, ministry_id, role) VALUES (?, ?, ?)"
  );
  for (const ministry of input.ministries) {
    insertMinistry.run(memberId, ministry.ministryId, ministry.role);
  }

  db.prepare("DELETE FROM member_trajectory WHERE member_id = ?").run(memberId);
  const insertProgress = db.prepare(
    "INSERT INTO member_trajectory (member_id, step_id, completed, completed_at, notes) VALUES (?, ?, ?, ?, ?)"
  );
  const steps = listTrajectorySteps();
  const byId = new Map(input.trajectory.map((step) => [step.id, step]));
  for (const step of steps) {
    const progress = byId.get(step.id);
    insertProgress.run(
      memberId,
      step.id,
      progress?.completed ? 1 : 0,
      progress?.completedAt ?? null,
      progress?.notes ?? null
    );
  }
}

export function createMember(input: MemberInput): Member {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const trajectory =
    input.trajectory?.length > 0
      ? input.trajectory
      : trajectoryForStatus(input.status, listTrajectorySteps());
  const payload: MemberInput = { ...input, trajectory };
  getDb()
    .prepare(
      `INSERT INTO members (
        id, first_name, last_name, gender, birth_date, phone, email, address, city,
        marital_status, occupation, how_they_came, invited_by, conversion_date,
        status, notes, photo_path, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      payload.firstName,
      payload.lastName,
      payload.gender ?? null,
      payload.birthDate ?? null,
      payload.phone ?? null,
      payload.email ?? null,
      payload.address ?? null,
      payload.city ?? null,
      payload.maritalStatus ?? null,
      payload.occupation ?? null,
      payload.howTheyCame ?? null,
      payload.invitedBy ?? null,
      payload.conversionDate ?? null,
      payload.status,
      payload.notes ?? null,
      payload.photoPath ?? null,
      now,
      now
    );
  saveRelations(id, payload);
  return getMember(id)!;
}

export function updateMember(id: string, patch: Partial<MemberInput>): Member | undefined {
  const current = getMember(id);
  if (!current) return undefined;
  const next: MemberInput = {
    ...current,
    ...patch,
    ministries: patch.ministries ?? current.ministries,
    trajectory: patch.trajectory ?? current.trajectory,
  };
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `UPDATE members SET
        first_name = ?, last_name = ?, gender = ?, birth_date = ?, phone = ?, email = ?,
        address = ?, city = ?, marital_status = ?, occupation = ?, how_they_came = ?,
        invited_by = ?, conversion_date = ?, status = ?, notes = ?, updated_at = ?
      WHERE id = ?`
    )
    .run(
      next.firstName,
      next.lastName,
      next.gender ?? null,
      next.birthDate ?? null,
      next.phone ?? null,
      next.email ?? null,
      next.address ?? null,
      next.city ?? null,
      next.maritalStatus ?? null,
      next.occupation ?? null,
      next.howTheyCame ?? null,
      next.invitedBy ?? null,
      next.conversionDate ?? null,
      next.status,
      next.notes ?? null,
      now,
      id
    );
  saveRelations(id, next);
  return getMember(id);
}

export function setMemberPhotoPath(id: string, photoPath: string | null) {
  getDb()
    .prepare("UPDATE members SET photo_path = ?, updated_at = ? WHERE id = ?")
    .run(photoPath, new Date().toISOString(), id);
}

export function deleteMember(id: string) {
  const row = getDb()
    .prepare("SELECT photo_path FROM members WHERE id = ?")
    .get(id) as { photo_path: string | null } | undefined;
  if (row?.photo_path) {
    deletePhotoFile(row.photo_path);
  }
  getDb().prepare("DELETE FROM members WHERE id = ?").run(id);
}

export function toggleMemberStep(memberId: string, stepId: string) {
  const db = getDb();
  const existing = db
    .prepare(
      "SELECT completed FROM member_trajectory WHERE member_id = ? AND step_id = ?"
    )
    .get(memberId, stepId) as { completed: number } | undefined;
  const completed = !existing?.completed;
  const today = new Date().toISOString().slice(0, 10);
  db.prepare(
    `INSERT INTO member_trajectory (member_id, step_id, completed, completed_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(member_id, step_id) DO UPDATE SET
       completed = excluded.completed,
       completed_at = excluded.completed_at`
  ).run(memberId, stepId, completed ? 1 : 0, completed ? today : null);
  db.prepare("UPDATE members SET updated_at = ? WHERE id = ?").run(
    new Date().toISOString(),
    memberId
  );
}

function slugify(label: string, fallback = "paso") {
  const base =
    label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback;
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export function createTrajectoryStep(input: { label: string; description: string }) {
  const label = input.label.trim();
  if (!label) throw new Error("El nombre del paso es obligatorio.");
  const db = getDb();
  const max = db
    .prepare("SELECT COALESCE(MAX(sort_order), -1) AS max FROM trajectory_steps")
    .get() as { max: number };
  const id = slugify(label);
  db.prepare(
    "INSERT INTO trajectory_steps (id, label, description, sort_order) VALUES (?, ?, ?, ?)"
  ).run(id, label, input.description.trim(), max.max + 1);
  return listTrajectorySteps();
}

export function updateTrajectoryStep(
  id: string,
  input: { label: string; description: string }
) {
  const label = input.label.trim();
  if (!label) throw new Error("El nombre del paso es obligatorio.");
  getDb()
    .prepare("UPDATE trajectory_steps SET label = ?, description = ? WHERE id = ?")
    .run(label, input.description.trim(), id);
  return listTrajectorySteps();
}

export function deleteTrajectoryStep(id: string) {
  const db = getDb();
  const count = db.prepare("SELECT COUNT(*) AS count FROM trajectory_steps").get() as {
    count: number;
  };
  if (count.count <= 1) {
    throw new Error("Debe quedar al menos un paso en la trayectoria.");
  }
  db.prepare("DELETE FROM trajectory_steps WHERE id = ?").run(id);
  const remaining = listTrajectorySteps();
  const update = db.prepare("UPDATE trajectory_steps SET sort_order = ? WHERE id = ?");
  remaining.forEach((step, index) => update.run(index, step.id));
  return listTrajectorySteps();
}

export function moveTrajectoryStep(id: string, direction: "up" | "down") {
  const steps = listTrajectorySteps();
  const index = steps.findIndex((step) => step.id === id);
  if (index < 0) return steps;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= steps.length) return steps;
  const db = getDb();
  const current = steps[index];
  const other = steps[swapWith];
  db.prepare("UPDATE trajectory_steps SET sort_order = ? WHERE id = ?").run(
    other.sortOrder,
    current.id
  );
  db.prepare("UPDATE trajectory_steps SET sort_order = ? WHERE id = ?").run(
    current.sortOrder,
    other.id
  );
  return listTrajectorySteps();
}

export function createMinistry(input: { label: string; description: string }) {
  const label = input.label.trim();
  if (!label) throw new Error("El nombre del ministerio es obligatorio.");
  const db = getDb();
  const max = db
    .prepare("SELECT COALESCE(MAX(sort_order), -1) AS max FROM ministries")
    .get() as { max: number };
  const id = slugify(label, "ministerio");
  db.prepare(
    "INSERT INTO ministries (id, label, description, sort_order) VALUES (?, ?, ?, ?)"
  ).run(id, label, input.description.trim(), max.max + 1);
  return listMinistries();
}

export function updateMinistry(
  id: string,
  input: { label: string; description: string }
) {
  const label = input.label.trim();
  if (!label) throw new Error("El nombre del ministerio es obligatorio.");
  getDb()
    .prepare("UPDATE ministries SET label = ?, description = ? WHERE id = ?")
    .run(label, input.description.trim(), id);
  return listMinistries();
}

export function deleteMinistry(id: string) {
  const db = getDb();
  db.prepare("DELETE FROM member_ministries WHERE ministry_id = ?").run(id);
  db.prepare("DELETE FROM ministries WHERE id = ?").run(id);
  const remaining = listMinistries();
  const update = db.prepare("UPDATE ministries SET sort_order = ? WHERE id = ?");
  remaining.forEach((ministry, index) => update.run(index, ministry.id));
  return listMinistries();
}

export function moveMinistry(id: string, direction: "up" | "down") {
  const ministries = listMinistries();
  const index = ministries.findIndex((ministry) => ministry.id === id);
  if (index < 0) return ministries;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= ministries.length) return ministries;
  const db = getDb();
  const current = ministries[index];
  const other = ministries[swapWith];
  db.prepare("UPDATE ministries SET sort_order = ? WHERE id = ?").run(
    other.sortOrder,
    current.id
  );
  db.prepare("UPDATE ministries SET sort_order = ? WHERE id = ?").run(
    current.sortOrder,
    other.id
  );
  return listMinistries();
}

export function restoreDemo() {
  resetDemoData();
}

export function loadExamples() {
  loadExampleMembers();
}

export function findUserByUsername(username: string) {
  return getDb()
    .prepare("SELECT id, username, name, password_hash FROM users WHERE username = ?")
    .get(username.trim().toLowerCase()) as
    | { id: string; username: string; name: string; password_hash: string }
    | undefined;
}
