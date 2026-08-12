import { List } from "@zstack/zsphere-components";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  current: ICluster;
}

const NormalSetting: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();

  const list = React.useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "vdiNetwork",
          defaultMessage: "VDI Network",
        }),
        value: current?.displayNetworkCidr
          ? current?.displayNetworkCidr
          : intl.formatMessage({
              id: "none",
              defaultMessage: "None",
            }),
      },
      {
        label: intl.formatMessage({
          id: "migrateNetwork",
          defaultMessage: "Migration Network",
        }),
        value: current?.migrateNetworkCidr
          ? current?.migrateNetworkCidr
          : intl.formatMessage({
              id: "none",
              defaultMessage: "None",
            }),
      },
    ];
  }, [intl, current]);

  return <List list={list} />;
};

export default NormalSetting;
