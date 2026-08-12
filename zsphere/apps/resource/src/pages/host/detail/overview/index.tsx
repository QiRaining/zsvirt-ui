import type { ApolloQueryResult, OperationVariables } from "@apollo/client";
import {
  Alert,
  ResponsiveDndCardsLayout,
  TagAndAttribute,
} from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { HostVO, Host as IHost } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import { useIntl } from "react-intl";

import BasicInfo from "./basic-info";
import CapacityUsage from "./capacity-usage";
import ConfigInfo from "./config-info";
import HardwareOverview from "./hardware-overview";
import RelativeResource from "./relative-object";

const ALERT_MARGIN_STYLE = { margin: "0 0 13px 0" } as const;

interface IProps {
  current: IHost & HostVO;
  refetch: (
    variables?: Partial<OperationVariables> | undefined,
  ) => Promise<ApolloQueryResult<{ host: HostVO }>>;
}

const Overview: FC<IProps> = ({ current }) => {
  const intl = useIntl();

  return (
    <>
      {current.hostIommu?.state === "Enabled" &&
        current.hostIommu?.status === "Inactive" && (
          <Alert
            type="warning"
            message={intl.formatMessage({
              id: "host.overview.iommu.alert",
              defaultMessage:
                "IOMMU has been enabled but is currently unavailable, and does not support device passthrough or virtual machines. Please check the IOMMU configuration in the kernel...",
            })}
            display="blockStrong"
            closable
            style={ALERT_MARGIN_STYLE}
          />
        )}
      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="virtualization-resource-host"
        cols={2}
        dataSet={{
          basicInfo: {
            resourceKey: "basicInfo",
            x: 0,
            y: 0,
            node: (props) => <BasicInfo detail={current} {...props} />,
          },
          capacityUsage: {
            resourceKey: "capacityUsage",
            x: 1,
            y: 0,
            node: (props) => <CapacityUsage detail={current} {...props} />,
          },
          configInfo: {
            resourceKey: "configInfo",
            x: 0,
            y: 1,
            node: (props) => <ConfigInfo detail={current} {...props} />,
          },
          hardwareOverview: {
            resourceKey: "hardwareOverview",
            x: 1,
            y: 1,
            node: (props) => <HardwareOverview detail={current} {...props} />,
          },
          relativeResource: {
            resourceKey: "relativeResource",
            x: 1,
            y: 2,
            node: (props) => <RelativeResource detail={current} {...props} />,
          },
          tagAndAttribute: {
            resourceKey: "tagAndAttribute",
            x: 1,
            y: 3,
            node: (props) => {
              return <TagAndAttribute current={current} {...props} />;
            },
          },
        }}
      />
    </>
  );
};

export default Overview;
