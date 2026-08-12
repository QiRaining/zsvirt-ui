import { z } from "zod";

export const createGpuDeviceGenerateMdevSchema = () =>
  z.object({
    mdevSpecUuid: z.string(),
  });

export type GpuDeviceGenerateMdevFormValues = z.infer<
  ReturnType<typeof createGpuDeviceGenerateMdevSchema>
>;

const optionalNumberValue = z.union([z.number(), z.literal("")]);

export const createGpuDeviceGenerateSriovSchema = (maxPartNum: number) =>
  z
    .object({
      virtPartNum: optionalNumberValue,
    })
    .superRefine((values, ctx) => {
      if (
        values.virtPartNum === "" ||
        !Number.isInteger(values.virtPartNum) ||
        values.virtPartNum < 1 ||
        values.virtPartNum > maxPartNum
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["virtPartNum"],
          message: `输入内容应该为整数数字，设置数值范围为[1, ${maxPartNum}]`,
        });
      }
    });

export type GpuDeviceGenerateSriovFormValues = z.infer<
  ReturnType<typeof createGpuDeviceGenerateSriovSchema>
>;
