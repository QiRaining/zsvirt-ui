import { ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

type AdditionalClassGroupIDs = "truncate-line-clamp" | "class-b";

const twMerge = extendTailwindMerge<AdditionalClassGroupIDs>({
  extend: {
    classGroups: {
      "truncate-line-clamp": [
        "truncate",
        "line-clamp-1",
        "line-clamp-2",
        "line-clamp-3",
        "line-clamp-4",
        "line-clamp-5",
        "line-clamp-6",
      ],
      "font-size": [
        "text-xs",
        "text-sm",
        "text-base",
        "text-xl",
        "text-2xl",
        "text-3xl",
        "text-4xl",
        "text-5xl",
      ],
    },
    // 我们的平台里面存在单行截断文本与多行截断文本，这里是帮助统一封装的Text组件
    // 声明truncate和line-clamp是互斥的
    conflictingClassGroups: {
      "truncate-line-clamp": ["truncate-line-clamp"],
      "font-size": ["font-size"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
