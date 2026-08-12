"use client";

import type { ReactElement } from "react";

interface ShowProps<T> {
  when: T | boolean;
  fallback?: ReactElement;
  children: ReactElement;
}

export const Show = <T,>(props: ShowProps<T>) => {
  const { when, fallback = null, children } = props;
  return when ? children : fallback;
};
