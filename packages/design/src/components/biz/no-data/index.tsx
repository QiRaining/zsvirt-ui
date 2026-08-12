import * as React from "react";
import { useIntl } from "react-intl";

import NoDataSvg from "./assets/no-data.svg?react";

const NoDataIndicatorLarge = () => {
  return <NoDataSvg className="block h-25 w-30" style={{ display: "block" }} />;
};

interface NoDataCommonLabelProps {
  children?: React.ReactNode;
}

const NoDataCommonLabel = (props: NoDataCommonLabelProps) => {
  const intl = useIntl();
  const { children } = props;
  return (
    <div className="text-xs font-medium text-neutral-500">
      {children ||
        intl.formatMessage({
          id: "no.data",
          defaultMessage: "暂无数据",
        })}
    </div>
  );
};

interface NoDataProps {
  children?: React.ReactNode;
  variant?: "large";
}

const NoData = (props: NoDataProps) => {
  const { children, variant = "large" } = props;
  if (variant === "large") {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-1">
        <NoDataIndicatorLarge />
        {children || <NoDataCommonLabel />}
      </div>
    );
  }
  return null;
};

export { NoDataIndicatorLarge, NoDataCommonLabel, NoData };
