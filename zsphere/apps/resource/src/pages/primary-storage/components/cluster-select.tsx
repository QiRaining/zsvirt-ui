import { useQuery } from "@apollo/client";
import { clusterSummary } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import type { ETabType } from "@zstack/virtualization-resource/src/pages/cluster/constant";
import ClusterList from "@zstack/virtualization-resource/src/pages/cluster/list";
import { mergeQuery } from "@zstack/virtualization-resource/src/pages/primary-storage/utils";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  PrimaryStorageVO as IPrimaryStorageVO,
  Cluster as ICluster,
} from "@zstack/zsphere-types/graphql";
import React from "react";

interface IProps {
  current: IPrimaryStorageVO;
  view: string;
  defaultQuery: IQuery;
  onChange?: (selectedList: Array<ICluster>) => void;
  onTabChange?: (type: ETabType) => void;
}

const Config: React.FC<IProps> = ({
  current: _current,
  view,
  defaultQuery,
  onTabChange: _onTabChange,
  ...rest
}) => {
  const { refetch } = useQuery(clusterSummary, {
    variables: defaultQuery,
    fetchPolicy: "network-only",
  });

  React.useEffect(() => {
    refetch?.();
  }, [defaultQuery, refetch]);

  const defaultQueryForNORMAL = React.useMemo(() => {
    return mergeQuery(defaultQuery, {
      conditions: [
        {
          key: "hypervisorType",
          op: Op.notIn,
          values: ["baremetal", "baremetal2", "ESX"],
        },
      ],
    });
  }, [defaultQuery]);

  return (
    <div>
      <ClusterList {...rest} view={view} defaultQuery={defaultQueryForNORMAL} />
    </div>
  );
};

export default Config;
