import type { IEmptyProps } from "@zstack/zsphere-components";
import { Empty as ZsEmpty } from "@zstack/zsphere-components";
import cls from "classnames";
import React from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

interface IProps extends IEmptyProps {
  isSearching?: boolean;
  dataSource?: any[];
  children?: React.ReactNode;
}

const Empty = (props: IProps) => {
  const intl = useIntl();
  const {
    className,
    isSearching = false,
    type = "Select",
    dataSource = [],
    children,
    ...restProps
  } = props;

  if (dataSource.length > 0) {
    return <>{children}</>;
  }

  return (
    <ZsEmpty
      className={cls(styles["empty-contanier"], className)}
      type={type}
      description={
        isSearching
          ? intl.formatMessage({
              id: "search.no.result",
              defaultMessage: "No results found",
            })
          : intl.formatMessage({
              id: "no.data",
              defaultMessage: "No Data",
            })
      }
      {...restProps}
    />
  );
};

export default Empty;
