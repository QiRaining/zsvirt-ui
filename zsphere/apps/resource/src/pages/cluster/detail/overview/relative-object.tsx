import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { ResourceName, List } from "@zstack/zsphere-components";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

export interface IProps {
  detail: ICluster;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const RelativeObject: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const leftnav = searchParams.get("leftnav") || "";

  const list = React.useMemo<Array<ListItem>>(
    () => [
      {
        label: intl.formatMessage({
          id: "dateCenter",
          defaultMessage: "Data Center",
        }),
        value: (
          <ResourceName
            value={detail?.zone?.name}
            link={{
              uuid: detail.zone?.uuid,
              to: "/zone",
              microAppName: "virtualization-resource",
              leftnav: leftnav || undefined,
            }}
          />
        ),
      },
    ],
    [intl, detail, leftnav],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "relative.object",
        defaultMessage: "Related Objects",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default RelativeObject;
