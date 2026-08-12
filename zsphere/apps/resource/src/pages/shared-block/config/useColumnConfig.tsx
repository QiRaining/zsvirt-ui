import { InfoPopover, Text } from "@zstack/design";
import { ResourceUsageProgress } from "@zstack/zsphere-components";
import { TableDetailLink } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/shared-block";
import {
  SharedBlockState as ISharedBlockState,
  SharedBlockStatus as ISharedBlockStatus,
} from "@zstack/zsphere-types";
import type { SharedBlock as ISharedBlock } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

export default () => {
  const intl = useIntl();
  return useColumnConfig<ISharedBlock>([
    {
      key: "name",
      render: (current: ISharedBlock) => {
        return (
          <Text>
            <TableDetailLink currentRow={current}>
              {current.name}
            </TableDetailLink>
          </Text>
        );
      },
    },
    {
      key: "state",
      filterOptions: ISharedBlockState,
    },
    {
      key: "status",
      filterOptions: ISharedBlockStatus,
    },
    {
      key: "usedCapacity",
      title: (
        <div className="flex items-center gap-1">
          <span>
            {intl.formatMessage({
              id: "primaryStorage.usage",
              defaultMessage: "Storage Utilization",
            })}
          </span>
          <InfoPopover
            content={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "shared.block.usedCapacity.tooltip",
                  defaultMessage: `### Storage Utilization

Displays the storage capacity and usage in the LUN.

1. Storage Utilization = Physical Used ÷ Physical Total
2. Physical Available = Physical Total − Physical Used − Safety Threshold Capacity
3. Safety Threshold Capacity = Physical Total × (1 − Storage Utilization Threshold)`,
                })}
              </ReactMarkdown>
            }
          />
        </div>
      ),
      gqlKey: "sharedBlockCapacity",
      render: (row) => {
        const { totalCapacity, availableCapacity } =
          row?.sharedBlockCapacity || {};
        const { reservedPhysicalCapacity } = row?.primaryStorageCapacity ?? {};
        return (
          <ResourceUsageProgress
            resourceType="storage"
            poolType="primary"
            metric="capacityUtilization"
            total={totalCapacity || 0}
            available={availableCapacity || 0}
            reserved={reservedPhysicalCapacity}
          />
        );
      },
    },
  ]);
};
