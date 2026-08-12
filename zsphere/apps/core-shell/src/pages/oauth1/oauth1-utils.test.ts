import { describe, expect, it } from "vitest";

import { getSafeOAuthRedirect, parseOAuth1VerifyParams } from "./oauth1-utils";

describe("oauth1 verify utils", () => {
  it("parses required params and normalizes null userType to external", () => {
    const result = parseOAuth1VerifyParams(
      new URLSearchParams({
        username: "alice",
        sessionId: "session-1",
        userUuid: "user-1",
        accountUuid: "account-1",
        loginType: "iam1",
        userType: "null",
        redirect: "/virtualization-resource/vm",
      }),
    );

    expect(result).toEqual({
      ok: true,
      value: {
        username: "alice",
        sessionId: "session-1",
        userUuid: "user-1",
        accountUuid: "account-1",
        loginType: "iam1",
        userType: "external",
        redirect: "/virtualization-resource/vm",
      },
    });
  });

  it("reports missing required params before calling loginOAuth", () => {
    const result = parseOAuth1VerifyParams(
      new URLSearchParams({
        username: "alice",
        sessionId: "session-1",
        userUuid: "user-1",
        loginType: "iam1",
      }),
    );

    expect(result).toEqual({
      ok: false,
      reason: "missing_required_params",
    });
  });

  it("rejects unsupported login types", () => {
    const result = parseOAuth1VerifyParams(
      new URLSearchParams({
        username: "alice",
        sessionId: "session-1",
        userUuid: "user-1",
        accountUuid: "account-1",
        loginType: "iam2",
      }),
    );

    expect(result).toEqual({
      ok: false,
      reason: "unsupported_login_type",
    });
  });

  it("allows relative redirects and same-origin absolute redirects", () => {
    expect(
      getSafeOAuthRedirect(
        "/virtualization-dashboard?tab=home#summary",
        "https://console.example.com",
      ),
    ).toBe("/virtualization-dashboard?tab=home#summary");

    expect(
      getSafeOAuthRedirect(
        "https://console.example.com/virtualization-resource/vm?state=running",
        "https://console.example.com",
      ),
    ).toBe("/virtualization-resource/vm?state=running");
  });

  it("falls back when redirect points outside the current origin", () => {
    expect(
      getSafeOAuthRedirect(
        "https://attacker.example.com/phishing",
        "https://console.example.com",
      ),
    ).toBe("/virtualization-dashboard");

    expect(
      getSafeOAuthRedirect(
        "//attacker.example.com/phishing",
        "https://console.example.com",
      ),
    ).toBe("/virtualization-dashboard");

    expect(
      getSafeOAuthRedirect(
        "javascript:alert(1)",
        "https://console.example.com",
      ),
    ).toBe("/virtualization-dashboard");
  });
});
