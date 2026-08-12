import { Text } from "@zstack/design";
import { Icon, type IconTypes } from "@zstack/icon";
import cls from "classnames";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { formatGroupName } from "../utils";

import style from "./style.module.less";

interface IProps {
  title: string;
  vmNums: number;
  viewType: string;
  itemKey: string;
  level?: number;
  groupName?: string;
  clusterRefetch?: Function | undefined;
  isSelected?: boolean;
  view: "tree" | "treeSelect";

  showCount?: boolean;
  titleClassName?: string;
}

const TreeNodeTitle: React.FC<IProps> = ({
  level = 2,
  title,
  vmNums = 0,
  showCount = true,
  titleClassName: titleCls,
  viewType,
  itemKey,
  isSelected = false,
  view = "tree",
}) => {
  const intl = useIntl();

  const getNodeIcon: IconTypes | null = useMemo(() => {
    if (viewType === "empty") {
      return null;
    }

    if (level === 0) {
      return "monitor";
    }

    if (viewType === "group") {
      return "folder";
    }

    if (viewType === "cluster") {
      if (level === 1) {
        return "server-1";
      }
    }

    return "hard-drive";
  }, [level, viewType]);

  const getTreeNodeWidth = (layer: number) => {
    switch (layer) {
      case 0:
        return 200;
      case 1:
        return 170;
      case 2:
        return 160;
      case 3:
        return 150;
      default:
        return 160;
    }
  };

  return (
    <>
      <div className={style.badgeContainer}>
        <div
          className={cls(style.titlePart, titleCls)}
          style={{ width: getTreeNodeWidth(level) }}
        >
          <div style={{ flex: "none" }}>
            {getNodeIcon && <Icon type={getNodeIcon} />}
          </div>

          <div className={style.title}>
            <Text>{formatGroupName(title, itemKey, intl)}</Text>
          </div>

          {showCount && <div className={style.num}>{`(${vmNums})`}</div>}
        </div>

        {view === "treeSelect" && (
          <div className={style.treeNodechecked}>
            {isSelected && (
              <Icon type="checkmark" color="info" colorNumber={500} />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TreeNodeTitle;
