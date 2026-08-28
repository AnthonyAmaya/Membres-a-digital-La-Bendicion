"use server";

import {
  createMember,
  deleteMember,
  getMember,
  listMembers,
  listMinistries,
  listTrajectorySteps,
  setMemberPhotoPath,
  toggleMemberStep,
  updateMember,
} from "@/lib/queries";
import { deletePhotoFile, saveMemberPhoto } from "@/lib/photos";
import type { MemberInput } from "@/lib/types";

import { getSessionUser, requireUser } from "./auth";

export async function loadAppData() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, members: [], steps: [], ministries: [] };
  }
  return {
    user: { id: user.id, username: user.username, name: user.name },
    members: listMembers(),
    steps: listTrajectorySteps(),
    ministries: listMinistries(),
  };
}

export async function createMemberAction(input: MemberInput) {
  await requireUser();
  return createMember(input);
}

export async function updateMemberAction(id: string, patch: Partial<MemberInput>) {
  await requireUser();
  return updateMember(id, patch);
}

export async function deleteMemberAction(id: string) {
  await requireUser();
  deleteMember(id);
}

export async function toggleStepAction(memberId: string, stepId: string) {
  await requireUser();
  toggleMemberStep(memberId, stepId);
}

export async function saveMemberPhotoAction(memberId: string, formData: FormData) {
  await requireUser();
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Elige una foto.");
  }
  const current = getMember(memberId);
  if (!current) throw new Error("No encontramos a esta persona.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = saveMemberPhoto(buffer, file.type, file.name);
  deletePhotoFile(current.photoPath);
  setMemberPhotoPath(memberId, stored);
  return getMember(memberId);
}

export async function removeMemberPhotoAction(memberId: string) {
  await requireUser();
  const current = getMember(memberId);
  if (!current) return;
  deletePhotoFile(current.photoPath);
  setMemberPhotoPath(memberId, null);
  return getMember(memberId);
}
