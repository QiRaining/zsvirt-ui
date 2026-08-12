import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useAuth } from "../src/hooks/use-auth";
import { useAuthContext } from "../src/hooks/use-auth-context";

// Mock useAuthContext hook
vi.mock("../src/hooks/use-auth-context", () => ({
  useAuthContext: vi.fn(),
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("hasAuth", () => {
    it("当没有传入 authKey 时应该返回 false", () => {
      vi.mocked(useAuthContext).mockReturnValue({
        authMap: new Map(),
        licenseExpired: false,
      });

      const { result } = renderHook(() => useAuth());
      expect(result.current.hasAuth(undefined)).toBe(false);
    });

    it("当 authMap 中存在对应的权限时应该返回 true", () => {
      const authMap = new Map();
      authMap.set("resource1||action||auth1", true);

      vi.mocked(useAuthContext).mockReturnValue({
        authMap,
        licenseExpired: false,
      });

      const { result } = renderHook(() => useAuth());
      expect(
        result.current.hasAuth({
          type: "action",
          authKey: "auth1",
          resource: "resource1",
        }),
      ).toBe(true);
    });

    it("当 authMap 中不存在对应的权限时应该返回 false", () => {
      const authMap = new Map();
      authMap.set("resource1||action||auth1", true);

      vi.mocked(useAuthContext).mockReturnValue({
        authMap,
        licenseExpired: false,
      });

      const { result } = renderHook(() => useAuth());
      expect(
        result.current.hasAuth({
          type: "action",
          authKey: "auth2",
          resource: "resource1",
        }),
      ).toBe(false);
    });
  });

  describe("hasLicenseExpired", () => {
    it("即使上下文中 license 过期也应该返回 false", () => {
      vi.mocked(useAuthContext).mockReturnValue({
        authMap: new Map(),
        licenseExpired: true,
      });

      const { result } = renderHook(() => useAuth());
      expect(result.current.hasLicenseExpired()).toBe(false);
    });

    it("当 license 未过期时应该返回 false", () => {
      vi.mocked(useAuthContext).mockReturnValue({
        authMap: new Map(),
        licenseExpired: false,
      });

      const { result } = renderHook(() => useAuth());
      expect(result.current.hasLicenseExpired()).toBe(false);
    });
  });
});
