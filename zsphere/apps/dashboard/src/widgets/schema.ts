import { z } from "zod";

export const createAddWidgetSchema = () =>
  z.object({
    type: z.string().optional(),
    quotaUsageType: z.string().optional(),
    resource: z.string().optional(),
    statisticsResource: z.string().optional(),
    monitorItem: z.string().optional(),
    trendResource: z.string().optional(),
    trendMetricName: z.string().optional(),
    topResource: z.string().optional(),
    topMetricName: z.string().optional(),
    limit: z.union([z.string(), z.number()]).optional(),
  });

export type AddWidgetFormValues = z.infer<
  ReturnType<typeof createAddWidgetSchema>
>;
