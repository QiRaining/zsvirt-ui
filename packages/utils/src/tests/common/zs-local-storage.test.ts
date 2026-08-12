import { describe, it, expect, beforeEach } from "vitest";

import { ZsLocalStorage } from "../../common/zs-local-storage";

describe("ZsLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should set and get create items", () => {
    ZsLocalStorage.setCreateItem("test", "value");
    expect(ZsLocalStorage.getCreateItem("test")).toBe("value");
  });

  it("should set and get detail items", () => {
    ZsLocalStorage.setDetailItem("test", "value");
    expect(ZsLocalStorage.getDetailItem("test")).toBe("value");
  });

  it("should remove items", () => {
    ZsLocalStorage.setCreateItem("test", "value");
    ZsLocalStorage.removeCreateItem("test");
    expect(ZsLocalStorage.getCreateItem("test")).toBeNull();
  });

  it("should clear items", () => {
    ZsLocalStorage.setCreateItem("test", "value");
    ZsLocalStorage.clearItem("zstack");
    expect(ZsLocalStorage.getCreateItem("test")).toBeNull();
  });
});
