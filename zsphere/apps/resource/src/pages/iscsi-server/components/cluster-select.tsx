import type { ETabType } from "@zstack/virtualization-resource/src/pages/cluster/constant";
import ClusterList from "@zstack/virtualization-resource/src/pages/cluster/list";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import { mergeQuery } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  view: string;
  defaultQuery: IQuery;
  onChange?: (selectedList: Array<ICluster>) => void;
  onTabChange?: (type: ETabType) => void;
}

const Config: React.FC<IProps> = ({
  view,
  defaultQuery,
  onTabChange: _onTabChange,
  ...rest
}) => {
  const _intl = useIntl();

  const defaultQueryForNORMAL = React.useMemo(() => {
    return mergeQuery(defaultQuery, {
      conditions: [
        {
          key: "hypervisorType",
          op: Op.eq,
          value: "KVM",
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
