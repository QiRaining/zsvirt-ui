import type { IntlShape } from "react-intl";
import { z } from "zod";

export const createStringRules = (intl: IntlShape) => ({
  name: (min: number = 1, max: number = 128) =>
    z
      .string()
      .trim()
      .min(1, {
        message: intl.formatMessage({
          id: "form.rules.name.required",
          defaultMessage: `输入内容不能为空`,
        }),
      })
      .max(max, {
        message: intl.formatMessage(
          {
            id: "form.rules.name.format",
            defaultMessage:
              "{min}-{max} 个字符，支持中文汉字、英文字母、数字、空格和以下 7 种英文字符”-“、”_“、”.“、”(“、”)“、”:“、”+“",
          },
          { min, max },
        ),
      })
      .regex(/^[\u4e00-\u9fa5a-zA-Z0-9\s\-_.():+/]+$/, {
        message: intl.formatMessage(
          {
            id: "form.rules.name.format",
            defaultMessage:
              "{min}-{max} 个字符，支持中文汉字、英文字母、数字、空格和以下 7 种英文字符”-“、”_“、”.“、”(“、”)“、”:“、”+“",
          },
          { min, max },
        ),
      }),
  description: (max: number = 256) =>
    z.string().max(max, {
      message: intl.formatMessage(
        {
          id: "form.rules.description.max",
          defaultMessage: "输入内容需在 0~{max} 字符范围内",
        },
        {
          max,
        },
      ),
    }),
});
