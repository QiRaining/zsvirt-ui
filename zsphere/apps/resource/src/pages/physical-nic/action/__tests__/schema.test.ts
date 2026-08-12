import { describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) => value === "192.168.1.1",
  isValidNetMask: (value: string) => value === "255.255.255.0",
}));

import { createMockIntl } from "@zstack/form/testing";

import {
  createPhysicalNicLldpModeSchema,
  createPhysicalNicNetworkTypeSchema,
  createPhysicalNicIpv4AddressSchema,
  createPhysicalNicSriovSchema,
  createPhysicalNicUpdateSchema,
} from "../schema";

const intl = createMockIntl();

describe("physical nic action schemas", () => {
  it("validates description length", () => {
    const schema = createPhysicalNicUpdateSchema(intl);

    expect(() => schema.parse({ description: "x".repeat(257) })).toThrow(
      "输入内容需在1~256字符范围内",
    );
    expect(schema.parse({ description: "" })).toEqual({
      description: "",
    });
  });

  it("keeps lldp mode required validation", () => {
    const schema = createPhysicalNicLldpModeSchema(intl);

    expect(() => schema.parse({ mode: "" })).toThrow("请选择");
    expect(schema.parse({ mode: "rx_only" })).toEqual({
      mode: "rx_only",
    });
  });

  it("keeps physical network service types as an array", () => {
    const schema = createPhysicalNicNetworkTypeSchema();

    expect(schema.parse({ serviceTypes: ["StorageNetwork"] })).toEqual({
      serviceTypes: ["StorageNetwork"],
    });
  });

  it("validates sriov vf nic number only when enabled", () => {
    const schema = createPhysicalNicSriovSchema(intl, 8);

    expect(schema.parse({ sriovState: false, vfNicNum: "" })).toEqual({
      sriovState: false,
      vfNicNum: "",
    });
    expect(() => schema.parse({ sriovState: true, vfNicNum: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() => schema.parse({ sriovState: true, vfNicNum: 0 })).toThrow(
      "输入内容应该为整数数字，设置数值范围为[1, 8]",
    );
    expect(() => schema.parse({ sriovState: true, vfNicNum: 9 })).toThrow(
      "输入内容应该为整数数字，设置数值范围为[1, 8]",
    );
    expect(schema.parse({ sriovState: true, vfNicNum: 8 })).toEqual({
      sriovState: true,
      vfNicNum: 8,
    });
  });

  it("validates ipv4 address only when enabled", async () => {
    const validateIpAvailability = vi.fn().mockResolvedValue();
    const schema = createPhysicalNicIpv4AddressSchema(
      intl,
      validateIpAvailability,
    );

    await expect(
      schema.parseAsync({ enabled: false, ipv4Address: "", netmask: "" }),
    ).resolves.toEqual({ enabled: false, ipv4Address: "", netmask: "" });
    await expect(
      schema.parseAsync({ enabled: true, ipv4Address: "", netmask: "" }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({
        enabled: true,
        ipv4Address: "10.0.0.1",
        netmask: "255.255.255.0",
      }),
    ).rejects.toThrow("无效的IP地址");
    await expect(
      schema.parseAsync({
        enabled: true,
        ipv4Address: "192.168.1.1",
        netmask: "255.255.0.0",
      }),
    ).rejects.toThrow("无效的子网掩码");
    await expect(
      schema.parseAsync({
        enabled: true,
        ipv4Address: "192.168.1.1",
        netmask: "255.255.255.0",
      }),
    ).resolves.toEqual({
      enabled: true,
      ipv4Address: "192.168.1.1",
      netmask: "255.255.255.0",
    });
  });
});
