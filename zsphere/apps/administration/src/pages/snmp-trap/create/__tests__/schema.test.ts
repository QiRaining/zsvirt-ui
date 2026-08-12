import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import {
  createSnmpTrapItemSchema,
  createSnmpTrapReceiverSchema,
} from "../schema";

const intl = createMockIntl();

describe("snmp trap create schemas", () => {
  it("keeps receiver list required validation", () => {
    const schema = createSnmpTrapReceiverSchema(intl);

    expect(() => schema.parse({ trapList: [] })).toThrow("输入内容不能为空");
    expect(schema.parse({ trapList: [validTrap()] })).toEqual({
      trapList: [validTrap()],
    });
  });

  it("keeps trap item name validation", () => {
    const schema = createSnmpTrapItemSchema(intl);

    expect(() => schema.parse({ ...validTrap(), name: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ ...validTrap(), name: "invalid/name" }),
    ).toThrow("输入内容只能包含");
  });

  it("keeps trap item IP validation message", () => {
    const schema = createSnmpTrapItemSchema(intl);

    expect(() => schema.parse({ ...validTrap(), snmpAddress: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ ...validTrap(), snmpAddress: "999.1.1.1" }),
    ).toThrow("无效的IP");
  });

  it("keeps trap item port validation and transforms to number", () => {
    const schema = createSnmpTrapItemSchema(intl);

    expect(() => schema.parse({ ...validTrap(), snmpPort: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() => schema.parse({ ...validTrap(), snmpPort: 0 })).toThrow(
      "输入内容需在1~65565范围内",
    );
    expect(() => schema.parse({ ...validTrap(), snmpPort: 65566 })).toThrow(
      "输入内容需在1~65565范围内",
    );
    expect(schema.parse({ ...validTrap(), snmpPort: "162" })).toEqual({
      ...validTrap(),
      snmpPort: 162,
    });
    expect(() =>
      schema.parse({ ...validTrap(), snmpPort: "164.0000011" }),
    ).toThrow("请输入整数");
  });
});

const validTrap = () => ({
  name: "snmp-trap",
  snmpAddress: "192.168.1.10",
  snmpPort: 162,
});
