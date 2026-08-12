import dayjs from "dayjs";

import type { ApiInspectorDetailExtend } from "./utils";

export type ExportFormat = "json" | "har" | "csv" | "clipboard";

function deduplicateItems(
  items: ApiInspectorDetailExtend[],
): ApiInspectorDetailExtend[] {
  const seen = new Set<string>();
  const result: ApiInspectorDetailExtend[] = [];

  const addItem = (item: ApiInspectorDetailExtend): void => {
    const key = item.apiId ?? `${item.traceId}-${item.timestamp}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  };

  for (const item of items) {
    addItem(item);
    if (item.children) {
      for (const child of item.children) {
        addItem(child);
      }
    }
  }

  return result;
}

export function formatRequestForExport(
  item: ApiInspectorDetailExtend,
): Record<string, unknown> {
  const formatted: Record<string, unknown> = {
    apiId: item.apiId,
    method: item.method,
    reqPath: item.reqPath,
    body: item.body,
    response: item.response,
    sdkName: item.sdkName,
    traceId: item.traceId,
    timestamp: item.timestamp,
    responseTime: item.responseTime,
    status: item.status,
    webHookResponse: item.webHookResponse,
    zql: item.zql,
  };

  if (item.children && item.children.length > 0) {
    formatted.children = item.children.map((child) =>
      formatRequestForExport(child),
    );
  }

  return formatted;
}

function escapeCSVField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function exportAsJSON(items: ApiInspectorDetailExtend[]): void {
  const deduplicated = deduplicateItems(items);
  const formatted = deduplicated.map((item) => formatRequestForExport(item));
  const content = JSON.stringify(formatted, null, 2);
  const blob = new Blob([content], { type: "application/json" });
  const filename = `api-inspector-export-${dayjs().format("YYYY-MM-DD_HHmmss")}.json`;
  triggerDownload(blob, filename);
}

export function exportAsHAR(items: ApiInspectorDetailExtend[]): void {
  const deduplicated = deduplicateItems(items);

  const entries = deduplicated.map((item) => {
    const startedDateTime = item.timestamp
      ? dayjs(item.timestamp).toISOString()
      : dayjs().toISOString();

    return {
      startedDateTime,
      time: item.responseTime ?? 0,
      request: {
        method: item.method ?? "GET",
        url: item.reqPath ?? "",
        httpVersion: "HTTP/1.1",
        headers: [],
        queryString: [],
        postData: item.body
          ? { mimeType: "application/json", text: item.body }
          : undefined,
        headersSize: -1,
        bodySize: -1,
      },
      response: {
        status: 200,
        statusText: "OK",
        httpVersion: "HTTP/1.1",
        headers: [],
        content: {
          size: -1,
          mimeType: "application/json",
          text: item.response ?? "",
        },
        redirectURL: "",
        headersSize: -1,
        bodySize: -1,
      },
      cache: {},
      timings: { send: 0, wait: item.responseTime ?? 0, receive: 0 },
    };
  });

  const har = {
    log: {
      version: "1.2",
      creator: { name: "ZStack API Inspector", version: "1.0" },
      entries,
    },
  };

  const content = JSON.stringify(har, null, 2);
  const blob = new Blob([content], { type: "application/json" });
  const filename = `api-inspector-export-${dayjs().format("YYYY-MM-DD_HHmmss")}.har`;
  triggerDownload(blob, filename);
}

export function exportAsCSV(items: ApiInspectorDetailExtend[]): void {
  const deduplicated = deduplicateItems(items);
  const headers = [
    "Method",
    "Path",
    "Status",
    "Duration(ms)",
    "TraceId",
    "Timestamp",
  ];
  const rows: string[] = [headers.map(escapeCSVField).join(",")];

  for (const item of deduplicated) {
    const row = [
      escapeCSVField(item.method ?? ""),
      escapeCSVField(item.reqPath ?? ""),
      escapeCSVField(item.status ?? ""),
      escapeCSVField(String(item.responseTime ?? "")),
      escapeCSVField(item.traceId ?? ""),
      escapeCSVField(
        item.timestamp
          ? dayjs(item.timestamp).format("YYYY-MM-DD HH:mm:ss")
          : "",
      ),
    ];
    rows.push(row.join(","));
  }

  const content = "﻿" + rows.join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const filename = `api-inspector-export-${dayjs().format("YYYY-MM-DD_HHmmss")}.csv`;
  triggerDownload(blob, filename);
}

export async function copyToClipboard(
  items: ApiInspectorDetailExtend[],
): Promise<boolean> {
  const deduplicated = deduplicateItems(items);
  const formatted = deduplicated.map((item) => formatRequestForExport(item));
  const content = JSON.stringify(formatted, null, 2);
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch {
    return false;
  }
}
