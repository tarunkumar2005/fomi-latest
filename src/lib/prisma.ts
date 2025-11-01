import { prisma } from "./db";
import { nanoid } from "nanoid";
import type { Form } from "@prisma/client";
import { getDateRange } from "@/utils/getDateRange";
import { RangeOption } from "@/types/dashboard";

export const createNewForm = async (
  workspaceId: string,
  userId: string,
  title?: string,
  description?: string
): Promise<Form> => {
  // 1. Verify that user is a member of the workspace
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("User is not a member of this workspace.");
  }

  // 2. Allow only admins to create forms
  if (member.role !== "ADMIN") {
    throw new Error("Only workspace admins can create new forms.");
  }

  // 3. Generate title and slug
  const formTitle = title?.trim() || "Untitled Form";
  const formSlug =
    formTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") +
    "-" +
    nanoid(6);

  const existingForm = await prisma.form.findUnique({
    where: {
      slug: formSlug,
    },
  });

  if (existingForm) {
    // Extremely rare case of slug collision Recall the function recursively
    return createNewForm(workspaceId, userId, title, description);
  }

  // 4. Create form
  const newForm = await prisma.form.create({
    data: {
      title: formTitle,
      description: description || "",
      slug: formSlug,
      workspace: { connect: { id: workspaceId } },
      owner: { connect: { id: userId } },
      version: 1,
      status: "DRAFT",
    },
  });

  // 5. Create default section
  await prisma.section.create({
    data: {
      formId: newForm.id,
      title: "Section 1",
      order: 1,
      description: "Start building your form here",
    },
  });

  // 6. Notify creator
  await prisma.notification.create({
    data: {
      userId,
      type: "FORM_CREATED",
      title: "New Form Created",
      message: `New form "${newForm.title}" has been created successfully.`,
      metadata: {
        formId: newForm.id,
        formSlug,
        workspaceId,
      },
    },
  });

  return newForm;
};

export const getAllWorkspaces = async (userId: string) => {
  return prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId: userId,
        },
      },
    },
  });
}

export const getFormsByWorkspaceId = async (workspaceId: string) => {
  return prisma.form.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export const getTotalFormCountbyWorkspaceId = async (workspaceId: string, range: RangeOption) => {
  const { dateFrom, dateTo } = getDateRange(range);

  return prisma.form.count({
    where: {
      workspaceId,
      createdAt: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      },
    },
  });
};

export const getPublishedFormCountbyWorkspaceId = async (workspaceId: string, range: RangeOption) => {
  const { dateFrom, dateTo } = getDateRange(range);

  return prisma.form.count({
    where: {
      workspaceId,
      status: "PUBLISHED",
      publishedAt: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      },
    },
  });
};

export const getSubmissionsCountbyWorkspaceId = async (workspaceId: string, range: RangeOption) => {
  const { dateFrom, dateTo } = getDateRange(range);

  return prisma.response.count({
    where: {
      form: {
        workspaceId,
      },
      submittedAt: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      },
      isComplete: true,
      isSpam: false,
    },
  });
};

// export const getDashboardOverview = async (
//   workspaceId: string, 
//   range: RangeOption
// ) => {
//   // 1. Determine time range in ms
//   const days =
//     range === "24h" ? 1 :
//     range === "7d" ? 7 :
//     range === "30d" ? 30 :
//     90;
  
//   const endAt = Date.now();
//   const startAt = endAt - days * 24 * 60 * 60 * 1000;

//   // 2. Fetch total forms and published forms created in range
//   const [totalForms, totalPublishedForms, forms] = await Promise.all([
//     prisma.form.count({ 
//       where: { 
//         workspaceId,
//         createdAt: { gte: new Date(startAt), lte: new Date(endAt) } 
//       } 
//     }),
    
//     prisma.form.count({ 
//       where: { 
//         workspaceId,
//         status: "PUBLISHED",
//         publishedAt: { 
//           gte: new Date(startAt),
//           lte: new Date(endAt)
//         } 
//       } 
//     }),
    
//     // Get all forms in this workspace
//     prisma.form.findMany({
//       where: { 
//         workspaceId,
//         createdAt: { lte: new Date(endAt) }
//       },
//       select: { slug: true },
//     }),
//   ]);

//   // 3. Fetch views from Umami
//   const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

//   let totalViews = 0;

//   if (umamiWebsiteId && forms.length > 0) {
//     try {
//       // Get URL metrics for all forms
//       const urlMetrics = await client.getWebsiteMetrics(umamiWebsiteId, {
//         startAt,
//         endAt,
//         type: 'url',
//       });

//       // Filter and sum views for our form URLs
//       totalViews = urlMetrics?.data?.reduce((sum: number, item: any) => {
//         // Check if URL matches any of our forms: /form/{slug}
//         const isFormUrl = forms.some(form => item.x === `/form/${form.slug}`);
//         return isFormUrl ? sum + (item.y ?? 0) : sum;
//       }, 0) ?? 0;

//     } catch (error) {
//       console.error('Failed to fetch Umami views:', error);
//     }
//   }

//   let totalStarts = 0;

//   if (umamiWebsiteId && forms.length > 0) {
//     try {
//       const metrics = await client.getWebsiteMetrics(umamiWebsiteId, {
//         startAt,
//         endAt,
//         type: 'event',
//         event: 'form-start',
//       });

//       const formStartMetric = metrics?.data?.find(m => m.x === 'form-start');
//       const totalStarts = formStartMetric?.y ?? 0;
//     } catch (error) {
//       console.error('Failed to fetch form starts:', error);
//     }
//   }

//   // Fetch average completion time
//   let avgCompletionTime = 0;

//   if (umamiWebsiteId && forms.length > 0) {
//     try {
//       // Get the event data to access the 'time' property values
//       const eventData = await client.getEventDataEvents(umamiWebsiteId, {
//         startAt,
//         endAt,
//         event: "completion-time",
//       });

//       // Filter for 'time' property entries and extract the numeric values
//       const completionTimes = eventData?.data
//         ?.filter((event: any) => event.propertyName === 'time')
//         .map((event: any) => parseFloat(event.propertyValue))
//         .filter((time: number) => !isNaN(time) && time > 0) ?? [];

//       // Calculate average (values are in milliseconds, convert to seconds)
//       if (completionTimes.length > 0) {
//         const totalMs = completionTimes.reduce((sum: number, time: number) => sum + time, 0);
//         avgCompletionTime = totalMs / completionTimes.length / 1000; // Convert to seconds
//       }

//     } catch (error) {
//       console.error('Failed to fetch completion time:', error);
//     }
//   }

//   // 4. Fetch submissions from DB in range
//   const totalSubmissions = await prisma.response.count({
//     where: { 
//       form: { workspaceId },
//       submittedAt: { 
//         gte: new Date(startAt),
//         lte: new Date(endAt)
//       },
//       isComplete: true,
//       isSpam: false,
//     },
//   });

//   // 5. Calculate drop-offs and drop-off rate
//   const totalDropoffs = Math.max(0, totalStarts - totalSubmissions);
//   const dropoffRate = totalStarts > 0 
//     ? parseFloat(((totalDropoffs / totalStarts) * 100).toFixed(2))
//     : 0;

//   return {
//     totalForms,
//     totalPublishedForms,
//     totalViews,
//     totalStarts,
//     totalSubmissions,
//     totalDropoffs,
//     dropoffRate,
//     avgCompletionTime,
//   };
// };

// export const getDashboardTrends = async (
//   workspaceId: string, 
//   range: RangeOption
// ) => {
//   const days =
//     range === "24h" ? 1 :
//     range === "7d" ? 7 :
//     range === "30d" ? 30 :
//     90;
  
//   const endAt = Date.now();
//   const startAt = endAt - days * 24 * 60 * 60 * 1000;

//   // Fetch all forms in this workspace
//   const forms = await prisma.form.findMany({
//     where: { 
//       workspaceId,
//       createdAt: { lte: new Date(endAt) }
//     },
//     select: { slug: true },
//   });

//   const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID!;
//   const formUrls = forms.map(form => `/form/${form.slug}`);

//   // Initialize all dates with 0 values
//   const dataByDate: { [date: string]: { views: number; starts: number; submissions: number } } = {};
//   for (let i = 0; i < days; i++) {
//     const date = new Date(startAt + i * 24 * 60 * 60 * 1000);
//     const dateKey = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
//     dataByDate[dateKey] = { views: 0, starts: 0, submissions: 0 };
//   }

//   // 1. Fetch pageviews for each form
//   const allFormPageviews = await Promise.all(
//     formUrls.map(async (url) => {
//       return await client.getWebsitePageviews(umamiWebsiteId, {
//         startAt,
//         endAt,
//         unit: 'day',
//         url: url,
//         timezone: 'Asia/Kolkata'
//       });
//     })
//   );

//   // Aggregate pageviews
//   allFormPageviews.forEach(result => {
//     const pageviews = result?.data?.pageviews || [];
    
//     pageviews.forEach((item: any) => {
//       if (item.x) {
//         const date = new Date(item.x);
//         const dateKey = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
//         if (dataByDate[dateKey]) {
//           dataByDate[dateKey].views += (item.y || 0);
//         }
//       }
//     });
//   });

//   // Try to get event data with time series (if your Umami version supports it)
//   const resp = await client.getWebsiteEvents(umamiWebsiteId, {
//     startAt: startAt.toString(),
//     endAt: endAt.toString(),
//     // Optionally you might need: eventName: 'form-start' (if supported)
//   });

//   // Inspect the returned object:
//   // console.log(JSON.stringify(resp, null, 2));
//   const raw = resp?.data;
//   let events: any[] = [];

//   if (Array.isArray(raw)) {
//     events = raw;
//   } else if (raw && Array.isArray(raw.events)) {
//     events = raw.events;
//   } else {
//     // Fallback: nothing to process
//     events = [];
//   }

//   events.forEach((event: any) => {
//     // You’ll need to inspect the actual field names
//     const name = event.x ?? event.eventName ?? event.name;
//     const timestamp = event.t ?? event.timestamp ?? event.createdAt;
//     const count = event.y ?? event.count ?? 1;

//     if (name === 'form-start' && timestamp) {
//       const date = new Date(timestamp);
//       const dateKey = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
//       if (dataByDate[dateKey]) {
//         dataByDate[dateKey].starts += count;
//       }
//     }
//   });

//   return {
//     chartData: Object.entries(dataByDate).map(([date, { views, starts }]) => ({
//       date,
//       views,
//       starts,
//     }))
//   };
// }