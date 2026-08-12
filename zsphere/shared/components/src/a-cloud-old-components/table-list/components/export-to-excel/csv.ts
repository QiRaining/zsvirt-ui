const UTF8_BOM = "\uFEFF";

const formatDate = (value: Date): string => {
  if (Number.isNaN(value.getTime())) {
    return "#NUM!";
  }
  return `${value.getMonth() + 1}/${value.getDate()}/${String(value.getFullYear()).slice(-2)}`;
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }
  if (value instanceof Date) {
    return formatDate(value);
  }
  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }
  if (typeof value === "number") {
    if (Number.isNaN(value)) {
      return "#NUM!";
    }
    if (!Number.isFinite(value)) {
      return "#DIV/0!";
    }
    return String(value);
  }
  return typeof value === "string" ? value : "";
};

const escapeValue = (value: string): string => {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const serializeCsv = (
  columns: ReadonlyArray<string>,
  rows: ReadonlyArray<Record<string, unknown>>,
): string =>
  `${UTF8_BOM}${rows
    .map((row) =>
      columns.map((column) => escapeValue(formatValue(row[column]))).join(","),
    )
    .join("\n")}`;
