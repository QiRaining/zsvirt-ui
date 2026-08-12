import React from "react";

export type Locale = "zh-CN" | "en-US";
export type Message = Record<string, string>;
export interface LocaleContainerProps {
  children: React.ReactNode;
  currentLocale: Locale;
  messages?: Message;
}
