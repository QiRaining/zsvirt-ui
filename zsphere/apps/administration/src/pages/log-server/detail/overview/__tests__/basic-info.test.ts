import React from "react";
import { describe, expect, it, vi } from "vitest";

import { getLogServerDetailConfig } from "../basic-info";

vi.mock("@zstack/hooks", () => ({
  useTime: () => ({
    getServerTime: () => ({
      format: () => "",
    }),
  }),
}));

vi.mock("@zstack/zsphere-components", () => ({
  DraggableCard: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  List: () => React.createElement("div"),
}));

const buildConfiguration = (
  type: string,
  targetConfig: Record<string, unknown>,
) =>
  JSON.stringify({
    type,
    configuration: JSON.stringify(targetConfig),
  });

describe("log server detail basic info", () => {
  it("treats Elasticsearch tls on from the Cloud payload as enabled", () => {
    expect(
      getLogServerDetailConfig(
        buildConfiguration("Elasticsearch", {
          host: "172.24.254.149",
          port: "9200",
          index: "admin_test",
          tls: "on",
        }),
      ),
    ).toMatchObject({
      deliveryTarget: "Elasticsearch",
      esIndex: "admin_test",
      esTls: true,
    });
  });

  it("keeps Elasticsearch TLS disabled when the detail payload is not on", () => {
    expect(
      getLogServerDetailConfig(
        buildConfiguration("Elasticsearch", {
          index: "admin_test",
          tls: true,
        }),
      ),
    ).toMatchObject({
      deliveryTarget: "Elasticsearch",
      esIndex: "admin_test",
      esTls: false,
    });
  });
});
