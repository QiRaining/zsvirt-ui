import { RadioGroup } from "@zstack/design";
import { useIpRangeCount } from "@zstack/virtualization-resource/src/pages/ip-range-list/hooks";
import IPRangeList from "@zstack/virtualization-resource/src/pages/ip-range-list/list";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { Condition } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { L3Network as IL3Network } from "@zstack/zsphere-types/graphql";
import React, { useState, useMemo } from "react";
import { useIntl } from "react-intl";

const IpRangeList: React.FC<{ current: IL3Network }> = (props) => {
  const { current } = props;
  const intl = useIntl();

  const [ipVersion, setIpversion] = useState<4 | 6>(4);
  const queryWithIpVersion = useMemo(() => {
    return {
      conditions: [
        {
          key: "l3NetworkUuid",
          op: Op.eq,
          value: current.uuid,
        },
        {
          key: "ipVersion",
          op: Op.eq,
          value: String(ipVersion),
        } as Condition,
      ],
    };
  }, [ipVersion, current.uuid]);

  const view = useMemo(() => {
    return ipVersion === 4
      ? "virtualization.sub.l3network"
      : "virtualization.sub.l3network.ipv6";
  }, [ipVersion]);

  useActionSubscribe({
    resourceTypeList: ["L3Network", "IpRange"],
    onProgress: () => refetchCount(),
  });

  const {
    ipv4Num = 0,
    ipv6Num = 0,
    refetch: refetchCount,
  } = useIpRangeCount(current.uuid);

  const noIpv6 =
    current?.category === "System" ||
    current.l2Network?.vSwitchType === "OvsDpdk";

  return (
    <>
      {!noIpv6 && (
        <div style={{ marginBottom: 12 }}>
          <RadioGroup
            variant="outline"
            defaultValue={4}
            onValueChange={(val) => {
              setIpversion(val as 4 | 6);
            }}
            options={[
              {
                value: 4,
                label: intl.formatMessage(
                  {
                    id: "ip.range.tab.title.ipv4",
                    defaultMessage: "IPv4 Range ({ipv4Num})",
                  },
                  { ipv4Num },
                ),
              },
              {
                value: 6,
                label: intl.formatMessage(
                  {
                    id: "ip.range.tab.title.ipv6",
                    defaultMessage: "IPv6 Range ({ipv6Num})",
                  },
                  { ipv6Num },
                ),
              },
            ]}
          />
        </div>
      )}
      <div style={{ marginBottom: 12 }}>
        <IPRangeList
          key={view}
          view={view}
          current={current}
          ipVersion={ipVersion}
          defaultQuery={queryWithIpVersion}
        />
      </div>
    </>
  );
};

export default IpRangeList;
