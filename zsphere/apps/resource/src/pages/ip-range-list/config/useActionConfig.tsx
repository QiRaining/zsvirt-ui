import ZSVAddIprange from "@zstack/virtualization-resource/src/pages/l3-network/action/add-ip-range";
import { useActionConfig } from "@zstack/zsphere-engine/src/ip-range";
import { ShareType } from "@zstack/zsphere-types";
import type {
  IpRange as IIpRange,
  L3Network,
} from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";
import SetShareTypeFromNoGroup from "zsv_administration_shared/account-information/action/set-share-type-from-noGroup";

import AddIprange from "../action/add-ip-range";
import DeleteIprange from "../action/delete";

interface actionArgs {
  current: L3Network;
  ipVersion: 4 | 6;
  isEmpty?: boolean;
  refetchCount?: any;
}

export default (actionArgs: actionArgs) =>
  useActionConfig<IIpRange>([
    {
      key: "add.ip.range",
      ActionWrapper: (props) => <AddIprange {...props} {...actionArgs} />,
      autoInjectPreValidator: false,
      primary: true,
    },
    {
      key: "delete",
      ActionWrapper: (props) => (
        <DeleteIprange {...props} refetchCount={actionArgs?.refetchCount} />
      ),
    },
    {
      key: "set.share",
      ActionWrapper: (props: any) => (
        <SetShareTypeFromNoGroup {...props} filterShareType={ShareType.Group} />
      ),
    },
    {
      key: "virtualization.add.ipRange",
      autoInjectPreValidator: false,
      ActionWrapper: (props: any) => {
        const memoizedSelectedList = useMemo(
          () => [props.source],
          [props.source],
        );
        return (
          <ZSVAddIprange
            {...props}
            selectedList={memoizedSelectedList}
            {...actionArgs}
          />
        );
      },
    },
    {
      key: "virtualization.delete",
      ActionWrapper: (props) => (
        <DeleteIprange {...props} refetchCount={actionArgs?.refetchCount} />
      ),
    },
  ]);
