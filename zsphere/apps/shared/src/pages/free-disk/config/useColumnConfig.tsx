import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useColumnConfig } from "@zstack/zsphere-engine/src/free-hard-disk";
import { formatBytesToSize } from "@zstack/zsphere-utils";
import { useIntl } from "react-intl";

export default () => {
  const intl = useIntl();

  return useColumnConfig<any>([
    {
      key: "device",
      render: (current) => {
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            {current?.name}
            {current?.withPartition && (
              <Tooltip
                title={intl.formatMessage({
                  id: "free.disk.used.tooltip",
                  defaultMessage:
                    "This disk has already been partitioned. Selecting it will format the disk and erase all data. Proceed with caution.",
                })}
              >
                <Icon
                  type="alert-triangle-fill"
                  color="alert"
                  style={{ cursor: "pointer", marginLeft: 8, fontSize: 16 }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      key: "model",
      render: (current) => current?.type,
    },
    {
      key: "multipath.device",
      render: (current) => current?.multipathDeviceName ?? "-",
    },
    {
      key: "logical.sector.size",
      render: (current) => current?.logicalSector,
    },
    {
      key: "physical.sector.size",
      render: (current) => current?.physicalSector,
    },
    {
      key: "partition",
      render: (current) =>
        current?.partitionTable === "unknown" ? "-" : current?.partitionTable,
    },
    {
      key: "capacity",
      render: (current) => formatBytesToSize(current?.size),
    },
  ]);
};
