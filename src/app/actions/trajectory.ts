"use server";

import {
  createTrajectoryStep,
  deleteTrajectoryStep,
  listTrajectorySteps,
  moveTrajectoryStep,
  updateTrajectoryStep,
} from "@/lib/queries";

import { requireUser } from "./auth";

export async function createStepAction(input: { label: string; description: string }) {
  await requireUser();
  return createTrajectoryStep(input);
}

export async function updateStepAction(
  id: string,
  input: { label: string; description: string }
) {
  await requireUser();
  return updateTrajectoryStep(id, input);
}

export async function deleteStepAction(id: string) {
  await requireUser();
  return deleteTrajectoryStep(id);
}

export async function moveStepAction(id: string, direction: "up" | "down") {
  await requireUser();
  return moveTrajectoryStep(id, direction);
}

export async function listStepsAction() {
  await requireUser();
  return listTrajectorySteps();
}
