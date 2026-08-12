import { DraggableCard, Tag } from "@zstack/zsphere-components";
import { List, ResourceName } from "@zstack/zsphere-components";
import { LeftNavType } from "@zstack/zsphere-types";
import type { L3Network as IL3Network } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  current: IL3Network;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const RelativeResource: React.FC<IProps> = ({
  current,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const list = useMemo(() => {
    const networkServices =
      current?.networkServices?.filter(
        (networkService) =>
          ["DHCP", "DNS", "SecurityGroup", "Userdata"].indexOf(
            networkService?.networkServiceType ?? "",
          ) > -1,
      ) ?? [];
    return [
      {
        label: intl.formatMessage({
          id: "virtualization.l2.network",
          defaultMessage: "Distributed Switch",
        }),
        value: (
          <ResourceName
            value={current?.vSwitch?.name || current?.vSwitchUuid}
            link={{
              uuid: current?.vSwitch?.uuid,
              to: "/l2-network",
              microAppName: "virtualization-resource",
              leftnav: LeftNavType.Network,
            }}
          />
        ),
      },
      {
        label: `${intl.formatMessage({
          id: "networkService",
          defaultMessage: "Network Service",
        })}(${networkServices?.length})`,
        value:
          networkServices?.length > 0 ? (
            <>
              {networkServices?.map((networkService) => (
                <Tag
                  key={networkService?.networkServiceType}
                  style={{ marginBottom: "8px" }}
                >
                  {networkService?.networkServiceType}
                </Tag>
              ))}
            </>
          ) : undefined,
      },
    ];
  }, [current]);
  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "relative.object",
        defaultMessage: "Related Objects",
      })}
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default RelativeResource;
