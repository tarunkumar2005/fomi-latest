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

export const getPreviousRange = (dateFromISO: string, dateToISO: string) => {
  const dateFrom = new Date(dateFromISO);
  const dateTo = new Date(dateToISO);
  const diffMs = dateTo.getTime() - dateFrom.getTime();

  const prevEnd = new Date(dateFrom.getTime());
  const prevStart = new Date(dateFrom.getTime() - diffMs);

  return {
    prevFrom: prevStart.toISOString(),
    prevTo: prevEnd.toISOString(),
  };
};

export const calcChange = (current: number, previous: number) => {
  if (previous === 0) {
    return {
      change: current === 0 ? 0 : 100, // if no past data but now has some
      changeColor: current === 0 ? 'neutral' : 'positive' as const
    };
  }

  const diff = current - previous;
  const percent = (diff / previous) * 100;
  return {
    change: parseFloat(percent.toFixed(2)),
    changeColor: percent >= 0 ? 'positive' as const : 'negative' as const
  };
}