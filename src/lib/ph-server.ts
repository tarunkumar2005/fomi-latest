import {
  getFormsByWorkspaceId,
  getTotalFormCountbyWorkspaceId,
  getPublishedFormCountbyWorkspaceId,
  getSubmissionsCountbyWorkspaceId,
  getWorkspaceFormSubmissionsByDate
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
    const projectId = process.env.POSTHOG_PROJECT_ID;
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
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT 
            avg(toFloat(properties.completion_time_seconds)) as avg_completion_time_seconds,
            count() as total_completions
          FROM events
          WHERE event = 'form_completed'
            AND properties.form_slug = '${slug}'
            AND properties.completion_time_seconds IS NOT NULL
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
    if (axios.isAxiosError(error)) {
      console.error("PostHog API Error:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return { avgCompletionTimeSeconds: 0, totalCompletions: 0 };
  }
};

const queryPosthogDailyCounts = async (
  event: string,
  slugs: string[],
  interval: string,
  dateFrom: string,
  dateTo: string,
  propertyKey: string,
  urlPattern?: (slug: string) => string
) => {
  if (!slugs?.length) return [];

  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const url = `${host}/api/projects/${projectId}/query/`;

  const values =
    propertyKey === "$current_url"
      ? slugs.map((s) => `'${urlPattern?.(s)}'`).join(", ")
      : slugs.map((s) => `'${s}'`).join(", ");

  const payload = {
    query: {
      kind: "HogQLQuery",
      query: `
        SELECT
          toStartOfInterval(timestamp, INTERVAL ${interval}) AS bucket,
          count() AS total
        FROM events
        WHERE event = '${event}'
          AND properties['${propertyKey}'] IN (${values})
          AND timestamp >= toDateTime('${dateFrom}')
          AND timestamp < toDateTime('${dateTo}')
        GROUP BY bucket
        ORDER BY bucket ASC
      `,
    },
  };

  const response = await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
    },
  });

  console.log(`📈 RAW Results for ${event}:`, response.data.results);

  const mapped = response.data.results?.map((r: [string, number]) => ({
    date: r[0],
    total: r[1],
  })) || [];

  console.log(`📈 MAPPED Results for ${event}:`, mapped);

  return mapped;
};

const fillGapsWithZeros = (
  data: DailyMetric[],
  dateFrom: string,
  dateTo: string,
  intervalStr: string
) => {
  if (data.length === 0) {
    console.warn('⚠️ No data to fill gaps for');
  }
  
  if (data.length > 0) {
    console.log('🔍 First bucket from data:', data[0].date);
    console.log('🔍 Last bucket from data:', data[data.length - 1].date);
  }
  
  const intervalMs = intervalStr === "6 hour" ? 6 * 60 * 60 * 1000 :
                     intervalStr === "1 hour" || intervalStr === "hour" ? 60 * 60 * 1000 :
                     24 * 60 * 60 * 1000;
  
  const start = data.length > 0 
    ? new Date(data[0].date) 
    : new Date(Math.floor(new Date(dateFrom).getTime() / intervalMs) * intervalMs);
  
  const end = new Date(dateTo);
  
  // FIX: Normalize timestamps when creating the map
  const dataMap = new Map(
    data.map(d => {
      const normalizedDate = new Date(d.date).toISOString();
      console.log(`🗺️ Map entry: ${d.date} -> ${normalizedDate} = ${d.total}`);
      return [normalizedDate, d.total];
    })
  );
  
  const results: DailyMetric[] = [];
  let current = new Date(start);
  
  while (current < end) {
    const isoDate = current.toISOString();
    const value = dataMap.get(isoDate) || 0;
    
    console.log(`📅 Lookup: ${isoDate} = ${value}`);
    
    results.push({
      date: isoDate,
      total: value
    });
    current = new Date(current.getTime() + intervalMs);
  }
  
  console.log(`✅ Filled ${results.length} buckets`);
  
  return results;
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

type DailyMetric = {
  date: string
  total: number
}

export const getTrendsChartData = async (
  workspaceId: string,
  range: RangeOption
) => {
  const { dateFrom, dateTo } = getDateRange(range);

  const forms = await getFormsByWorkspaceId(workspaceId);
  const slugs = forms.map((f) => f.slug);

  const interval =
    ['24h', '1d'].includes(range as string) ? "6 hour" : "1 day";

  // Views (pageviews for all form URLs)
  const viewsRaw: DailyMetric[] = await queryPosthogDailyCounts(
    "$pageview",
    slugs,
    interval,
    dateFrom,
    dateTo,
    "$current_url",
    (slug) => `${process.env.NEXT_PUBLIC_BASE_URL}/form/${slug}`
  );
  console.log('🔍 viewsRaw BEFORE gap-fill:', viewsRaw);
  const views = fillGapsWithZeros(viewsRaw, dateFrom, dateTo, interval);

  // Starts (custom 'form_started' event)
  const startsRaw: DailyMetric[] = await queryPosthogDailyCounts(
    "form_started",
    slugs,
    interval,
    dateFrom,
    dateTo,
    "form_slug"
  );
  const starts = fillGapsWithZeros(startsRaw, dateFrom, dateTo, interval);

  const submissions: DailyMetric[] = await getWorkspaceFormSubmissionsByDate(
    workspaceId,
    dateFrom,
    dateTo
  );

  // Merge all unique dates
  const allDates = Array.from(
    new Set([
      ...views.map((v) => v.date),
      ...starts.map((s) => s.date),
      ...submissions.map((x) => x.date),
    ])
  ).sort()

  // Combine daily totals into chart-friendly objects
  return allDates.map((date) => {
    const view = views.find((v) => v.date === date)
    const start = starts.find((s) => s.date === date)
    const submission = submissions.find((x) => x.date === date)

    return {
      date,
      views: view?.total || 0,
      starts: start?.total || 0,
      submissions: submission?.total || 0,
    }
  })
};