import {
  getFormsByWorkspaceId,
  getTotalFormCountbyWorkspaceId,
  getPublishedFormCountbyWorkspaceId,
  getSubmissionsCountbyWorkspaceId,
  getWorkspaceFormSubmissionsByDate,
  getSubmissionsGroupedByForm,
  getWorkspaceFormsSummary
} from "./prisma";
import {
  getDateRange,
  getPreviousRange,
  calcChange,
} from "@/utils/getDateRange";
import { RangeOption } from "@/types/dashboard";
import axios from "axios";

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Determines if localhost filtering should be applied
 * Only exclude localhost if we're NOT running on localhost
 */
const getLocalhostFilter = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const isLocalhost =
    baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

  return isLocalhost
    ? ""
    : "AND NOT (properties.$current_url LIKE '%localhost%' OR properties.$current_url LIKE '%127.0.0.1%')";
};

/**
 * Helper to format time in human-readable format
 */
const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = seconds / 60;
    return `${minutes.toFixed(1)}m`;
  } else {
    const hours = seconds / 3600;
    return `${hours.toFixed(1)}h`;
  }
};

// ===========================
// POSTHOG QUERY FUNCTIONS
// ===========================

/**
 * Get total views for all slugs combined
 * Optimized: Single query for all slugs
 */
export const getTotalViewsBySlugs = async (
  slugs: string[],
  dateFrom: string,
  dateTo: string
) => {
  if (!slugs?.length) return 0;

  try {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const localhostFilter = getLocalhostFilter();

    const urlConditions = slugs
      .map((slug) => `'${baseUrl}/form/${slug}'`)
      .join(", ");

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT count() as total_views
          FROM events
          WHERE event = '$pageview'
            AND properties.$current_url IN (${urlConditions})
            AND timestamp >= toDateTime('${dateFrom}')
            AND timestamp < toDateTime('${dateTo}')
            ${localhostFilter}
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
      console.error("API Error (getTotalViewsBySlugs):", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return 0;
  }
};

/**
 * Get total form starts for all slugs combined
 * Optimized: Single query for all slugs
 */
export const getTotalFormStartsBySlugs = async (
  slugs: string[],
  dateFrom: string,
  dateTo: string
) => {
  if (!slugs?.length) return 0;

  try {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;

    const slugConditions = slugs.map((slug) => `'${slug}'`).join(", ");

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT count() as total_starts
          FROM events
          WHERE event = 'form_started'
            AND properties.form_slug IN (${slugConditions})
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
      console.error("API Error (getTotalFormStartsBySlugs):", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return 0;
  }
};

/**
 * Get average completion time for all slugs combined
 * Optimized: Single query for all slugs
 */
export const getAverageCompletionTimeBySlugs = async (
  slugs: string[],
  dateFrom: string,
  dateTo: string
) => {
  if (!slugs?.length) return 0;

  try {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;

    const slugConditions = slugs.map((slug) => `'${slug}'`).join(", ");

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT 
            avg(toFloat(properties.completion_time_seconds)) as avg_completion_time_seconds
          FROM events
          WHERE event = 'form_completed'
            AND properties.form_slug IN (${slugConditions})
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
    return avgTime;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("PostHog API Error (getAverageCompletionTimeBySlugs):", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return 0;
  }
};

/**
 * Generic function to query PostHog for daily counts
 * Used for trends chart data
 */
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const localhostFilter = getLocalhostFilter();

  const values =
    propertyKey === "$current_url"
      ? slugs.map((s) => `'${urlPattern?.(s)}'`).join(", ")
      : slugs.map((s) => `'${s}'`).join(", ");

  // Only add localhost filter for pageview events
  const additionalFilter =
    event === "$pageview" && propertyKey === "$current_url"
      ? localhostFilter
      : "";

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
          ${additionalFilter}
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

  const mapped =
    response.data.results?.map((r: [string, number]) => ({
      date: r[0],
      total: r[1],
    })) || [];

  return mapped;
};

/**
 * Fill gaps in time series data with zeros
 */
type DailyMetric = {
  date: string;
  total: number;
};

const fillGapsWithZeros = (
  data: DailyMetric[],
  dateFrom: string,
  dateTo: string,
  intervalStr: string
) => {
  if (data.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("⚠️ No data to fill gaps for");
    }
  }

  const intervalMs =
    intervalStr === "6 hour"
      ? 6 * 60 * 60 * 1000
      : intervalStr === "1 hour" || intervalStr === "hour"
      ? 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

  const start =
    data.length > 0
      ? new Date(data[0].date)
      : new Date(
          Math.floor(new Date(dateFrom).getTime() / intervalMs) * intervalMs
        );

  const end = new Date(dateTo);

  // Normalize timestamps when creating the map
  const dataMap = new Map(
    data.map((d) => {
      const normalizedDate = new Date(d.date).toISOString();
      return [normalizedDate, d.total];
    })
  );

  const results: DailyMetric[] = [];
  let current = new Date(start);

  while (current < end) {
    const isoDate = current.toISOString();
    const value = dataMap.get(isoDate) || 0;

    results.push({
      date: isoDate,
      total: value,
    });
    current = new Date(current.getTime() + intervalMs);
  }

  return results;
};

// ===========================
// AUDIENCE DATA FUNCTIONS
// ===========================

interface CountryMetric {
  country: string;
  countryCode: string;
  views: number;
}

/**
 * Get views grouped by country
 */
export const getViewsByCountry = async (
  slugs: string[],
  dateFrom: string,
  dateTo: string,
  limit: number = 10
): Promise<CountryMetric[]> => {
  if (!slugs?.length) return [];

  try {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const localhostFilter = getLocalhostFilter();

    const urlConditions = slugs
      .map((slug) => `'${baseUrl}/form/${slug}'`)
      .join(", ");

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT 
            properties.$geoip_country_name as country,
            properties.$geoip_country_code as country_code,
            count() as total_views
          FROM events
          WHERE event = '$pageview'
            AND properties.$current_url IN (${urlConditions})
            AND timestamp >= toDateTime('${dateFrom}')
            AND timestamp < toDateTime('${dateTo}')
            AND properties.$geoip_country_name IS NOT NULL
            ${localhostFilter}
          GROUP BY country, country_code
          ORDER BY total_views DESC
          LIMIT ${limit}
        `,
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
      },
    });

    const results = (response.data.results || []).map((r: any) => ({
      country: r[0] || "Unknown",
      countryCode: r[1] || "XX",
      views: r[2] || 0,
    }));

    return results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("PostHog API Error (getViewsByCountry):", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return [];
  }
};

export interface DeviceMetric {
  deviceType: string;
  count: number;
  percentage: number;
}

/**
 * Get views grouped by device type
 */
export const getViewsByDevice = async (
  slugs: string[],
  dateFrom: string,
  dateTo: string
): Promise<DeviceMetric[]> => {
  if (!slugs?.length) return [];

  try {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const localhostFilter = getLocalhostFilter();

    const urlConditions = slugs
      .map((slug) => `'${baseUrl}/form/${slug}'`)
      .join(", ");

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT 
            properties.$device_type as device_type,
            count() as total_views
          FROM events
          WHERE event = '$pageview'
            AND properties.$current_url IN (${urlConditions})
            AND timestamp >= toDateTime('${dateFrom}')
            AND timestamp < toDateTime('${dateTo}')
            AND properties.$device_type IS NOT NULL
            ${localhostFilter}
          GROUP BY device_type
          ORDER BY total_views DESC
        `,
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
      },
    });

    const results = response.data.results || [];

    // Calculate total views
    const totalViews = results.reduce(
      (sum: number, r: any) => sum + (r[1] || 0),
      0
    );

    // Map results with percentages
    const deviceMetrics: DeviceMetric[] = results.map((r: any) => {
      const count = r[1] || 0;
      return {
        deviceType: r[0] || "Unknown",
        count: count,
        percentage: totalViews > 0 ? (count / totalViews) * 100 : 0,
      };
    });

    return deviceMetrics;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("PostHog API Error (getViewsByDevice):", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return [];
  }
};

export interface BrowserMetric {
  browser: string;
  count: number;
  percentage: number;
}

/**
 * Get views grouped by browser
 */
export const getViewsByBrowser = async (
  slugs: string[],
  dateFrom: string,
  dateTo: string,
  limit: number = 10
): Promise<BrowserMetric[]> => {
  if (!slugs?.length) return [];

  try {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const localhostFilter = getLocalhostFilter();

    const urlConditions = slugs
      .map((slug) => `'${baseUrl}/form/${slug}'`)
      .join(", ");

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT 
            properties.$browser as browser,
            count() as total_views
          FROM events
          WHERE event = '$pageview'
            AND properties.$current_url IN (${urlConditions})
            AND timestamp >= toDateTime('${dateFrom}')
            AND timestamp < toDateTime('${dateTo}')
            AND properties.$browser IS NOT NULL
            ${localhostFilter}
          GROUP BY browser
          ORDER BY total_views DESC
          LIMIT ${limit}
        `,
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
      },
    });

    const results = response.data.results || [];

    // Calculate total views
    const totalViews = results.reduce(
      (sum: number, r: any) => sum + (r[1] || 0),
      0
    );

    // Map results with percentages
    const browserMetrics: BrowserMetric[] = results.map((r: any) => {
      const count = r[1] || 0;
      return {
        browser: r[0] || "Unknown",
        count: count,
        percentage: totalViews > 0 ? (count / totalViews) * 100 : 0,
      };
    });

    return browserMetrics;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("PostHog API Error (getViewsByBrowser):", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return [];
  }
};

export interface TrafficSourceMetric {
  source: string;
  count: number;
  percentage: number;
}

/**
 * Get views grouped by traffic source
 */
export const getViewsByTrafficSource = async (
  slugs: string[],
  dateFrom: string,
  dateTo: string
): Promise<TrafficSourceMetric[]> => {
  if (!slugs?.length) return [];

  try {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const localhostFilter = getLocalhostFilter();

    const urlConditions = slugs
      .map((slug) => `'${baseUrl}/form/${slug}'`)
      .join(", ");

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT 
            multiIf(
              properties.$utm_source IS NOT NULL OR properties.$utm_medium IS NOT NULL, 'Paid/Campaign',
              properties.$referring_domain IN ('google.com', 'www.google.com', 'bing.com', 'www.bing.com', 'yahoo.com', 'www.yahoo.com', 'duckduckgo.com', 'www.duckduckgo.com', 'baidu.com', 'www.baidu.com'), 'Organic Search',
              properties.$referring_domain IN ('facebook.com', 'www.facebook.com', 'twitter.com', 'www.twitter.com', 'x.com', 'www.x.com', 'linkedin.com', 'www.linkedin.com', 'instagram.com', 'www.instagram.com', 'reddit.com', 'www.reddit.com', 'pinterest.com', 'www.pinterest.com', 'tiktok.com', 'www.tiktok.com', 'youtube.com', 'www.youtube.com'), 'Social',
              properties.$referring_domain IS NOT NULL AND properties.$referring_domain != '', 'Referral',
              'Direct'
            ) as traffic_source,
            count() as total_views
          FROM events
          WHERE event = '$pageview'
            AND properties.$current_url IN (${urlConditions})
            AND timestamp >= toDateTime('${dateFrom}')
            AND timestamp < toDateTime('${dateTo}')
            ${localhostFilter}
          GROUP BY traffic_source
          ORDER BY total_views DESC
        `,
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
      },
    });

    const results = response.data.results || [];

    // Calculate total views
    const totalViews = results.reduce(
      (sum: number, r: any) => sum + (r[1] || 0),
      0
    );

    // Map results with percentages
    const trafficSourceMetrics: TrafficSourceMetric[] = results.map(
      (r: any) => {
        const count = r[1] || 0;
        return {
          source: r[0] || "Unknown",
          count: count,
          percentage: totalViews > 0 ? (count / totalViews) * 100 : 0,
        };
      }
    );

    return trafficSourceMetrics;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("PostHog API Error (getViewsByTrafficSource):", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return [];
  }
};

// ===========================
// FORM-LEVEL ANALYTICS
// ===========================

/**
 * Get views grouped by individual form
 */
export const getViewsGroupedByForm = async (
  slugs: string[],
  dateFrom: string,
  dateTo: string
): Promise<Record<string, number>> => {
  if (!slugs.length) return {};

  try {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const localhostFilter = getLocalhostFilter();

    // Create a CASE statement with ELSE clause
    const caseStatement = slugs
      .map(
        (slug) =>
          `WHEN properties.$current_url = '${baseUrl}/form/${slug}' THEN '${slug}'`
      )
      .join("\n            ");

    const urlConditions = slugs
      .map((slug) => `'${baseUrl}/form/${slug}'`)
      .join(", ");

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT 
            CASE
              ${caseStatement}
              ELSE NULL
            END as form_slug,
            count() as total_views
          FROM events
          WHERE event = '$pageview'
            AND properties.$current_url IN (${urlConditions})
            AND timestamp >= toDateTime('${dateFrom}')
            AND timestamp < toDateTime('${dateTo}')
            ${localhostFilter}
          GROUP BY form_slug
          HAVING form_slug IS NOT NULL
        `,
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
      },
    });

    const results = response.data.results || [];
    const viewsMap: Record<string, number> = {};

    results.forEach((row: any) => {
      if (row[0]) {
        viewsMap[row[0]] = row[1] || 0;
      }
    });

    return viewsMap;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching views by form:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    return {};
  }
};

/**
 * Get starts grouped by form slug
 */
const getStartsGroupedByForm = async (
  slugs: string[],
  dateFrom: string,
  dateTo: string
): Promise<Record<string, number>> => {
  if (!slugs.length) return {};

  try {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;

    const slugConditions = slugs.map((slug) => `'${slug}'`).join(", ");

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT 
            properties.form_slug as form_slug,
            count() as total_starts
          FROM events
          WHERE event = 'form_started'
            AND properties.form_slug IN (${slugConditions})
            AND timestamp >= toDateTime('${dateFrom}')
            AND timestamp < toDateTime('${dateTo}')
          GROUP BY form_slug
        `,
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
      },
    });

    const results = response.data.results || [];
    const startsMap: Record<string, number> = {};

    results.forEach((row: any) => {
      const slug = row[0];
      const starts = row[1] || 0;
      startsMap[slug] = starts;
    });

    return startsMap;
  } catch (error) {
    console.error("Error fetching starts by form:", error);
    return {};
  }
};

/**
 * Get average completion time grouped by form slug
 */
const getAvgCompletionTimeGroupedByForm = async (
  slugs: string[],
  dateFrom: string,
  dateTo: string
): Promise<Record<string, number>> => {
  if (!slugs.length) return {};

  try {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;

    const slugConditions = slugs.map((slug) => `'${slug}'`).join(", ");

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT 
            properties.form_slug as form_slug,
            avg(toFloat(properties.completion_time_seconds)) as avg_time
          FROM events
          WHERE event = 'form_completed'
            AND properties.form_slug IN (${slugConditions})
            AND properties.completion_time_seconds IS NOT NULL
            AND timestamp >= toDateTime('${dateFrom}')
            AND timestamp < toDateTime('${dateTo}')
          GROUP BY form_slug
        `,
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
      },
    });

    const results = response.data.results || [];
    const avgTimeMap: Record<string, number> = {};

    results.forEach((row: any) => {
      const slug = row[0];
      const avgTime = row[1] || 0;
      avgTimeMap[slug] = avgTime;
    });

    return avgTimeMap;
  } catch (error) {
    console.error("Error fetching avg completion time by form:", error);
    return {};
  }
};

// ===========================
// DASHBOARD DATA AGGREGATION
// ===========================

/**
 * Get all metrics for a specific date range
 */
export const getMetricsForRange = async (
  workspaceId: string,
  dateFrom: string,
  dateTo: string
) => {
  let metrics = {
    totalForms: 0,
    publishedForms: 0,
    totalViews: 0,
    totalStarts: 0,
    totalSubmissions: 0,
    totalDropoffs: 0,
    dropoffRate: 0,
    avgCompletionTime: 0,
  };

  const forms = await getFormsByWorkspaceId(workspaceId);
  const slugs = forms.map((f) => f.slug);

  // Get form counts
  const totalForms = await getTotalFormCountbyWorkspaceId(
    workspaceId,
    dateFrom,
    dateTo
  );
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

  // Optimized: Get all metrics in parallel with single queries
  const [totalViews, totalStarts, avgCompletionTime] = await Promise.all([
    getTotalViewsBySlugs(slugs, dateFrom, dateTo),
    getTotalFormStartsBySlugs(slugs, dateFrom, dateTo),
    getAverageCompletionTimeBySlugs(slugs, dateFrom, dateTo),
  ]);

  metrics.totalViews = totalViews;
  metrics.totalStarts = totalStarts;
  metrics.avgCompletionTime = avgCompletionTime;

  const totalDropoffs = Math.max(0, totalStarts - totalSubmissions);
  const dropoffRate =
    totalStarts > 0
      ? parseFloat(((totalDropoffs / totalStarts) * 100).toFixed(2))
      : 0;

  metrics.totalDropoffs = totalDropoffs;
  metrics.dropoffRate = dropoffRate;

  return metrics;
};

/**
 * Get dashboard overview data with comparisons
 */
export const getDashboardData = async (
  workspaceId: string,
  range: RangeOption
) => {
  const { dateFrom, dateTo } = getDateRange(range);
  const { prevFrom, prevTo } = getPreviousRange(dateFrom, dateTo);

  const current = await getMetricsForRange(workspaceId, dateFrom, dateTo);
  const previous = await getMetricsForRange(workspaceId, prevFrom, prevTo);

  const metrics = {
    totalForms: {
      ...calcChange(current.totalForms, previous.totalForms),
      value: current.totalForms,
    },
    publishedForms: {
      ...calcChange(current.publishedForms, previous.publishedForms),
      value: current.publishedForms,
    },
    totalViews: {
      ...calcChange(current.totalViews, previous.totalViews),
      value: current.totalViews.toLocaleString(),
    },
    formStarts: {
      ...calcChange(current.totalStarts, previous.totalStarts),
      value: current.totalStarts.toLocaleString(),
    },
    formSubmissions: {
      ...calcChange(current.totalSubmissions, previous.totalSubmissions),
      value: current.totalSubmissions.toLocaleString(),
    },
    dropoffs: {
      ...calcChange(current.totalDropoffs, previous.totalDropoffs),
      value: current.totalDropoffs.toLocaleString(),
    },
    dropoffRate: {
      ...calcChange(current.dropoffRate, previous.dropoffRate),
      value: `${current.dropoffRate.toFixed(2)}%`,
    },
    avgCompletionTime: {
      ...calcChange(current.avgCompletionTime, previous.avgCompletionTime),
      value: formatTime(current.avgCompletionTime),
    },
  };

  return metrics;
};

/**
 * Get trends chart data (views, starts, submissions over time)
 */
export const getTrendsChartData = async (
  workspaceId: string,
  range: RangeOption
) => {
  const { dateFrom, dateTo } = getDateRange(range);

  const forms = await getFormsByWorkspaceId(workspaceId);
  const slugs = forms.map((f) => f.slug);

  const interval = ["24h", "1d"].includes(range as string) ? "6 hour" : "1 day";

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
  ).sort();

  // Combine daily totals into chart-friendly objects
  return allDates.map((date) => {
    const view = views.find((v) => v.date === date);
    const start = starts.find((s) => s.date === date);
    const submission = submissions.find((x) => x.date === date);

    return {
      date,
      views: view?.total || 0,
      starts: start?.total || 0,
      submissions: submission?.total || 0,
    };
  });
};

/**
 * Get geographic distribution data
 */
export const getGeographicData = async (
  workspaceId: string,
  range: RangeOption
) => {
  const { dateFrom, dateTo } = getDateRange(range);
  const forms = await getFormsByWorkspaceId(workspaceId);
  const slugs = forms.map((f) => f.slug);

  const viewsByCountry: CountryMetric[] = await getViewsByCountry(
    slugs,
    dateFrom,
    dateTo,
    10 // Top 10 countries
  );

  return viewsByCountry;
};

/**
 * Get device type distribution data
 */
export const getDeviceTypeData = async (
  workspaceId: string,
  range: RangeOption
) => {
  const { dateFrom, dateTo } = getDateRange(range);
  const forms = await getFormsByWorkspaceId(workspaceId);
  const slugs = forms.map((f) => f.slug);

  const viewsByDevice: DeviceMetric[] = await getViewsByDevice(
    slugs,
    dateFrom,
    dateTo
  );

  // Calculate total views
  const totalViews = viewsByDevice.reduce(
    (sum, device) => sum + device.count,
    0
  );

  // Calculate percentages
  const viewsByDeviceWithPercentage = viewsByDevice.map((device) => ({
    deviceType: device.deviceType,
    count: device.count,
    percentage: totalViews > 0 ? (device.count / totalViews) * 100 : 0,
  }));

  return viewsByDeviceWithPercentage;
};

/**
 * Get browser distribution data
 */
export const getBrowserData = async (
  workspaceId: string,
  range: RangeOption
) => {
  const { dateFrom, dateTo } = getDateRange(range);
  const forms = await getFormsByWorkspaceId(workspaceId);
  const slugs = forms.map((f) => f.slug);

  const viewsByBrowser: BrowserMetric[] = await getViewsByBrowser(
    slugs,
    dateFrom,
    dateTo,
    10 // Top 10 browsers
  );

  return viewsByBrowser;
};

/**
 * Get traffic source distribution data
 */
export const getTrafficSourceData = async (
  workspaceId: string,
  range: RangeOption
) => {
  const { dateFrom, dateTo } = getDateRange(range);
  const forms = await getFormsByWorkspaceId(workspaceId);
  const slugs = forms.map((f) => f.slug);

  const viewsByTrafficSource: TrafficSourceMetric[] =
    await getViewsByTrafficSource(slugs, dateFrom, dateTo);

  return viewsByTrafficSource;
};

// ===========================
// FUNNEL & CONVERSION DATA
// ===========================

export interface FunnelStage {
  stage: string;
  value: number;
  percentage: number;
  color: string;
  dropoff: number;
}

/**
 * Get conversion funnel data (Views -> Starts -> Submissions)
 */
export const getConversionFunnel = async (
  workspaceId: string,
  range: RangeOption
) => {
  const { dateFrom, dateTo } = getDateRange(range);
  const forms = await getFormsByWorkspaceId(workspaceId);
  const slugs = forms.map((f) => f.slug);

  const totalViews = await getTotalViewsBySlugs(slugs, dateFrom, dateTo);
  const totalStarts = await getTotalFormStartsBySlugs(slugs, dateFrom, dateTo);
  const totalSubmissions = await getSubmissionsCountbyWorkspaceId(
    workspaceId,
    dateFrom,
    dateTo
  );

  // Calculate percentages (all relative to views as 100%)
  const viewsPercentage = 100;
  const startsPercentage =
    totalViews > 0
      ? parseFloat(((totalStarts / totalViews) * 100).toFixed(1))
      : 0;
  const submissionsPercentage =
    totalViews > 0
      ? parseFloat(((totalSubmissions / totalViews) * 100).toFixed(1))
      : 0;

  // Calculate dropoffs (percentage lost from previous stage)
  const viewsToStartsDropoff =
    totalViews > 0
      ? parseFloat((((totalViews - totalStarts) / totalViews) * 100).toFixed(1))
      : 0;
  const startsToSubmissionsDropoff =
    totalStarts > 0
      ? parseFloat(
          (((totalStarts - totalSubmissions) / totalStarts) * 100).toFixed(1)
        )
      : 0;

  return [
    {
      stage: "Views",
      value: totalViews,
      percentage: viewsPercentage,
      color: "#3b82f6",
      dropoff: 0, // No dropoff for the first stage
    },
    {
      stage: "Starts",
      value: totalStarts,
      percentage: startsPercentage,
      color: "#8b5cf6",
      dropoff: viewsToStartsDropoff,
    },
    {
      stage: "Submissions",
      value: totalSubmissions,
      percentage: submissionsPercentage,
      color: "#10b981",
      dropoff: startsToSubmissionsDropoff,
    },
  ];
};

export interface TopForm {
  rank: number;
  name: string;
  slug: string;
  conversionRate: number;
  avgTime: string;
  views: number;
  starts: number;
  submissions: number;
}

/**
 * Get top performing forms by conversion rate
 */
export const getTopForms = async (
  workspaceId: string,
  range: RangeOption,
  limit: number = 10
) => {
  const { dateFrom, dateTo } = getDateRange(range);
  const forms = await getFormsByWorkspaceId(workspaceId);
  const slugs = forms.map((f) => f.slug);

  if (!slugs.length) return [];

  // Get metrics for all forms in parallel
  const [viewsByForm, startsByForm, submissionsByForm, avgTimesByForm] =
    await Promise.all([
      getViewsGroupedByForm(slugs, dateFrom, dateTo),
      getStartsGroupedByForm(slugs, dateFrom, dateTo),
      getSubmissionsGroupedByForm(workspaceId, dateFrom, dateTo),
      getAvgCompletionTimeGroupedByForm(slugs, dateFrom, dateTo),
    ]);

  // Combine metrics and calculate conversion rates
  const formMetrics = forms.map((form) => {
    const views = viewsByForm[form.slug] || 0;
    const starts = startsByForm[form.slug] || 0;
    const submissions = submissionsByForm[form.slug] || 0;
    const avgTimeSeconds = avgTimesByForm[form.slug] || 0;

    const conversionRate =
      views > 0 ? parseFloat(((submissions / views) * 100).toFixed(1)) : 0;

    return {
      slug: form.slug,
      name: form.title || form.slug,
      conversionRate,
      avgTime: formatTime(avgTimeSeconds),
      views,
      starts,
      submissions,
    };
  });

  // Sort by conversion rate descending and assign ranks
  const sortedForms = formMetrics
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, limit)
    .map((form, index) => ({
      rank: index + 1,
      name: form.name,
      slug: form.slug,
      conversionRate: form.conversionRate,
      avgTime: form.avgTime,
      views: form.views,
      starts: form.starts,
      submissions: form.submissions,
    }));

  return sortedForms;
};

export interface FormSummaryDB {
  id: string;
  slug: string;
  name: string;
  status: string;
  createdAt: string;
  completions: number;
}

export interface FormWithAnalytics {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  views: number;
  completions: number;
  rate: number;
}

export interface PaginatedFormsResult {
  forms: FormWithAnalytics[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const enrichFormsWithAnalytics = async (
  formsSummary: FormSummaryDB[]
): Promise<FormWithAnalytics[]> => {
  if (!formsSummary.length) return [];

  // Extract slugs
  const slugs = formsSummary.map(f => f.slug);

  // Get views from PostHog (all time)
  const allTimeStart = new Date('2025-01-01').toISOString();
  const now = new Date().toISOString();
  
  const viewsByForm = await getViewsGroupedByForm(slugs, allTimeStart, now);

  // Enrich forms with views and calculate rates
  return formsSummary.map(form => {
    const views = viewsByForm[form.slug] || 0;
    const rate = views > 0 
      ? parseFloat(((form.completions / views) * 100).toFixed(1))
      : 0;

    return {
      id: form.id,
      slug: form.slug,
      name: form.name,
      status: form.status,
      createdAt: form.createdAt,
      views,
      completions: form.completions,
      rate,
    };
  });
};

export const getWorkspaceFormsData = async (
  workspaceId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedFormsResult> => {
  // Step 1: Get forms from database with pagination
  const dbData = await getWorkspaceFormsSummary(workspaceId, page, pageSize);

  // Step 2: Enrich with PostHog analytics
  const formsWithAnalytics = await enrichFormsWithAnalytics(dbData.forms);

  // Step 3: Return complete data
  return {
    forms: formsWithAnalytics,
    totalCount: dbData.totalCount,
    page: dbData.page,
    pageSize: dbData.pageSize,
    totalPages: dbData.totalPages,
  };
};