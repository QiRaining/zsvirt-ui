import { RadioGroup } from "@zstack/design";
import { ipRangeList as _ipRangeList } from "@zstack/virtualization-resource/src/gql/l3-network.gql";
import { Auth } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps, Condition } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  IpRange as IIpRange,
  L3Network as IL3Network,
} from "@zstack/zsphere-types/graphql";
import React, { useState, useMemo } from "react";

import { useActionConfig, useColumnConfig } from "./config";
import { useIpRangeCount } from "./hooks";

const TABLE_CONTAINER_STYLE = { margin: "12px 0" } as const;

const IpRangeList: React.FC<IListProps<IIpRange> & { current: IL3Network }> = (
  props,
) => {
  const { current, defaultQuery } = props;

  const [ipVersion, setIpversion] = useState<4 | 6>(4);
  const queryWithIpVersion = useMemo(() => {
    return {
      ...defaultQuery,
      conditions: [
        {
          key: "ipVersion",
          op: Op.eq,
          value: String(ipVersion),
        } as Condition,
      ].concat(defaultQuery?.conditions || []),
    };
  }, [ipVersion, defaultQuery]);

  const {
    ipv4Num = 0,
    ipv6Num = 0,
    refetch: refetchCount,
  } = useIpRangeCount(current.uuid);

  const isEmpty = useMemo(
    () => (ipVersion === 4 ? !ipv4Num : !ipv6Num),
    [ipv4Num, ipv6Num, ipVersion],
  );

  const actionConfig = useActionConfig({
    isEmpty,
    current,
    ipVersion,
    refetchCount,
  });
  const columnConfig = useColumnConfig(props.view);

  const _actionConfig = useMemo(() => {
    if (current.networkType === "vpc") {
      return {
        list: actionConfig.list,
        viewMap: {
          "sub.ipv4/toolbar": {
            extraKeys: ["add.ip.range"],
            activeKeys: ["delete"],
          },
          "sub.ipv6/toolbar": {
            extraKeys: ["add.ip.range"],
            activeKeys: ["delete"],
          },
          "sub.ipv4/row": {
            extraKeys: [],
            activeKeys: ["delete"],
          },
          "sub.ipv6/row": {
            extraKeys: [],
            activeKeys: [],
          },
          "sub.share.ipv4/toolbar": {
            extraKeys: [],
            activeKeys: [],
          },
          "sub.share.ipv6/toolbar": {
            extraKeys: [],
            activeKeys: [],
          },
          "sub.share.ipv4/row": {
            extraKeys: [],
            activeKeys: [],
          },
          "sub.share.ipv6/row": {
            extraKeys: [],
            activeKeys: [],
          },
        },
      };
    }
    return {
      list: actionConfig.list,
      viewMap: {
        ...actionConfig.viewMap,
        "sub.share.ipv6/toolbar": {
          extraKeys: [],
          activeKeys: [],
        },
        "sub.share.ipv6/row": {
          extraKeys: [],
          activeKeys: [],
        },
      },
    };
  }, [current, actionConfig]);

  return (
    <>
      <Auth
        type="block"
        resource={`${current.networkType}.network`}
        authKey="ipv6"
      >
        <RadioGroup
          variant="outline"
          defaultValue={4}
          onValueChange={(val) => {
            setIpversion(val as 4 | 6);
          }}
          options={[
            { value: 4, label: `IPv4 (${ipv4Num})` },
            { value: 6, label: `IPv6 (${ipv6Num})` },
          ]}
        />
      </Auth>
      <div style={TABLE_CONTAINER_STYLE}>
        <TableList
          key={`ipv${ipVersion}.ipRange`}
          columnConfig={columnConfig}
          queryConfig={[]}
          actionConfig={_actionConfig}
          gql={_ipRangeList}
          resource="ip.range"
          type="IpRange"
          {...props}
          view={`${props.view}.ipv${ipVersion}`}
          defaultQuery={queryWithIpVersion}
        />
      </div>
    </>
  );
};

export default IpRangeList;
