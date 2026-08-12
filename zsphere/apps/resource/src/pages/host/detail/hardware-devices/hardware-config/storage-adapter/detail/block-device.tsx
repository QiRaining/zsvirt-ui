import NvmeLunList from "@zstack/virtualization-resource/src/pages/nvme-lun/list";
import ScsiLunList from "@zstack/virtualization-resource/src/pages/scsi-lun/list";
import { Op } from "@zstack/zsphere-types";
import React, { useMemo } from "react";

export interface IProps {
  current: any;
}

export default function BlockDevice({ current }: IProps) {
  const LunList = current?.type === "NVMe" ? NvmeLunList : ScsiLunList;
  const defaultQuery = useMemo(() => getDefaultQuery(current), [current]);
  return <LunList view="sub.storage.adapter" defaultQuery={defaultQuery} />;
}

function getDefaultQuery(current?: any) {
  switch (current?.type) {
    case "iSCSI":
      return {
        conditions: [
          {
            key: "scsiLunHostRef.hostUuid",
            op: Op.eq,
            value: current?.hostUuid || "",
          },
          {
            key: "source",
            op: Op.eq,
            value: "iSCSI",
          },
        ],
      };
    case "FC":
      return {
        conditions: [
          {
            key: "scsiLunHostRef.hostUuid",
            op: Op.eq,
            value: current?.hostUuid || "",
          },
          {
            key: "source",
            op: Op.eq,
            value: "fiberChannel",
          },
        ],
      };
    case "NVMe":
      return {
        conditions: [
          {
            key: "nvmeLunHostRef.hostUuid",
            op: Op.eq,
            value: current?.hostUuid || "",
          },
          {
            key: "nvmeLunHostRef.transport",
            op: Op.ne,
            value: "PCIE",
          },
        ],
      };
    default:
      return { conditions: [] };
  }
}
