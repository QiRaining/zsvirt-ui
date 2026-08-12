import { Text } from "@zstack/design";
import { IconState } from "@zstack/zsphere-components";
import { formatStorage, getNeutralColor } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

interface IProps {
  title: string;
  itemKey: string;
  level?: number;
  latest: boolean;
  isSelected?: boolean;
  type?: any;
  expandLoading?: boolean;
  attr: any;
  isCurrent: any;
  count: number;
  size: number;
}

const TreeNodeTitle: React.FC<IProps> = ({
  title,
  itemKey,
  attr = {}, //资源信息
  _expandLoading = false,
  type = "snapshot",
  isCurrent,
  count,
  size,
}) => {
  const intl = useIntl();
  return (
    <div
      className={styles.treeTitleContainer}
      data-type={type}
      data-key={itemKey}
    >
      <div className={styles.titlePart} style={{ width: "100%" }}>
        <div style={{ flex: "none" }} title="">
          {attr.state && (
            <IconState
              state={attr.state as any}
              color={getNeutralColor("light", 400) as any}
              resourceKey={"monitor" as any}
              size={16}
            />
          )}
        </div>
        <div className={styles.title}>
          <Text>{title}</Text>
        </div>
        {isCurrent && (
          <span className={styles.badge}>
            {intl.formatMessage({ id: "current", defaultMessage: "Current" })}
          </span>
        )}
        {type === "vm" && (
          <div className={styles.num}>{count || formatStorage(size, 2)}</div>
        )}
      </div>
    </div>
  );
};

export default TreeNodeTitle;
