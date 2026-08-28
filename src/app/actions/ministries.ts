"use server";

import {
  createMinistry,
  deleteMinistry,
  listMinistries,
  moveMinistry,
  updateMinistry,
} from "@/lib/queries";

import { requireUser } from "./auth";

export async function createMinistryAction(input: {
  label: string;
  description: string;
}) {
  await requireUser();
  return createMinistry(input);
}

export async function updateMinistryAction(
  id: string,
  input: { label: string; description: string }
) {
  await requireUser();
  return updateMinistry(id, input);
}

export async function deleteMinistryAction(id: string) {
  await requireUser();
  return deleteMinistry(id);
}

export async function moveMinistryAction(id: string, direction: "up" | "down") {
  await requireUser();
  return moveMinistry(id, direction);
}

export async function listMinistriesAction() {
  await requireUser();
  return listMinistries();
}
