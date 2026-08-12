import { createMockIntl } from "@zstack/form/testing";
import { TransportType } from "@zstack/zsphere-types";
import { describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) => value === "192.168.1.10",
  isPort: (value: string) => value === "4420",
}));

import {
  createAddNvmeServerSchema,
  createEditNvmeServerNameSchema,
} from "../schema";

const intl = createMockIntl();

describe("nvme server action schemas", () => {
  it("validates add nvme server required fields and formats", () => {
    const schema = createAddNvmeServerSchema(intl);
    const validValues = {
      name: "nvme-target",
      ip: "192.168.1.10",
      port: "4420",
      transport: TransportType.RDMA,
      clusterUuid: "cluster-uuid",
    };

    expect(() => schema.parse({ ...validValues, name: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() => schema.parse({ ...validValues, ip: "" })).toThrow(
      "请填写IP地址",
    );
    expect(() => schema.parse({ ...validValues, ip: "invalid-ip" })).toThrow(
      "无效IP地址",
    );
    expect(() => schema.parse({ ...validValues, port: "" })).toThrow(
      "请填写端口",
    );
    expect(() => schema.parse({ ...validValues, port: "70000" })).toThrow(
      "无效的端口",
    );
    expect(() => schema.parse({ ...validValues, clusterUuid: "" })).toThrow(
      "选择不能为空",
    );
    expect(schema.parse({ ...validValues, clusterList: [] })).toEqual(
      validValues,
    );
  });

  it("requires name", () => {
    const schema = createEditNvmeServerNameSchema(intl);

    expect(() => schema.parse({ name: "" })).toThrow("输入内容不能为空");
    expect(schema.parse({ name: "nvme-target" })).toEqual({
      name: "nvme-target",
    });
  });
});
