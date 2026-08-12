import { afterEach, describe, expect, it, vi } from "vitest";

import { shouldUseChineseChainIllustration } from "./ChainIllustrationModal";

describe("backup chain illustration locale", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not use Chinese illustrations in English Only mode", () => {
    vi.stubGlobal("__ZSV_ENGLISH_ONLY__", true);

    expect(shouldUseChineseChainIllustration("zh-CN")).toBe(false);
    expect(shouldUseChineseChainIllustration("zh_CN")).toBe(false);
  });
});
