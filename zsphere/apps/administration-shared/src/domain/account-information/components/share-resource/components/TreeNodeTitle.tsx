import { Text } from "@zstack/design";
import { Icon, type IconName } from "@zstack/icon";
import type { TreeResourceType } from "@zstack/zsphere-types";
import React, { useMemo } from "react";

import style from "./style.module.less";

const STYLE_FLEX_NONE = { flex: "none" } as const;

const iconTypeMap: Map<string, string> = new Map([
  ["zone", "building"],
  ["cluster", "server-1"],
  ["host", "disk-2"],
  ["vm", "monitor"],
  ["l2-network", "server-4"],
  ["l3-network", "d-portgroup"],
  ["backup-storage", "server"],
  ["primary-storage", "storage"],
  ["root-node", "editor"],
  ["directory", "folder"],
  ["vm-template", "file-paste"],
]);

interface IProps {
  title: string;
  titleNode?: React.ReactNode;
  itemKey: string;
  level?: number;
  isSelected?: boolean;
  type?: TreeResourceType;
  state?: string;
  iconType?: string;
  extra?: React.ReactNode;
  hideIcon?: boolean;
}

const TreeNodeTitle: React.FC<IProps> = React.memo(
  ({ titleNode, itemKey, iconType, type = "vm", extra, hideIcon = false }) => {
    const icon = useMemo(() => {
      if (type === "image") {
        return iconType ? (
          <Icon type={iconType as IconName} width={16} height={16} />
        ) : null;
      }

      if (iconType) {
        return <Icon type={iconType as IconName} width={16} height={16} />;
      }

      const mappedIconType = iconTypeMap.get(type);
      return mappedIconType ? (
        <Icon type={mappedIconType as IconName} width={16} height={16} />
      ) : null;
    }, [iconType, type]);

    return (
      <div
        className={style.treeTitleContainer}
        data-type={type}
        data-key={itemKey}
      >
        <div className={style.titlePart}>
          {!hideIcon && (
            <div style={STYLE_FLEX_NONE} title="">
              {icon}
            </div>
          )}
          <div className={style.title}>
            <Text>{titleNode}</Text>
          </div>
        </div>
        <div className={style.extraWrapper}>{extra}</div>
      </div>
    );
  },
);

TreeNodeTitle.displayName = "TreeNodeTitle";

export default TreeNodeTitle;
