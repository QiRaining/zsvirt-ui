import { Progress } from "@zstack/zsphere-components";
import { formatStorage } from "@zstack/zsphere-utils";
import { floor } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

export type IType = "table" | "detail";
const { BarInTable } = Progress;

export interface IProps {
  isFormat?: boolean;
  totalNum?: number;
  usedNum?: number;
  reservedNum?: number;
}

const ZProgress: React.FC<IProps> = ({
  isFormat = true,
  totalNum = 0,
  usedNum: originUsedNum = 0,
  reservedNum = 0,
}) => {
  const intl = useIntl();
  const percent = useMemo(() => {
    if (Number(totalNum) <= 0) {
      return 0;
    }
    return floor(
      Number(
        Number(
          1 -
            Number(
              totalNum - originUsedNum - reservedNum < 0
                ? 0
                : totalNum - originUsedNum - reservedNum,
            ) /
              Number(totalNum),
        ) * 100,
      ),
      2,
    );
  }, [originUsedNum, reservedNum, totalNum]);

  const tooltipList = [
    {
      label: intl.formatMessage({
        id: "totalQuantity",
        defaultMessage: "Total",
      }),
      value: isFormat ? formatStorage(totalNum, 2) : totalNum,
    },
    {
      label: intl.formatMessage({
        id: "used.quantity",
        defaultMessage: "Used",
      }),
      value: isFormat
        ? formatStorage(originUsedNum + reservedNum, 2)
        : originUsedNum + reservedNum,
    },
    {
      label: intl.formatMessage({
        id: "availableQuantity",
        defaultMessage: "Available",
      }),
      value: isFormat
        ? formatStorage(totalNum - originUsedNum - reservedNum, 2)
        : totalNum - originUsedNum - reservedNum,
    },
  ];

  const extra = (
    <div className="flex items-center gap-1">
      {intl.formatMessage({ id: "available", defaultMessage: "Available " })}
      {isFormat
        ? formatStorage(totalNum - originUsedNum - reservedNum, 2)
        : totalNum - originUsedNum - reservedNum}
    </div>
  );

  return (
    <BarInTable
      percent={Math.max(percent, 0)}
      extra={extra}
      tooltipList={tooltipList}
    />
  );
};

export default ZProgress;
