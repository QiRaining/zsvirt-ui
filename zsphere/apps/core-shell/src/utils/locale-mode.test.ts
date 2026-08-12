import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getZsvEffectiveLocale,
  shouldRenderLanguageSwitcher,
} from "./locale-mode";

describe("ZSV locale mode", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps the requested locale outside English Only mode", () => {
    vi.stubGlobal("__ZSV_ENGLISH_ONLY__", false);

    expect(getZsvEffectiveLocale("zh-CN")).toBe("zh-CN");
    expect(shouldRenderLanguageSwitcher()).toBe(true);
  });

  it("forces en-US and hides language switching in English Only mode", () => {
    vi.stubGlobal("__ZSV_ENGLISH_ONLY__", true);

    expect(getZsvEffectiveLocale("zh-CN")).toBe("en-US");
    expect(getZsvEffectiveLocale()).toBe("en-US");
    expect(shouldRenderLanguageSwitcher()).toBe(false);
  });
});
