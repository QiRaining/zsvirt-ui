/**
 * Get locale from localStorage, handling both quoted and unquoted values
 * localStorage may store locale as: "en-US" (with quotes) or en-US (without quotes)
 * This function normalizes both cases
 */
function getLocaleFromStorage(fallback: string = "zh-CN"): string {
  try {
    // Try new 'locale' key first, then fallback to legacy 'umi_locale'
    let raw = window.localStorage.getItem("locale");
    if (!raw) {
      raw = window.localStorage.getItem("umi_locale");
    }
    if (!raw) return fallback;

    // Try to parse as JSON first (handles quoted strings like '"en-US"')
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "string" && parsed) return parsed;
    } catch {
      // Not valid JSON, treat as plain string
    }

    // Use as-is if it's a plain string
    return raw || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Set locale to localStorage, storing as plain string (not quoted)
 */
function setLocaleToStorage(locale: string): void {
  try {
    window.localStorage.setItem("locale", locale);
    // Also set legacy key for backward compatibility
    window.localStorage.setItem("umi_locale", locale);
  } catch {
    // ignore localStorage errors
  }
}

/**
 * Get locale safely with validation
 * Returns a valid locale string, ensuring it's in format like 'en-US' or 'zh-CN'
 */
function getValidLocale(fallback: string = "zh-CN"): string {
  const locale = getLocaleFromStorage(fallback);

  // Validate format (should be like en-US, zh-CN, etc.)
  if (/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)) {
    return locale;
  }

  return fallback;
}

export { getLocaleFromStorage, setLocaleToStorage, getValidLocale };
