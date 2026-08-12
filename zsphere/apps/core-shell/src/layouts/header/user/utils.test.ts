import { afterEach, describe, expect, it, vi } from "vitest";

import { shouldRenderAccountLanguageMenuItem } from "./utils";

describe("account user menu helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the language menu item outside English Only mode", () => {
    vi.stubGlobal("__ZSV_ENGLISH_ONLY__", false);

    expect(shouldRenderAccountLanguageMenuItem()).toBe(true);
  });

  it("hides the language menu item in English Only mode", () => {
    vi.stubGlobal("__ZSV_ENGLISH_ONLY__", true);

    expect(shouldRenderAccountLanguageMenuItem()).toBe(false);
  });
});
