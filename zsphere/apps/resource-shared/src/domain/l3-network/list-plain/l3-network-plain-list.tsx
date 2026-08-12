import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { L3Network as IL3Network } from "@zstack/zsphere-types/graphql";
import type { DocumentNode } from "graphql";
import { mergeWith } from "lodash-es";
import { useMemo } from "react";

import { useDefaultResourceAttributeConfig } from "../../../components/resource-attribute";
import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

const QUERY_L3_NETWORK_LIST = gql`
  fragment ipCapacityFields on IpCapacity {
    totalCapacity
    availableCapacity
    ipv4AvailableCapacity
    ipv6AvailableCapacity
    ipv4TotalCapacity
    ipv6TotalCapacity
    ipv4UsedIpAddressNumber
  }

  fragment IpRangeFields on IpRange {
    addressMode
    createDate
    endIp
    gateway
    shareType
    ipCapacity {
      ...ipCapacityFields
    }
    ipRangeType
    ipVersion
    l3NetworkUuid
    name
    netmask
    networkCidr
    prefixLen
    startIp
    uuid
    linkResource {
      vm
      vrouter
    }
  }

  fragment l3NetworkFields on L3Network {
    category
    createDate
    description
    enableIPAM
    dhcpIp {
      ipv4
      ipv6
    }
    dns
    enableSRIOV
    ipVersion
    hypervisorType
    ipCapacity {
      ...ipCapacityFields
    }
    ipRanges {
      ...IpRangeFields
    }
    lastOpDate
    l2NetworkUuid
    ipAllocateStrategy
    l2Network {
      name
      uuid
      type
      physicalInterface
      virtualNetworkId
      vSwitchType
      enableSRIOV
      attachedClusterUuids
    }
    vSwitchUuid
    vSwitch {
      name
      uuid
      type
      physicalInterface
      virtualNetworkId
      vSwitchType
      enableSRIOV
      attachedClusterUuids
    }
    networkTypeName
    networkType
    networkServices {
      networkServiceType
    }
    name
    mtu
    owner {
      name
      uuid
      type
      linkedAccountUuid
    }
    type
    uuid
    shareType
    isDefault
    hasDefaultKernel
    portGroup {
      uuid
      vlanId
    }
  }

  query queryL3NetworkList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: L3NetworkQueryType
    $extraConditions: [Condition!]
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    l3NetworkList(
      conditions: $conditions
      start: $start
      limit: $limit
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      list {
        ...l3NetworkFields
      }
      total
    }
  }
`;

export interface IL3NetworkPlainListProps extends Omit<
  ITableListProps<IL3Network>,
  "gql"
> {
  toolbar?: ITableListProps<IL3Network>["toolbar"];
  gql?: DocumentNode;
}

const L3NetworkPlainList: React.FC<IL3NetworkPlainListProps> = ({
  actionConfig,
  view,
  columnConfig,
  queryConfig,
  defaultQuery,
  gql,
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

  const defaultActionConfig =
    useActionConfig() as unknown as ITableListProps<IL3Network>["actionConfig"];
  const defaultColumnConfig = useColumnConfig(view);
  const defaultQueryConfig = useQueryConfig(mergedDefaultQuery);

  const resourceAttributeConfig =
    useDefaultResourceAttributeConfig() as unknown as ITableListProps<IL3Network>["resourceAttributeConfig"];

  return (
    <TableList<IL3Network>
      columnConfig={columnConfig || defaultColumnConfig}
      actionConfig={actionConfig || defaultActionConfig}
      queryConfig={queryConfig || defaultQueryConfig}
      defaultQuery={mergedDefaultQuery}
      gql={gql || QUERY_L3_NETWORK_LIST}
      toolbar={toolbar || ["refresh", "operation", "search", "setting"]}
      resourceAttributeConfig={resourceAttributeConfig}
      view={view}
      resource="flat.network"
      type="L3Network"
      {...props}
    />
  );
};

export default L3NetworkPlainList;
