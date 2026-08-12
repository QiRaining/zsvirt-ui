import { Tooltip } from "@zstack/design";
import React from "react";

import styles from "./style.module.less";

interface DataItem {
  color: string;
  value: number;
  description?: string | React.ReactNode;
}

interface StorageProgressProps {
  dataSource: DataItem[];
  width?: number;
  height?: number;
}

const StorageProgress: React.FC<StorageProgressProps> = ({
  dataSource,
  width = 160,
  height = 8,
}) => {
  // 计算总值
  const total = dataSource.reduce((sum, item) => sum + item.value, 0);
  const colors = dataSource?.map((item) => {
    return {
      color: item.color,
      percent: (item.value / total) * 100,
      description: item.description,
    };
  });

  return (
    <div className={styles["storage-container"]}>
      <div
        className={styles["storage-progress-container"]}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div className={styles["storage-progress"]}>
          {colors.map(({ color, percent, description }, index) => (
            <Tooltip key={index} title={description}>
              <span
                className={styles["storage-progress-item"]}
                key={index}
                style={{
                  width: `${percent}%`,
                  backgroundColor: `${color}`,
                }}
              />
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StorageProgress;
