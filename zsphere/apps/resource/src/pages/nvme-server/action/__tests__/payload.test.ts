import { TransportType } from "@zstack/zsphere-types";
import { describe, expect, it } from "vitest";

import { buildAddNvmeServerPayload } from "../payload";

describe("nvme server action payload", () => {
  it("builds add nvme server payload without form-only clusterList", () => {
    const formValues = {
      name: "198.51.100.18",
      ip: "198.51.100.18",
      port: "4420",
      transport: TransportType.RDMA,
      clusterUuid: "cluster-uuid",
      clusterList: [{ uuid: "cluster-uuid", name: "cluster-a" }],
    };

    expect(buildAddNvmeServerPayload(formValues)).toEqual({
      name: "198.51.100.18",
      ip: "198.51.100.18",
      port: 4420,
      transport: TransportType.RDMA,
      clusterUuid: "cluster-uuid",
    });
  });
});
