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

// Optimized: Single query for all slugs
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

    // Build URL conditions
    const urlConditions = slugs
      .map((slug) => `'${process.env.NEXT_PUBLIC_BASE_URL}/form/${slug}'`)
      .join(", ");

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT count() as total_views
          FROM events
          WHERE event = '$pageview'
            AND properties.\$current_url IN (${urlConditions})
            AND timestamp >= toDateTime('${dateFrom}')
            AND timestamp < toDateTime('${dateTo}')
            AND NOT (properties.\$current_url LIKE '%localhost%' OR properties.\$current_url LIKE '%127.0.0.1%')
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
        data: error.response?.data,
      });
    }
    return 0;
  }
};

// Optimized: Single query for all slugs
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

    // Build slug conditions
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
      console.error("API Error:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return 0;
  }
};

// Optimized: Single query for all slugs
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

    // Build slug conditions
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
      console.error("PostHog API Error:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return 0;
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

export const getViewsByCountry = async (
  slugs: string[],
  dateFrom: string,
  dateTo: string,
  limit: number = 10
) => {
  if (!slugs?.length) return [];

  try {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;

    // Build URL conditions
    const urlConditions = slugs
      .map((slug) => `'${process.env.NEXT_PUBLIC_BASE_URL}/form/${slug}'`)
      .join(", ");

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT 
            properties.\$geoip_country_name as country,
            properties.\$geoip_country_code as country_code,
            count() as total_views
          FROM events
          WHERE event = '$pageview'
            AND properties.\$current_url IN (${urlConditions})
            AND timestamp >= toDateTime('${dateFrom}')
            AND timestamp < toDateTime('${dateTo}')
            AND properties.\$geoip_country_name IS NOT NULL
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
      country: r[0] || 'Unknown',
      countryCode: r[1] || 'XX',
      views: r[2] || 0,
    }));

    return results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("PostHog API Error:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return [];
  }
};

export const getViewsByDevice = async (
  slugs: string[],
  dateFrom: string,
  dateTo: string
) => {
  if (!slugs?.length) return [];

  try {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;

    // Build URL conditions
    const urlConditions = slugs
      .map((slug) => `'${process.env.NEXT_PUBLIC_BASE_URL}/form/${slug}'`)
      .join(", ");

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT 
            properties.\$device_type as device_type,
            count() as total_views
          FROM events
          WHERE event = '$pageview'
            AND properties.\$current_url IN (${urlConditions})
            AND timestamp >= toDateTime('${dateFrom}')
            AND timestamp < toDateTime('${dateTo}')
            AND properties.\$device_type IS NOT NULL
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
    const totalViews = results.reduce((sum: number, r: any) => sum + (r[1] || 0), 0);

    // Map results with percentages
    const deviceMetrics: DeviceMetric[] = results.map((r: any) => {
      const count = r[1] || 0;  // Fixed: was 'views'
      return {
        deviceType: r[0] || 'Unknown',
        count: count,  // Fixed: was 'views'
        percentage: totalViews > 0 ? (count / totalViews) * 100 : 0,
      };
    });

    return deviceMetrics;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("PostHog API Error:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return [];
  }
};

export const getViewsByBrowser = async (
  slugs: string[],
  dateFrom: string,
  dateTo: string,
  limit: number = 10
) => {
  if (!slugs?.length) return [];

  try {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;

    // Build URL conditions
    const urlConditions = slugs
      .map((slug) => `'${process.env.NEXT_PUBLIC_BASE_URL}/form/${slug}'`)
      .join(", ");

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT 
            properties.\$browser as browser,
            count() as total_views
          FROM events
          WHERE event = '$pageview'
            AND properties.\$current_url IN (${urlConditions})
            AND timestamp >= toDateTime('${dateFrom}')
            AND timestamp < toDateTime('${dateTo}')
            AND properties.\$browser IS NOT NULL
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
    const totalViews = results.reduce((sum: number, r: any) => sum + (r[1] || 0), 0);

    // Map results with percentages
    const browserMetrics: BrowserMetric[] = results.map((r: any) => {
      const count = r[1] || 0;
      return {
        browser: r[0] || 'Unknown',
        count: count,
        percentage: totalViews > 0 ? (count / totalViews) * 100 : 0,
      };
    });

    return browserMetrics;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("PostHog API Error:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return [];
  }
};

export const getViewsByTrafficSource = async (
  slugs: string[],
  dateFrom: string,
  dateTo: string
) => {
  if (!slugs?.length) return [];

  try {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const url = `${host}/api/projects/${projectId}/query/`;

    // Build URL conditions
    const urlConditions = slugs
      .map((slug) => `'${process.env.NEXT_PUBLIC_BASE_URL}/form/${slug}'`)
      .join(", ");

    const payload = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT 
            multiIf(
              properties.\$utm_source IS NOT NULL OR properties.\$utm_medium IS NOT NULL, 'Paid/Campaign',
              properties.\$referring_domain IN ('google.com', 'www.google.com', 'bing.com', 'www.bing.com', 'yahoo.com', 'www.yahoo.com', 'duckduckgo.com', 'www.duckduckgo.com', 'baidu.com', 'www.baidu.com'), 'Organic Search',
              properties.\$referring_domain IN ('facebook.com', 'www.facebook.com', 'twitter.com', 'www.twitter.com', 'x.com', 'www.x.com', 'linkedin.com', 'www.linkedin.com', 'instagram.com', 'www.instagram.com', 'reddit.com', 'www.reddit.com', 'pinterest.com', 'www.pinterest.com', 'tiktok.com', 'www.tiktok.com', 'youtube.com', 'www.youtube.com'), 'Social',
              properties.\$referring_domain IS NOT NULL AND properties.\$referring_domain != '', 'Referral',
              'Direct'
            ) as traffic_source,
            count() as total_views
          FROM events
          WHERE event = '$pageview'
            AND properties.\$current_url IN (${urlConditions})
            AND timestamp >= toDateTime('${dateFrom}')
            AND timestamp < toDateTime('${dateTo}')
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
    const totalViews = results.reduce((sum: number, r: any) => sum + (r[1] || 0), 0);

    // Map results with percentages
    const trafficSourceMetrics: TrafficSourceMetric[] = results.map((r: any) => {
      const count = r[1] || 0;
      return {
        source: r[0] || 'Unknown',
        count: count,
        percentage: totalViews > 0 ? (count / totalViews) * 100 : 0,
      };
    });

    return trafficSourceMetrics;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("PostHog API Error:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return [];
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
  const slugs = forms.map(f => f.slug);

  // Get form counts
  const totalForms = await getTotalFormCountbyWorkspaceId(workspaceId, dateFrom, dateTo);
  const publishedForms = await getPublishedFormCountbyWorkspaceId(workspaceId, dateFrom, dateTo);
  const totalSubmissions = await getSubmissionsCountbyWorkspaceId(workspaceId, dateFrom, dateTo);

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
  const dropoffRate = totalStarts > 0 
    ? parseFloat(((totalDropoffs / totalStarts) * 100).toFixed(2))
    : 0;

  metrics.totalDropoffs = totalDropoffs;
  metrics.dropoffRate = dropoffRate;

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

interface CountryMetric {
  country: string;
  countryCode: string;
  views: number;
}

export const getGeographicData = async (
  workspaceId: string,
  range: RangeOption
) => {
  const { dateFrom, dateTo } = getDateRange(range);
  const forms = await getFormsByWorkspaceId(workspaceId);
  const slugs = forms.map(f => f.slug);

  // Get geographic data
  const viewsByCountry: CountryMetric[] = await getViewsByCountry(
    slugs,
    dateFrom,
    dateTo,
    10 // Top 10 countries
  );

  return viewsByCountry;
}

export interface DeviceMetric {
  deviceType: string; // e.g., "Mobile", "Desktop", "Tablet"
  count: number;      // Changed from 'views' to 'count'
  percentage: number; // percentage of total views (0-100)
}

export const getDeviceTypeData = async (
  workspaceId: string,
  range: RangeOption
) => {
  const { dateFrom, dateTo } = getDateRange(range);
  const forms = await getFormsByWorkspaceId(workspaceId);
  const slugs = forms.map(f => f.slug);

  // Get device data broken down by $device_type
  const viewsByDevice: DeviceMetric[] = await getViewsByDevice(
    slugs,
    dateFrom,
    dateTo
  );

  // Calculate total views
  const totalViews = viewsByDevice.reduce((sum, device) => sum + device.count, 0);

  // Calculate percentages
  const viewsByDeviceWithPercentage = viewsByDevice.map(device => ({
    deviceType: device.deviceType,
    count: device.count,
    percentage: totalViews > 0 ? (device.count / totalViews) * 100 : 0
  }));

  return viewsByDeviceWithPercentage;
}

export interface BrowserMetric {
  browser: string;    // e.g., "Chrome", "Safari", "Firefox", "Edge"
  count: number;
  percentage: number; // percentage of total views (0-100)
}

export const getBrowserData = async (
  workspaceId: string,
  range: RangeOption
) => {
  const { dateFrom, dateTo } = getDateRange(range);
  const forms = await getFormsByWorkspaceId(workspaceId);
  const slugs = forms.map(f => f.slug);

  // Get browser data broken down by $browser
  const viewsByBrowser: BrowserMetric[] = await getViewsByBrowser(
    slugs,
    dateFrom,
    dateTo,
    10 // Top 10 browsers
  );

  return viewsByBrowser;
}

export interface TrafficSourceMetric {
  source: string;     // e.g., "Direct", "Organic Search", "Social", "Referral", "Paid/Campaign"
  count: number;
  percentage: number; // percentage of total views (0-100)
}

export const getTrafficSourceData = async (
  workspaceId: string,
  range: RangeOption
) => {
  const { dateFrom, dateTo } = getDateRange(range);
  const forms = await getFormsByWorkspaceId(workspaceId);
  const slugs = forms.map(f => f.slug);

  // Get traffic source data
  const viewsByTrafficSource: TrafficSourceMetric[] = await getViewsByTrafficSource(
    slugs,
    dateFrom,
    dateTo
  );

  return viewsByTrafficSource;
}