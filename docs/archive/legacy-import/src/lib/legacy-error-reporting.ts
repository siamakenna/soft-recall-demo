type LegacyErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type LegacyEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: LegacyErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __legacyEvents?: LegacyEvents;
  }
}

export function reportLegacyImportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.__legacyEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );
}
