import { Op } from "@zstack/zsphere-types";
import { describe, expect, it } from "vitest";

import { buildGlobalConfigListQueryVariables } from ".";

describe("buildGlobalConfigListQueryVariables", () => {
  it("builds category and name conditions with the UI config switch", () => {
    expect(
      buildGlobalConfigListQueryVariables(
        [
          {
            category: "image",
            name: "upload.max.idle.duration.in.seconds",
          },
          {
            category: "softwarePackage",
            name: "upload.max.idle.duration.in.seconds",
          },
        ],
        false,
      ),
    ).toEqual({
      conditions: [
        {
          key: "category",
          values: ["image", "softwarePackage"],
          op: Op.in,
        },
        {
          key: "name",
          values: ["upload.max.idle.duration.in.seconds"],
          op: Op.in,
        },
      ],
      includeUiConfig: false,
    });
  });
});
