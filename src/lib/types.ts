export type MemberStatus =
  | "visitante"
  | "nuevo_creyente"
  | "activo"
  | "inactivo";

export type TrajectoryStepId = string;

export type Gender = "femenino" | "masculino";

export type MaritalStatus = "soltero" | "casado" | "viudo" | "otro";

export type HowTheyCame =
  | "invitacion"
  | "familia"
  | "redes"
  | "evento"
  | "por_cuenta_propia"
  | "otro";

export type MinistryRole = "servidor" | "apoyo" | "lider";

export type TrajectoryStepDef = {
  id: TrajectoryStepId;
  label: string;
  description: string;
  sortOrder: number;
};

export type MinistryDef = {
  id: string;
  label: string;
  description: string;
  sortOrder: number;
};

export type TrajectoryStep = {
  id: TrajectoryStepId;
  label: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
};

export type MinistryAssignment = {
  ministryId: string;
  role: MinistryRole;
  label?: string;
};

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  gender?: Gender;
  birthDate?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  maritalStatus?: MaritalStatus;
  occupation?: string;
  howTheyCame?: HowTheyCame;
  invitedBy?: string;
  conversionDate?: string;
  status: MemberStatus;
  ministries: MinistryAssignment[];
  trajectory: TrajectoryStep[];
  notes?: string;
  photoPath?: string;
  createdAt: string;
  updatedAt: string;
};

export type MemberInput = Omit<Member, "id" | "createdAt" | "updatedAt">;

export type SessionUser = {
  id: string;
  username: string;
  name: string;
};
