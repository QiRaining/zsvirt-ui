import { describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) => value === "192.168.1.1",
  isPort: (value: string) => Number(value) > 0 && Number(value) <= 65535,
}));

import { createIscsiServerSchema } from "../schema";

const intl = {
  formatMessage: (
    descriptor: { id: string; defaultMessage: string },
    values?: Record<string, number | string>,
  ) => {
    if (!values) {
      return descriptor.defaultMessage;
    }

    return Object.entries(values).reduce(
      (message, [key, value]) => message.replace(`{${key}}`, String(value)),
      descriptor.defaultMessage,
    );
  },
};

describe("createIscsiServerSchema", () => {
  const schema = createIscsiServerSchema(intl);

  it("accepts valid values", () => {
    expect(
      schema.parse({
        name: "iscsi-server-01",
        ip: "192.168.1.1",
        port: "3260",
        clusterUuid: "cluster-uuid",
        chapUserName: "",
        chapUserPassword: "",
      }),
    ).toEqual({
      name: "iscsi-server-01",
      ip: "192.168.1.1",
      port: "3260",
      clusterUuid: "cluster-uuid",
      chapUserName: "",
      chapUserPassword: "",
    });
  });

  it("rejects invalid ip", () => {
    expect(() =>
      schema.parse({
        name: "iscsi-server-01",
        ip: "999.999.999.999",
        port: "3260",
        clusterUuid: "cluster-uuid",
      }),
    ).toThrow("无效IP地址");
  });

  it("rejects invalid port", () => {
    expect(() =>
      schema.parse({
        name: "iscsi-server-01",
        ip: "192.168.1.1",
        port: "70000",
        clusterUuid: "cluster-uuid",
      }),
    ).toThrow("无效的端口");
  });

  it("requires cluster", () => {
    expect(() =>
      schema.parse({
        name: "iscsi-server-01",
        ip: "192.168.1.1",
        port: "3260",
        clusterUuid: "",
      }),
    ).toThrow("选择不能为空");
  });
});
