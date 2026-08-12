import { afterEach, describe, expect, it, vi } from "vitest";

import { getGuideImage } from "./use-steps";

vi.mock("@zstack/zsphere-utils", () => ({
  getLocaleFromStorage: vi.fn(),
}));

describe("wizard guide image selection", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses English guide images in English Only mode", () => {
    vi.stubGlobal("__ZSV_ENGLISH_ONLY__", true);

    expect(getGuideImage("createRootNode")).toContain("en-us-root-node.svg");
  });
});
