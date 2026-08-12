import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import React from "react";

import styles from "./style.module.less";

interface IProps {
  num: number;
  usedNum: number;
  title: string;
}

const AboveQuota: React.FC<IProps> = ({ num, usedNum, title }) => {
  if (usedNum < num) {
    return null;
  }

  return (
    <Tooltip placement="top" title={title}>
      <Icon type="alert-triangle-fill" color="danger" className={styles.icon} />
    </Tooltip>
  );
};

export default AboveQuota;
