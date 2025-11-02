import {
  getFormsByWorkspaceId,
  getTotalFormCountbyWorkspaceId,
  getPublishedFormCountbyWorkspaceId,
  getSubmissionsCountbyWorkspaceId,
} from "./prisma";
import { getDateRange, getPreviousRange, calcChange } from "@/utils/getDateRange";
import { RangeOption } from "@/types/dashboard";
import axios from "axios";

export const getTotalViewsbySlug = async (
  slug: string,
  dateFrom: string,
  dateTo: string
) => {
  if (!slug) return 0;

  try {
    // Ensure no trailing slash on host
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT count() as total_views
          FROM events
          WHERE event = '$pageview'
            AND properties['$current_url'] = '${process.env.NEXT_PUBLIC_BASE_URL}/form/${slug}'
            AND timestamp >= toDateTime('${dateFrom}')
            AND timestamp < toDateTime('${dateTo}')
        `,
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
      },
    });

    const totalViews = response.data.results?.[0]?.[0] || 0;

    return totalViews;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
    } else {
      console.error("Error fetching total views:", error);
    }
    return 0;
  }
};

export const getTotalFormStartsbySlug = async (
  slug: string,
  dateFrom: string,
  dateTo: string
) => {
  if (!slug) return 0;

  try {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
    const projectId = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT count() as total_starts
          FROM events
          WHERE event = 'form_started'
            AND properties['form_slug'] = '${slug}'
            AND timestamp >= toDateTime('${dateFrom}')
            AND timestamp < toDateTime('${dateTo}')
        `,
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
      },
    });

    const totalStarts = response.data.results?.[0]?.[0] || 0;
    return totalStarts;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
    } else {
      console.error("Error fetching total form starts:", error);
    }
    return 0;
  }
};

export const getAverageCompletionTime = async (
  slug: string,
  dateFrom: string,
  dateTo: string
) => {
  try {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
    const projectId = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT 
            avg(toFloat64OrNull(properties['completion_time_seconds'])) as avg_completion_time_seconds,
            count() as total_completions
          FROM events
          WHERE event = 'form_completed'
            AND properties['form_slug'] = '${slug}'
            AND properties['completion_time_seconds'] IS NOT NULL
            AND timestamp >= toDateTime('${dateFrom}')
            AND timestamp < toDateTime('${dateTo}')
        `,
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
      },
    });

    const avgTime = response.data.results?.[0]?.[0] || 0;
    const totalCompletions = response.data.results?.[0]?.[1] || 0;

    return {
      avgCompletionTimeSeconds: avgTime,
      totalCompletions,
    };
  } catch (error) {
    console.error("Error fetching average completion time:", error);
    return { avgCompletionTimeSeconds: 0, totalCompletions: 0 };
  }
};

export const getMetricsForRange = async (workspaceId: string, dateFrom: string, dateTo: string) => {
  let metrics = {
    totalForms: 0,
    publishedForms: 0,
    totalViews: 0,
    totalStarts: 0,
    totalSubmissions: 0,
    totalDropoffs: 0,
    dropoffRate: 0,
    avgCompletionTime: 0,
  }

  const forms = await getFormsByWorkspaceId(workspaceId);

  const totalForms = await getTotalFormCountbyWorkspaceId(workspaceId, dateFrom, dateTo);
  const publishedForms = await getPublishedFormCountbyWorkspaceId(
    workspaceId,
    dateFrom,
    dateTo
  );
  const totalSubmissions = await getSubmissionsCountbyWorkspaceId(
    workspaceId,
    dateFrom,
    dateTo
  );

  metrics.totalForms = totalForms;
  metrics.publishedForms = publishedForms;
  metrics.totalSubmissions = totalSubmissions;

  let totalViews = 0;
  let totalStarts = 0;
  let avgCompletionTime = 0;

  for (const form of forms) {
    const views = await getTotalViewsbySlug(form.slug, dateFrom, dateTo);
    const starts = await getTotalFormStartsbySlug(form.slug, dateFrom, dateTo);
    const { avgCompletionTimeSeconds } = await getAverageCompletionTime(
      form.slug,
      dateFrom,
      dateTo
    );

    totalViews += views;
    totalStarts += starts;
    avgCompletionTime += avgCompletionTimeSeconds;
  }

  metrics.totalViews = totalViews;
  metrics.totalStarts = totalStarts;

  const totalDropoffs = Math.max(0, totalStarts - totalSubmissions);
  const dropoffRate =
    totalStarts > 0
      ? parseFloat(((totalDropoffs / totalStarts) * 100).toFixed(2))
      : 0;

  metrics.totalDropoffs = totalDropoffs;
  metrics.dropoffRate = dropoffRate;
  metrics.avgCompletionTime = forms.length ? avgCompletionTime / forms.length : 0;

  return metrics;
}

export const getDashboardData = async (
  workspaceId: string,
  range: RangeOption
) => {
  const { dateFrom, dateTo } = getDateRange(range);
  const { prevFrom, prevTo } = getPreviousRange(dateFrom, dateTo);

  const current = await getMetricsForRange(workspaceId, dateFrom, dateTo);
  const previous = await getMetricsForRange(workspaceId, prevFrom, prevTo);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const metrics = {
    totalForms: { ...calcChange(current.totalForms, previous.totalForms), value: current.totalForms },
    publishedForms: { ...calcChange(current.publishedForms, previous.publishedForms), value: current.publishedForms },
    totalViews: { ...calcChange(current.totalViews, previous.totalViews), value: current.totalViews.toLocaleString() },
    formStarts: { ...calcChange(current.totalStarts, previous.totalStarts), value: current.totalStarts.toLocaleString() },
    formSubmissions: { ...calcChange(current.totalSubmissions, previous.totalSubmissions), value: current.totalSubmissions.toLocaleString() },
    dropoffs: { ...calcChange(current.totalDropoffs, previous.totalDropoffs), value: current.totalDropoffs.toLocaleString() },
    dropoffRate: {
      ...calcChange(current.dropoffRate, previous.dropoffRate),
      value: `${current.dropoffRate.toFixed(2)}%`
    },
    avgCompletionTime: {
      ...calcChange(current.avgCompletionTime, previous.avgCompletionTime),
      value: formatTime(current.avgCompletionTime)
    }
  };

  return metrics;
}

export const getTrendsChartData = async (
  workspaceId: string,
  range: RangeOption
) => {
  const { dateFrom, dateTo } = getDateRange(range);

}