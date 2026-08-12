/**
 * Simple Error Handling Strategy
 *
 * This implementation provides a straightforward approach to error handling
 * by using a single fallback component for all types of errors.
 *
 * Benefits:
 * - Simple to understand and implement
 * - Consistent error presentation
 * - Requires minimal configuration
 *
 * Use this when you don't need different handling strategies for different error types.
 */

import type { ModuleFederationRuntimePlugin } from "@module-federation/enhanced/runtime";

interface SimpleConfig {
  errorMessageId?: string;
  errorMessageDefault?: string;
}

export const createSimplePlugin = (
  config: SimpleConfig = {},
): ModuleFederationRuntimePlugin => {
  const {
    errorMessageId = "error.module.loading.description",
    errorMessageDefault = "Module loading failed, please try again later",
  } = config;

  return {
    name: "simple-fallback-plugin",
    async errorLoadRemote() {
      const React = await import("react");
      const { useIntl } = await import("react-intl");

      // SVG illustration for the error state
      const ErrorIllustration = () => {
        return React.createElement(
          "svg",
          {
            width: "200",
            height: "160",
            viewBox: "0 0 200 160",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            className: "mb-6",
          },
          [
            // Server/module icon
            React.createElement("rect", {
              key: "server-bg",
              x: "70",
              y: "20",
              width: "60",
              height: "80",
              rx: "4",
              fill: "#E6EAF0",
            }),
            React.createElement("rect", {
              key: "server-light-1",
              x: "80",
              y: "30",
              width: "10",
              height: "4",
              rx: "2",
              fill: "#F87171",
            }),
            React.createElement("rect", {
              key: "server-light-2",
              x: "80",
              y: "40",
              width: "10",
              height: "4",
              rx: "2",
              fill: "#FCD34D",
            }),
            React.createElement("rect", {
              key: "server-light-3",
              x: "80",
              y: "50",
              width: "10",
              height: "4",
              rx: "2",
              fill: "#10B981",
            }),
            React.createElement("rect", {
              key: "server-slot-1",
              x: "75",
              y: "65",
              width: "50",
              height: "6",
              rx: "2",
              fill: "#D1D5DB",
            }),
            React.createElement("rect", {
              key: "server-slot-2",
              x: "75",
              y: "75",
              width: "50",
              height: "6",
              rx: "2",
              fill: "#D1D5DB",
            }),
            React.createElement("rect", {
              key: "server-slot-3",
              x: "75",
              y: "85",
              width: "50",
              height: "6",
              rx: "2",
              fill: "#D1D5DB",
            }),

            // Error symbol
            React.createElement("circle", {
              key: "error-circle",
              cx: "150",
              cy: "40",
              r: "20",
              fill: "#FEE2E2",
              stroke: "#EF4444",
              strokeWidth: "2",
            }),
            React.createElement("path", {
              key: "error-x",
              d: "M143 33L157 47M157 33L143 47",
              stroke: "#EF4444",
              strokeWidth: "2",
              strokeLinecap: "round",
            }),

            // Connection lines
            React.createElement("path", {
              key: "connection-line",
              d: "M130 50C140 50 140 40 150 40",
              stroke: "#EF4444",
              strokeWidth: "2",
              strokeDasharray: "4 4",
              strokeLinecap: "round",
            }),

            // Cloud icon
            React.createElement("path", {
              key: "cloud",
              d: "M40 80C40 71.7157 46.7157 65 55 65C63.2843 65 70 71.7157 70 80C70 88.2843 63.2843 95 55 95H30C21.7157 95 15 88.2843 15 80C15 71.7157 21.7157 65 30 65C30 56.7157 36.7157 50 45 50C53.2843 50 60 56.7157 60 65",
              stroke: "#6B7280",
              strokeWidth: "2",
              fill: "#F3F4F6",
            }),

            // Warning text
            React.createElement("rect", {
              key: "warning-bg",
              x: "50",
              y: "120",
              width: "100",
              height: "25",
              rx: "4",
              fill: "#FEF3C7",
            }),
            React.createElement("path", {
              key: "warning-icon",
              d: "M65 125H65.01M65 135V130",
              stroke: "#F59E0B",
              strokeWidth: "2",
              strokeLinecap: "round",
            }),
            React.createElement("path", {
              key: "warning-text",
              d: "M75 130H135",
              stroke: "#F59E0B",
              strokeWidth: "1",
              strokeLinecap: "round",
              strokeDasharray: "1 3",
            }),
          ],
        );
      };

      // Create a fallback component with error message and illustration
      const FallbackContent: React.FC = () => {
        const intl = useIntl();

        return React.createElement(
          "div",
          {
            className:
              "w-full h-full flex items-center justify-center bg-neutral-50 p-4",
          },
          React.createElement(
            "div",
            {
              className:
                "flex w-[600px] flex-col items-center text-center rounded-lg bg-white p-6 shadow-sm border border-neutral-200",
            },
            [
              // SVG Illustration
              React.createElement(ErrorIllustration, { key: "illustration" }),

              React.createElement(
                "h3",
                {
                  className: "text-xl font-medium text-danger-600 mb-3",
                  key: "title",
                },
                intl.formatMessage({
                  id: "error.module.loading.title",
                  defaultMessage: "Module Loading Failed",
                }),
              ),
              React.createElement(
                "p",
                {
                  className: "text-neutral-600 mb-6",
                  key: "message",
                },
                intl.formatMessage({
                  id: errorMessageId,
                  defaultMessage: errorMessageDefault,
                }),
              ),
              React.createElement(
                "button",
                {
                  className:
                    "px-4 py-2 bg-theme-600 border-theme-600 text-white rounded-md hover:bg-theme-700 border-0 transition-colors cursor-pointer",
                  onClick: () => window.location.reload(),
                  key: "reload-button",
                },
                intl.formatMessage({
                  id: "error.module.loading.reload",
                  defaultMessage: "Reload Page",
                }),
              ),
            ],
          ),
        );
      };

      FallbackContent.displayName = "ErrorFallbackContent";

      const FallbackComponent = React.memo(FallbackContent);

      return () => ({
        __esModule: true,
        default: FallbackComponent,
      });
    },
  };
};
