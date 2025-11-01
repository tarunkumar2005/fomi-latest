export enum RangeOption {
  "24h" = "24h",
  "7d" = "7d",
  "30d" = "30d",
  "90d" = "90d",
}

export enum Plan {
  FREE,
  PRO
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  plan?: Plan;
  createdAt: string;
  updatedAt: string;
}