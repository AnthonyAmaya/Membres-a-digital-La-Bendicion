import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { DEFAULT_LOGIN } from "./auth-constants";
import { DEFAULT_MINISTRIES, DEFAULT_TRAJECTORY_STEPS } from "./catalog";
import { clearAllPhotos, ensurePhotosDir } from "./photos";
import { hashPassword } from "./password";
import { SEED_MEMBERS } from "./seed";
import { dbFilePath } from "./storage-paths";
import type { Member } from "./types";

const DB_PATH = dbFilePath();

type GlobalDb = typeof globalThis & { __laBendicionDb?: DatabaseSync };

function createDatabase() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  ensurePhotosDir();
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA journal_mode = WAL;");
  migrate(db);
  seedIfEmpty(db);
  return db;
}

function migrate(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trajectory_steps (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ministries (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      gender TEXT,
      birth_date TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      marital_status TEXT,
      occupation TEXT,
      how_they_came TEXT,
      invited_by TEXT,
      conversion_date TEXT,
      status TEXT NOT NULL,
      notes TEXT,
      photo_path TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS member_ministries (
      member_id TEXT NOT NULL,
      ministry_id TEXT NOT NULL,
      role TEXT NOT NULL,
      PRIMARY KEY (member_id, ministry_id),
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS member_trajectory (
      member_id TEXT NOT NULL,
      step_id TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      notes TEXT,
      PRIMARY KEY (member_id, step_id),
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
      FOREIGN KEY (step_id) REFERENCES trajectory_steps(id) ON DELETE CASCADE
    );
  `);
  ensureColumn(db, "members", "photo_path", "TEXT");
}

function ensureColumn(
  db: DatabaseSync,
  table: string,
  column: string,
  type: string
) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((col) => col.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

function seedIfEmpty(db: DatabaseSync) {
  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get() as {
    count: number;
  };
  if (userCount.count === 0) {
    db.prepare(
      "INSERT INTO users (id, username, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)"
    ).run(
      "user-pastor",
      DEFAULT_LOGIN.username,
      "Pastor",
      hashPassword(DEFAULT_LOGIN.password),
      new Date().toISOString()
    );
  }

  const stepCount = db.prepare("SELECT COUNT(*) AS count FROM trajectory_steps").get() as {
    count: number;
  };
  if (stepCount.count === 0) {
    const insertStep = db.prepare(
      "INSERT INTO trajectory_steps (id, label, description, sort_order) VALUES (?, ?, ?, ?)"
    );
    for (const step of DEFAULT_TRAJECTORY_STEPS) {
      insertStep.run(step.id, step.label, step.description, step.sortOrder);
    }
  }

  const ministryCount = db.prepare("SELECT COUNT(*) AS count FROM ministries").get() as {
    count: number;
  };
  if (ministryCount.count === 0) {
    seedMinistries(db);
  }
}

function seedMinistries(db: DatabaseSync) {
  const insert = db.prepare(
    "INSERT INTO ministries (id, label, description, sort_order) VALUES (?, ?, ?, ?)"
  );
  for (const ministry of DEFAULT_MINISTRIES) {
    insert.run(ministry.id, ministry.label, ministry.description, ministry.sortOrder);
  }
}

function insertMembers(db: DatabaseSync, members: Member[]) {
  const insertMember = db.prepare(`
    INSERT INTO members (
      id, first_name, last_name, gender, birth_date, phone, email, address, city,
      marital_status, occupation, how_they_came, invited_by, conversion_date,
      status, notes, photo_path, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertMinistry = db.prepare(
    "INSERT INTO member_ministries (member_id, ministry_id, role) VALUES (?, ?, ?)"
  );
  const insertProgress = db.prepare(
    "INSERT INTO member_trajectory (member_id, step_id, completed, completed_at, notes) VALUES (?, ?, ?, ?, ?)"
  );

  for (const member of members) {
    insertMember.run(
      member.id,
      member.firstName,
      member.lastName,
      member.gender ?? null,
      member.birthDate ?? null,
      member.phone ?? null,
      member.email ?? null,
      member.address ?? null,
      member.city ?? null,
      member.maritalStatus ?? null,
      member.occupation ?? null,
      member.howTheyCame ?? null,
      member.invitedBy ?? null,
      member.conversionDate ?? null,
      member.status,
      member.notes ?? null,
      member.photoPath ?? null,
      member.createdAt,
      member.updatedAt
    );
    for (const ministry of member.ministries) {
      insertMinistry.run(member.id, ministry.ministryId, ministry.role);
    }
    for (const step of member.trajectory) {
      insertProgress.run(
        member.id,
        step.id,
        step.completed ? 1 : 0,
        step.completedAt ?? null,
        step.notes ?? null
      );
    }
  }
}

export function getDb() {
  const globalDb = globalThis as GlobalDb;
  if (!globalDb.__laBendicionDb) {
    globalDb.__laBendicionDb = createDatabase();
  } else {
    migrate(globalDb.__laBendicionDb);
    seedIfEmpty(globalDb.__laBendicionDb);
  }
  return globalDb.__laBendicionDb;
}

export function resetDemoData() {
  const db = getDb();
  clearAllPhotos();
  db.exec(`
    DELETE FROM member_trajectory;
    DELETE FROM member_ministries;
    DELETE FROM members;
    DELETE FROM trajectory_steps;
    DELETE FROM ministries;
  `);
  const insertStep = db.prepare(
    "INSERT INTO trajectory_steps (id, label, description, sort_order) VALUES (?, ?, ?, ?)"
  );
  for (const step of DEFAULT_TRAJECTORY_STEPS) {
    insertStep.run(step.id, step.label, step.description, step.sortOrder);
  }
  seedMinistries(db);
}

export function loadExampleMembers() {
  resetDemoData();
  insertMembers(getDb(), SEED_MEMBERS);
}
