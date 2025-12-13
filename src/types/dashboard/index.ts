import { Role, Plan as PrismaPlan } from "@/app/generated/prisma/client";

export enum RangeOption {
  "24h" = "24h",
  "7d" = "7d",
  "30d" = "30d",
  "90d" = "90d",
}

export enum Plan {
  FREE = "FREE",
  PRO = "PRO",
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  plan: PrismaPlan;
  createdAt: Date;
  updatedAt: Date;
  role: Role;
  joinedAt: Date;
  formsCount: number;
  membersCount: number;
  _count: {
    forms: number;
    members: number;
  };
}
