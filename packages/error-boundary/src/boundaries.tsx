import React, { Suspense } from "react";
import {
  ErrorBoundary as ReactErrorBoundary,
  type ErrorBoundaryPropsWithRender,
  type FallbackProps,
} from "react-error-boundary";

import {
  createErrorBoundaryPayload,
  type CreateErrorBoundaryPayloadOptions,
  type ErrorBoundaryDiagnosticsPayload,
} from "./diagnostics";
import { PanicFallback, type PanicFallbackProps } from "./panic-fallback";

export type ErrorBoundaryFallbackProps = FallbackProps;

export const isChunkLoadError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const errorRecord = error as Record<string, unknown>;
  const name = typeof errorRecord.name === "string" ? errorRecord.name : "";
  const message =
    typeof errorRecord.message === "string" ? errorRecord.message : "";

  return (
    name === "ChunkLoadError" ||
    message.includes("Loading chunk") ||
    message.includes("Failed to fetch dynamically imported module")
  );
};

export type ErrorBoundaryProps = Omit<
  ErrorBoundaryPropsWithRender,
  "fallbackRender" | "onError"
> & {
  fallbackRender?: (props: ErrorBoundaryFallbackProps) => React.ReactNode;
  fallbackProps?: PanicFallbackProps;
  diagnosticsGlobalKey?: string;
  diagnosticsSource?: string;
  createDiagnosticsPayload?: typeof createErrorBoundaryPayload;
  onDiagnostics?: (payload: ErrorBoundaryDiagnosticsPayload) => void;
  onError?: (
    error: Error,
    info: React.ErrorInfo,
    payload: ErrorBoundaryDiagnosticsPayload,
  ) => void;
};

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  fallbackRender,
  fallbackProps,
  diagnosticsGlobalKey,
  diagnosticsSource,
  createDiagnosticsPayload = createErrorBoundaryPayload,
  onDiagnostics,
  onError,
  children,
  ...errorBoundaryProps
}) => {
  return (
    <ReactErrorBoundary
      {...errorBoundaryProps}
      fallbackRender={(props) => {
        if (fallbackRender) {
          return fallbackRender(props);
        }

        return <PanicFallback {...fallbackProps} />;
      }}
      onError={(error, info) => {
        const payload = createDiagnosticsPayload(error, {
          source: diagnosticsSource,
          componentStack: info.componentStack ?? undefined,
        });

        if (diagnosticsGlobalKey && typeof globalThis !== "undefined") {
          (globalThis as Record<string, unknown>)[diagnosticsGlobalKey] =
            payload;
        }

        onDiagnostics?.(payload);
        onError?.(error, info, payload);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export interface SuspenseBoundaryProps extends Omit<
  ErrorBoundaryProps,
  "fallbackRender"
> {
  fallbackRender?: (props: ErrorBoundaryFallbackProps) => React.ReactNode;
  suspenseFallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  chunkRetryDelay?: number;
  diagnosticsOptions?: Omit<
    CreateErrorBoundaryPayloadOptions,
    "componentStack" | "source"
  >;
}

const defaultLoadingFallback = (
  <div className="flex h-full w-full items-center justify-center">
    <div className="text-neutral-400">Loading...</div>
  </div>
);

export const SuspenseBoundary: React.FC<SuspenseBoundaryProps> = ({
  children,
  fallbackRender,
  suspenseFallback = defaultLoadingFallback,
  loadingFallback = suspenseFallback,
  chunkRetryDelay = 100,
  diagnosticsOptions,
  createDiagnosticsPayload = createErrorBoundaryPayload,
  ...errorBoundaryProps
}) => {
  return (
    <ErrorBoundary
      {...errorBoundaryProps}
      createDiagnosticsPayload={(error, options = {}) =>
        createDiagnosticsPayload(error, {
          ...diagnosticsOptions,
          ...options,
        })
      }
      fallbackRender={(props) => {
        if (isChunkLoadError(props.error)) {
          setTimeout(() => {
            props.resetErrorBoundary();
          }, chunkRetryDelay);

          return loadingFallback;
        }

        if (fallbackRender) {
          return fallbackRender(props);
        }

        return <PanicFallback {...errorBoundaryProps.fallbackProps} />;
      }}
    >
      <Suspense fallback={suspenseFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
};
