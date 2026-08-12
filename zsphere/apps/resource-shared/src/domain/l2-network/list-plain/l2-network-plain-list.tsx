import type { DocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { L2Network as IL2Network } from "@zstack/zsphere-types/graphql";
import { mergeWith } from "lodash-es";
import { useMemo } from "react";

import { useDefaultResourceAttributeConfig } from "../../../components/resource-attribute";
import {
  useActionConfig,
  useColumnConfig,
  useGraphqlConfig,
  useQueryConfig,
} from "../config";

const QUERY_L2_NETWORK = gql`
  query queryL2Network(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $type: L2NetworkQueryType
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    l2NetworkList(
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
      replyWithCount: true
    ) {
      list {
        uuid
        name
        l3networkNum
        physicalInterface
        description
        type
        createDate
        lastOpDate
        vni
        vlan
        attachedClusterUuids
        attachedHostRefs {
          hostUuid
        }
        isUplinkBondingExist
        enableSRIOV
        shareType
        vSwitchType
        clusters {
          name
          uuid
        }
        owner {
          name
          uuid
          type
        }
        zone {
          name
          uuid
        }
        vxlanPool {
          vlan
          uuid
          name
        }
        systemTags {
          bondingMode
          xmitHashPolicy
        }
        isDefault
        portGroups {
          vlanId
          virtualNetworkId
        }
      }
      total
    }
  }
`;

export interface IL2NetworkPlainListProps extends Omit<
  ITableListProps<IL2Network>,
  "gql"
> {
  toolbar?: ITableListProps<IL2Network>["toolbar"];
  gql?: DocumentNode;
}

const L2NetworkPlainList: React.FC<IL2NetworkPlainListProps> = ({
  view,
  actionConfig,
  columnConfig,
  queryConfig,
  defaultQuery,
  toolbar,
  ...props
}) => {
  const mergedDefaultQuery = useMemo(() => {
    return mergeWith({}, defaultQuery, (objValue, srcValue) => {
      if (Array.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    });
  }, [defaultQuery]);

  const defaultQueryConfig = useQueryConfig(mergedDefaultQuery);

  const defaultActionConfig =
    useActionConfig() as unknown as ITableListProps<IL2Network>["actionConfig"];

  const defaultColumnConfig = useColumnConfig(view);

  const rawGraphqlConfig = useGraphqlConfig();

  const resourceAttributeConfig =
    useDefaultResourceAttributeConfig() as unknown as ITableListProps<IL2Network>["resourceAttributeConfig"];

  const defaultGraphqlConfig = useMemo(() => {
    const columns: { [key: string]: string[] } = {};
    const actions: { [key: string]: string[] } = {};

    Object.entries(rawGraphqlConfig.columns).forEach(([key, value]) => {
      if (value) {
        columns[key] = value;
      }
    });

    Object.entries(rawGraphqlConfig.actions).forEach(([key, value]) => {
      if (value) {
        actions[key] = value;
      }
    });

    return {
      columns,
      actions,
    };
  }, [rawGraphqlConfig]);

  return (
    <TableList
      resource="l2.network"
      columnConfig={columnConfig || defaultColumnConfig}
      actionConfig={actionConfig || defaultActionConfig}
      queryConfig={queryConfig || defaultQueryConfig}
      gql={props.gql || QUERY_L2_NETWORK}
      type="L2Network"
      view={view}
      defaultQuery={mergedDefaultQuery}
      graphqlConfig={defaultGraphqlConfig}
      toolbar={toolbar || ["refresh", "search", "operation", "setting"]}
      resourceAttributeConfig={resourceAttributeConfig}
      {...props}
    />
  );
};

export default L2NetworkPlainList;
