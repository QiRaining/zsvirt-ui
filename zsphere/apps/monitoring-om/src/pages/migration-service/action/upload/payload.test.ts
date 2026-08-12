import { describe, expect, it } from "vitest";

import { buildMigrationPackageUploadPayload } from "./payload";

describe("buildMigrationPackageUploadPayload", () => {
  it("builds a URL upload payload", () => {
    expect(
      buildMigrationPackageUploadPayload(
        {
          uploadMethod: "url",
          url: "https://example.com/zmigrate.tar.gz",
          installPath: "/zmigrate/package",
        },
        "zmigrate.tar.gz",
      ),
    ).toEqual({
      name: "zmigrate",
      installPath: "/zmigrate/package/zmigrate.tar.gz",
      url: "https://example.com/zmigrate.tar.gz",
      type: "ZMigrate",
    });
  });

  it("builds a local upload payload", () => {
    expect(
      buildMigrationPackageUploadPayload(
        { uploadMethod: "local", installPath: "/zmigrate/package" },
        "zmigrate.tar.gz",
      ),
    ).toMatchObject({ url: "upload://zmigrate.tar.gz", type: "ZMigrate" });
  });
});
