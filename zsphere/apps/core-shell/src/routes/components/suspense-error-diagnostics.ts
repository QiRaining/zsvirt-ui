import {
  createErrorBoundaryPayload,
  type CreateErrorBoundaryPayloadOptions,
  type ErrorBoundaryDiagnosticsPayload,
} from "@zstack/error-boundary/diagnostics";

export type SuspenseWrapperErrorPayload = ErrorBoundaryDiagnosticsPayload & {
  source: "SuspenseWrapper";
};

export type CreateSuspenseWrapperErrorPayloadOptions = Omit<
  CreateErrorBoundaryPayloadOptions,
  "source"
>;

export const createSuspenseWrapperErrorPayload = (
  error: unknown,
  options: CreateSuspenseWrapperErrorPayloadOptions = {},
): SuspenseWrapperErrorPayload => {
  return createErrorBoundaryPayload(error, {
    ...options,
    source: "SuspenseWrapper",
  }) as SuspenseWrapperErrorPayload;
};
