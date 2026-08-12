import { describe, expect, it } from "vitest";

import { getSessionContext } from "../session-context";

describe("getSessionContext", () => {
  const referer = "https://172.30.3.39";
  const authList = [
    ["vm||action||virtualization.console.shortcut.paste", "hidden"],
  ];

  it("accepts session context from the configured referer", () => {
    expect(
      getSessionContext(
        {
          origin: referer,
          data: {
            type: "novnc-set-session-context",
            sessionId: "session-id",
            authList,
          },
        },
        referer,
      ),
    ).toEqual({ sessionId: "session-id", authList });
  });

  it("rejects session context from another origin", () => {
    expect(
      getSessionContext(
        {
          origin: "https://untrusted.example.com",
          data: {
            type: "novnc-set-session-context",
            sessionId: "session-id",
            authList,
          },
        },
        referer,
      ),
    ).toBeUndefined();
  });

  it("rejects malformed permission lists", () => {
    expect(
      getSessionContext(
        {
          origin: referer,
          data: {
            type: "novnc-set-session-context",
            sessionId: "session-id",
            authList: ["invalid"],
          },
        },
        referer,
      ),
    ).toBeUndefined();
  });
});
