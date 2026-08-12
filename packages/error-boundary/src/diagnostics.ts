export type ErrorBoundaryLocationSnapshot = {
  href?: string;
  pathname?: string;
  search?: string;
  hash?: string;
};

export type ErrorBoundaryDocumentDiagnostics = {
  canvasCount: number;
  bizchartsElementCount: number;
  activeElement?: string;
};

export type ErrorBoundaryResourceEntry = {
  name: string;
  initiatorType?: string;
  startTime?: number;
  duration?: number;
  transferSize?: number;
  decodedBodySize?: number;
};

export type ErrorBoundaryDiagnosticsPayload = {
  source: string;
  timestamp: string;
  location?: ErrorBoundaryLocationSnapshot;
  error: {
    name?: string;
    message: string;
    stack?: string;
  };
  componentStack?: string;
  dom?: ErrorBoundaryDocumentDiagnostics;
  resources: ErrorBoundaryResourceEntry[];
};

export type CreateErrorBoundaryPayloadOptions = {
  source?: string;
  componentStack?: string;
  now?: () => string;
  getLocation?: () => ErrorBoundaryLocationSnapshot | undefined;
  getDocumentDiagnostics?: () => ErrorBoundaryDocumentDiagnostics | undefined;
  getResourceEntries?: () => ErrorBoundaryResourceEntry[];
};

function safeRead<T>(read: () => T): T | undefined;
function safeRead<T>(read: () => T, fallback: T): T;
function safeRead<T>(read: () => T, fallback?: T): T | undefined {
  try {
    return read();
  } catch {
    return fallback;
  }
}

const toStringValue = (value: unknown): string | undefined => {
  return typeof value === "string" ? value : undefined;
};

const serializeError = (
  error: unknown,
): ErrorBoundaryDiagnosticsPayload["error"] => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (error && typeof error === "object") {
    const errorRecord = error as Record<string, unknown>;
    const message =
      toStringValue(errorRecord.message) ??
      safeRead(
        () => JSON.stringify(errorRecord),
        Object.prototype.toString.call(error),
      );

    return {
      name: toStringValue(errorRecord.name),
      message,
      stack: toStringValue(errorRecord.stack),
    };
  }

  return {
    message: String(error),
  };
};

const getBrowserLocation = (): ErrorBoundaryLocationSnapshot | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const { href, pathname, search, hash } = window.location;
  return {
    href,
    pathname,
    search,
    hash,
  };
};

const formatElementSelector = (element: Element | null): string | undefined => {
  if (!element) {
    return undefined;
  }

  const tagName = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : "";
  const className = Array.from(element.classList)
    .slice(0, 3)
    .map((name) => `.${name}`)
    .join("");

  return `${tagName}${id}${className}`;
};

const getBrowserDocumentDiagnostics = ():
  | ErrorBoundaryDocumentDiagnostics
  | undefined => {
  if (typeof document === "undefined") {
    return undefined;
  }

  return {
    canvasCount: document.querySelectorAll("canvas").length,
    bizchartsElementCount: document.querySelectorAll(
      ".bizcharts, [class*='bizcharts'], [class*='BizCharts']",
    ).length,
    activeElement: formatElementSelector(document.activeElement),
  };
};

const getBrowserResourceEntries = (): ErrorBoundaryResourceEntry[] => {
  if (typeof performance === "undefined") {
    return [];
  }

  return performance
    .getEntriesByType("resource")
    .filter((entry): entry is PerformanceResourceTiming => {
      if (
        !("initiatorType" in entry) ||
        typeof entry.initiatorType !== "string"
      ) {
        return false;
      }

      return (
        ["script", "link", "css"].includes(entry.initiatorType) ||
        /\.(js|css)(\?|$)/.test(entry.name)
      );
    })
    .slice(-20)
    .map((entry) => ({
      name: entry.name,
      initiatorType: entry.initiatorType,
      startTime: Math.round(entry.startTime),
      duration: Math.round(entry.duration),
      transferSize: entry.transferSize,
      decodedBodySize: entry.decodedBodySize,
    }));
};

export const createErrorBoundaryPayload = (
  error: unknown,
  options: CreateErrorBoundaryPayloadOptions = {},
): ErrorBoundaryDiagnosticsPayload => {
  const now = options.now ?? (() => new Date().toISOString());

  return {
    source: options.source ?? "ErrorBoundary",
    timestamp: safeRead(now, new Date().toISOString()),
    location: safeRead(options.getLocation ?? getBrowserLocation),
    error: serializeError(error),
    componentStack: options.componentStack,
    dom: safeRead(
      options.getDocumentDiagnostics ?? getBrowserDocumentDiagnostics,
    ),
    resources: safeRead(
      options.getResourceEntries ?? getBrowserResourceEntries,
      [],
    ),
  };
};
