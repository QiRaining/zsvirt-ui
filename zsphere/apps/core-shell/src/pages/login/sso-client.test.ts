import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchSsoClients, getPrimarySsoLoginUrl } from "./sso-client";

describe("sso client helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches SSO clients from the BFF endpoint", async () => {
    const clients = [{ loginMNUrl: "https://idp.example.com/login" }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => clients,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchSsoClients()).resolves.toEqual(clients);

    expect(fetchMock).toHaveBeenCalledWith("/api/plugin/sso/client", {
      credentials: "same-origin",
    });
  });

  it("filters malformed SSO clients", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { loginMNUrl: 42 },
        { loginMNUrl: null },
        { loginMNUrl: "https://idp.example.com/login" },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchSsoClients()).resolves.toEqual([
      { loginMNUrl: null },
      { loginMNUrl: "https://idp.example.com/login" },
    ]);
  });

  it("returns the first non-empty loginMNUrl", () => {
    expect(
      getPrimarySsoLoginUrl([
        { loginMNUrl: "" },
        { loginMNUrl: "https://idp.example.com/login" },
      ]),
    ).toBe("https://idp.example.com/login");
  });

  it("returns undefined when no login URL is available", () => {
    expect(getPrimarySsoLoginUrl(undefined)).toBeUndefined();
    expect(getPrimarySsoLoginUrl([])).toBeUndefined();
    expect(getPrimarySsoLoginUrl([{ loginMNUrl: "   " }])).toBeUndefined();
  });
});
