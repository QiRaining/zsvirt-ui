import type { CSSProperties } from "react";

export type FieldSize = "s" | "m" | "l";

export const FIELD_SIZE_CLASS: Record<FieldSize, string> = {
  s: "w-[240px]",
  m: "w-[320px]",
  l: "w-[400px]",
};

const FIELD_SIZE_WIDTH: Record<FieldSize, number> = {
  s: 240,
  m: 320,
  l: 400,
};

const LEGACY_SIZE_CLASS: Record<string, FieldSize> = {
  "width-240": "s",
  "width-320": "m",
  "width-400": "l",
  "w-60": "s",
  "w-80": "m",
  "w-100": "l",
};

const isWidthClass = (className: string) =>
  className === "w-full" ||
  className.startsWith("w-") ||
  className.startsWith("!w-") ||
  className.startsWith("min-w-") ||
  className.startsWith("max-w-");

export const resolveFieldSize = (className?: string, size?: FieldSize) => {
  if (size) {
    return size;
  }

  const matchedClass = className
    ?.split(/\s+/)
    .find((name) => name in LEGACY_SIZE_CLASS);

  return matchedClass ? LEGACY_SIZE_CLASS[matchedClass] : "m";
};

const hasLegacySizeClass = (className?: string) =>
  Boolean(className?.split(/\s+/).some((name) => name in LEGACY_SIZE_CLASS));

const hasCustomWidthClass = (className?: string) =>
  Boolean(
    className
      ?.split(/\s+/)
      .some((name) => isWidthClass(name) && !(name in LEGACY_SIZE_CLASS)),
  );

export const getFieldSizeClass = (className?: string, size?: FieldSize) => {
  if (!size && hasCustomWidthClass(className)) {
    return undefined;
  }

  return FIELD_SIZE_CLASS[resolveFieldSize(className, size)];
};

export const getFieldSizeStyle = (
  className?: string,
  size?: FieldSize,
  style?: CSSProperties,
): CSSProperties | undefined => {
  if (
    !size &&
    className &&
    (!hasLegacySizeClass(className) || hasCustomWidthClass(className))
  ) {
    return style;
  }

  return {
    ...style,
    width: FIELD_SIZE_WIDTH[resolveFieldSize(className, size)],
  };
};

export const stripLegacySizeClass = (className?: string) =>
  className
    ?.split(/\s+/)
    .filter((name) => name && !(name in LEGACY_SIZE_CLASS))
    .join(" ");
