"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { loadAppData } from "@/app/actions/members";
import {
  createMemberAction,
  deleteMemberAction,
  removeMemberPhotoAction,
  restoreDemoAction,
  loadExamplesAction,
  saveMemberPhotoAction,
  toggleStepAction,
  updateMemberAction,
} from "@/app/actions/members";
import {
  createMinistryAction,
  deleteMinistryAction,
  moveMinistryAction,
  updateMinistryAction,
} from "@/app/actions/ministries";
import {
  createStepAction,
  deleteStepAction,
  moveStepAction,
  updateStepAction,
} from "@/app/actions/trajectory";
import type { MemberPhotoChange } from "@/components/member-form";
import type {
  Member,
  MemberInput,
  MinistryDef,
  SessionUser,
  TrajectoryStepDef,
} from "@/lib/types";

type AppDataContextValue = {
  members: Member[];
  steps: TrajectoryStepDef[];
  ministries: MinistryDef[];
  user: SessionUser | null;
  ready: boolean;
  error: string | null;
  addMember: (input: MemberInput, photo?: MemberPhotoChange) => Promise<Member>;
  updateMember: (
    id: string,
    patch: Partial<MemberInput>,
    photo?: MemberPhotoChange
  ) => Promise<Member | undefined>;
  deleteMember: (id: string) => Promise<void>;
  toggleStep: (id: string, stepId: string) => Promise<void>;
  restoreDemo: () => Promise<void>;
  loadExamples: () => Promise<void>;
  addStep: (input: { label: string; description: string }) => Promise<void>;
  updateStep: (
    id: string,
    input: { label: string; description: string }
  ) => Promise<void>;
  deleteStep: (id: string) => Promise<void>;
  moveStep: (id: string, direction: "up" | "down") => Promise<void>;
  addMinistry: (input: { label: string; description: string }) => Promise<void>;
  updateMinistry: (
    id: string,
    input: { label: string; description: string }
  ) => Promise<void>;
  deleteMinistry: (id: string) => Promise<void>;
  moveMinistry: (id: string, direction: "up" | "down") => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function MembersProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [steps, setSteps] = useState<TrajectoryStepDef[]>([]);
  const [ministries, setMinistries] = useState<MinistryDef[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const data = await loadAppData();
    setUser(data.user);
    setMembers(data.members ?? []);
    setSteps(data.steps ?? []);
    setMinistries(data.ministries ?? []);
    setReady(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      reload().catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "No se pudo cargar la comunidad."
        );
        setReady(true);
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [reload]);

  const applyPhoto = useCallback(async (id: string, photo?: MemberPhotoChange) => {
    if (photo?.remove) {
      return removeMemberPhotoAction(id);
    }
    if (photo?.file) {
      const data = new FormData();
      data.set("photo", photo.file);
      return saveMemberPhotoAction(id, data);
    }
  }, []);

  const addMember = useCallback(async (input: MemberInput, photo?: MemberPhotoChange) => {
    const member = await createMemberAction(input);
    const withPhoto = (await applyPhoto(member.id, photo)) ?? member;
    await reload();
    return withPhoto;
  }, [applyPhoto, reload]);

  const updateMember = useCallback(
    async (id: string, patch: Partial<MemberInput>, photo?: MemberPhotoChange) => {
      const updated = await updateMemberAction(id, patch);
      const withPhoto = (await applyPhoto(id, photo)) ?? updated;
      await reload();
      return withPhoto;
    },
    [applyPhoto, reload]
  );

  const deleteMember = useCallback(
    async (id: string) => {
      await deleteMemberAction(id);
      await reload();
    },
    [reload]
  );

  const toggleStep = useCallback(
    async (id: string, stepId: string) => {
      await toggleStepAction(id, stepId);
      await reload();
    },
    [reload]
  );

  const restoreDemo = useCallback(async () => {
    await restoreDemoAction();
    await reload();
  }, [reload]);

  const loadExamples = useCallback(async () => {
    await loadExamplesAction();
    await reload();
  }, [reload]);

  const addStep = useCallback(
    async (input: { label: string; description: string }) => {
      await createStepAction(input);
      await reload();
    },
    [reload]
  );

  const updateStep = useCallback(
    async (id: string, input: { label: string; description: string }) => {
      await updateStepAction(id, input);
      await reload();
    },
    [reload]
  );

  const removeStep = useCallback(
    async (id: string) => {
      await deleteStepAction(id);
      await reload();
    },
    [reload]
  );

  const moveStep = useCallback(
    async (id: string, direction: "up" | "down") => {
      await moveStepAction(id, direction);
      await reload();
    },
    [reload]
  );

  const addMinistry = useCallback(
    async (input: { label: string; description: string }) => {
      await createMinistryAction(input);
      await reload();
    },
    [reload]
  );

  const updateMinistry = useCallback(
    async (id: string, input: { label: string; description: string }) => {
      await updateMinistryAction(id, input);
      await reload();
    },
    [reload]
  );

  const removeMinistry = useCallback(
    async (id: string) => {
      await deleteMinistryAction(id);
      await reload();
    },
    [reload]
  );

  const reorderMinistry = useCallback(
    async (id: string, direction: "up" | "down") => {
      await moveMinistryAction(id, direction);
      await reload();
    },
    [reload]
  );

  const value = useMemo(
    () => ({
      members,
      steps,
      ministries,
      user,
      ready,
      error,
      addMember,
      updateMember,
      deleteMember,
      toggleStep,
      restoreDemo,
      loadExamples,
      addStep,
      updateStep,
      deleteStep: removeStep,
      moveStep,
      addMinistry,
      updateMinistry,
      deleteMinistry: removeMinistry,
      moveMinistry: reorderMinistry,
    }),
    [
      members,
      steps,
      ministries,
      user,
      ready,
      error,
      addMember,
      updateMember,
      deleteMember,
      toggleStep,
      restoreDemo,
      loadExamples,
      addStep,
      updateStep,
      removeStep,
      moveStep,
      addMinistry,
      updateMinistry,
      removeMinistry,
      reorderMinistry,
    ]
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useMembers() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useMembers debe usarse dentro de MembersProvider");
  }
  return ctx;
}

export function useMember(id: string) {
  const { members, ready, ...rest } = useMembers();
  return {
    member: members.find((item) => item.id === id),
    ready,
    ...rest,
  };
}
