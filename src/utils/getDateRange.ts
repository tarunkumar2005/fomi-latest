import { RangeOption } from "@/types/dashboard";

export const getDateRange = (range: RangeOption) => {
  const now = new Date();
  const ranges: Record<RangeOption, number> = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "90d": 90 * 24 * 60 * 60 * 1000,
  };

  const dateTo = now.toISOString();
  const dateFrom = new Date(now.getTime() - ranges[range]).toISOString();

  return { dateFrom, dateTo };
};