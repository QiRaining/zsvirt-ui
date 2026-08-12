import { gql, useQuery } from "@apollo/client";
import type { ListItem } from "@zstack/zsphere-components";
import { DraggableCard, List } from "@zstack/zsphere-components";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

const GET_ROOT_OVERVIEW_VERSION = gql`
  query getRootOverviewVersion {
    getAboutLicenseInfo {
      versionOnUI
    }
  }
`;

interface IProps {
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  resourceData: any;
}

const BasicInfo: React.FC<IProps> = React.memo(
  ({ onCollapseChange, collapsed = false, resourceData }) => {
    const intl = useIntl();
    const { data: versionData } = useQuery<{
      getAboutLicenseInfo?: { versionOnUI?: string };
    }>(GET_ROOT_OVERVIEW_VERSION);
    const displayVersion = versionData?.getAboutLicenseInfo?.versionOnUI ?? "";
    const list: ListItem[] = useMemo(
      () => [
        {
          label: intl.formatMessage({ id: "version", defaultMessage: "Version" }),
          value: displayVersion,
        },
        {
          label: intl.formatMessage({
            id: "virtualization.zone",
            defaultMessage: "Data Center",
          }),
          value: resourceData?.zone?.total ?? 0,
        },
        {
          label: intl.formatMessage({ id: "cluster", defaultMessage: "Cluster" }),
          value: resourceData?.cluster?.total ?? 0,
        },
        {
          label: intl.formatMessage({
            id: "virtualization.host",
            defaultMessage: "Host",
          }),
          value: resourceData?.host?.total ?? 0,
        },
        {
          label: intl.formatMessage({
            id: "virtualMachine",
            defaultMessage: "VM",
          }),
          value: resourceData?.vm?.total ?? 0,
        },
      ],
      [displayVersion, intl, resourceData],
    );

    return (
      <DraggableCard
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
        isList
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
      >
        <List list={list} bordered={false} />
      </DraggableCard>
    );
  },
);

BasicInfo.displayName = "BasicInfo";

export default BasicInfo;
