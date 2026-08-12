import { Progress } from "@zstack/zsphere-components";
import { formatStorage } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";

const { BarInTable } = Progress;

export interface IProps {
  usedRatio?: number;
  size?: number;
  used?: number;
  available?: number;
}

export default ({
  usedRatio = 0,
  size = 0,
  used = 0,
  available = 0,
}: IProps) => {
  const intl = useIntl();

  const tooltipList = [
    {
      label: intl.formatMessage({
        id: "totalQuantity",
        defaultMessage: "Total",
      }),
      value: formatStorage(size, 2),
    },
    {
      label: intl.formatMessage({
        id: "usedQuantity",
        defaultMessage: "Used",
      }),
      value: formatStorage(used, 2),
    },
    {
      label: intl.formatMessage({
        id: "availableQuantity",
        defaultMessage: "Available",
      }),
      value: formatStorage(available, 2),
    },
  ];

  const extra = (
    <div className="flex items-center gap-1">
      {intl.formatMessage({ id: "available", defaultMessage: "Available " })}
      {formatStorage(available, 2)}
    </div>
  );

  return (
    <BarInTable percent={usedRatio} extra={extra} tooltipList={tooltipList} />
  );
};
