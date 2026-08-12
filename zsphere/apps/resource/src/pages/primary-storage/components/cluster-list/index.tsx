import { Text } from "@zstack/design";
import { ResourceName } from "@zstack/zsphere-components";
import { LeftNavType } from "@zstack/zsphere-types";
import type { Cluster } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

interface ClusterNameListProps {
  clusters: Cluster[];
}

const createResourceNameProps = (cluster: Cluster) => ({
  key: cluster.uuid,
  value: cluster.name,
  link: {
    uuid: cluster.uuid,
    to: "/cluster",
    microAppName: "virtualization-resource",
    leftnav: LeftNavType.ClusterHost,
  },
});

const ClusterNameList: React.FC<ClusterNameListProps> = ({ clusters }) => {
  const intl = useIntl();
  const clusterNames = useMemo(() => {
    if (!clusters?.length) {
      return intl.formatMessage({ id: "none", defaultMessage: "None" });
    }

    return clusters.map((cluster, index: number) => {
      const clusterNameComponent = (
        <ResourceName
          {...createResourceNameProps(cluster)}
          className={styles.resourceName}
        />
      );

      return index === 0 ? (
        <React.Fragment key={cluster.uuid}>
          {clusterNameComponent}
        </React.Fragment>
      ) : (
        <React.Fragment key={cluster.uuid}>
          <span>,</span> {clusterNameComponent}
        </React.Fragment>
      );
    });
  }, [clusters, intl]);

  const tooltipTitle = useMemo(() => {
    return clusters.map((cluster) => (
      <div key={cluster.uuid}>
        <ResourceName {...createResourceNameProps(cluster)} />
      </div>
    ));
  }, [clusters]);

  return (
    <div className={styles.clusterNameList}>
      <Text>
        <>{clusterNames}</>
      </Text>
    </div>
  );
};

export default ClusterNameList;
