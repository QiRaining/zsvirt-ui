import { Text } from "@zstack/design";
import { ResourceName } from "@zstack/zsphere-components";
import { getMenuList } from "@zstack/zsphere-config";
import { useColumnConfig } from "@zstack/zsphere-engine/src/resource-attribute-value";
import type { ResourceAttributeValue } from "@zstack/zsphere-types/graphql";
import type { ColumnFilterItem } from "antd/es/table/interface";
import React from "react";

import { supportedResourceTypes } from "../../constant";
import { useGetResourceTypeLabel } from "../../hook";

export default () => {
  const getResourceTypeLabel = useGetResourceTypeLabel();

  return useColumnConfig<ResourceAttributeValue>([
    {
      key: "resourceName",
      render: (current: ResourceAttributeValue) => {
        const menuList = getMenuList();
        const path = menuList.find((item) =>
          item.resourceType?.includes(current.resourceType),
        )?.path;
        if (!path) {
          return <Text>{current.resourceName ?? current.resourceUuid}</Text>;
        }
        const url = new URL(path, window.location.href);
        const microAppName = url.pathname.split("/")[1];
        const to = url.pathname.slice(microAppName.length + 1);
        const leftnav = url.searchParams.get("leftnav") || undefined;
        return (
          <ResourceName
            value={current.resourceName ?? current.resourceUuid}
            link={{ microAppName, to, leftnav, uuid: current.resourceUuid }}
          />
        );
      },
    },
    {
      key: "resourceType",
      filters: supportedResourceTypes.reduce((result, item) => {
        const option = getResourceTypeLabel(item);
        if (option) {
          result.push({
            text: option.label,
            value: option.value,
          });
        }
        return result;
      }, [] as Array<ColumnFilterItem>),
      formatter: (current) => getResourceTypeLabel(current.resourceType).label,
    },
  ]);
};
