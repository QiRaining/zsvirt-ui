import { useColumnConfig } from "@zstack/zsphere-engine/src/baremetal-pxe-server";
import {
  State,
  PrimaryStorageStatus as IPrimaryStorageStatus,
} from "@zstack/zsphere-types";
import type { BaremetalPxeServer as IBaremetalPxeServer } from "@zstack/zsphere-types/graphql";
import { pick as _pick } from "lodash-es";

export default () => {
  return useColumnConfig<IBaremetalPxeServer>([
    {
      key: "name",
    },
    {
      key: "state",
      filterOptions: _pick(State, [State.Enabled, State.Disabled]),
    },
    {
      key: "status",
      filterOptions: IPrimaryStorageStatus,
    },
  ]);
};
