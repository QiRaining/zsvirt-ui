import { ResourceName } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/resource-attribute-key";
import type { ResourceAttributeKey } from "@zstack/zsphere-types/graphql";
import type { ColumnFilterItem } from "antd/es/table/interface";
import React from "react";
import { useIntl } from "react-intl";

import { supportedResourceTypes } from "../../constant";
import { useGetResourceTypeLabel } from "../../hook";

export default () => {
  const intl = useIntl();
  const getResourceTypeLabel = useGetResourceTypeLabel();

  return useColumnConfig<ResourceAttributeKey>([
    {
      key: "name",
      render: (current: ResourceAttributeKey) => {
        return (
          <ResourceName
            value={current.name}
            link={{
              microAppName: "virtualization-monitoring-om",
              to: "/resource-attribute",
              uuid: current.uuid,
            }}
          />
        );
      },
    },
    {
      key: "resourceType",
      filters: [
        {
          text: intl.formatMessage({
            id: "resource.attribute.key.global",
            defaultMessage: "Global",
          }),
          value: "ResourceAttributeKeyVO",
        },
        ...supportedResourceTypes.reduce((result, item) => {
          const option = getResourceTypeLabel(item);
          if (option) {
            result.push({
              text: option.label,
              value: option.value,
            });
          }
          return result;
        }, [] as Array<ColumnFilterItem>),
      ],
      formatter: (current) => {
        if (!current.resourceTypes?.length) {
          return null;
        }
        if (current.resourceTypes.includes("ResourceAttributeKeyVO")) {
          return intl.formatMessage({
            id: "resource.attribute.key.global",
            defaultMessage: "Global",
          });
        }
        return getResourceTypeLabel(current.resourceTypes[0]).label;
      },
    },
  ]);
};
