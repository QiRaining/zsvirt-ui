import { Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { IconState } from "@zstack/zsphere-components";
import { getNeutralColor } from "@zstack/zsphere-utils";
import React from "react";

import style from "./style.module.less";

interface IProps {
  title: string;
  itemKey: string;
  level?: number;
  isSelected?: boolean;
  type?: "host" | "cluster";
  attr: any;
}

const STYLE_ICON_CONTAINER = { flex: "none" } as const;

const TreeNodeTitle: React.FC<IProps> = ({
  itemKey,
  attr,
  type = "vm",
  title,
}) => {
  //对应的资源状态
  const getState = (type: string) => {
    if (type === "host") {
      //
      return attr?.state ?? "";
    }

    return "enable";
  };

  const getIconType = (type: string) => {
    if (type === "cluster") {
      return "server-1";
    }
    if (type === "host") {
      return "disk-2";
    }

    return "monitor";
  };

  return (
    <div
      className={style.treeTitleContainer}
      data-type={type}
      data-key={itemKey}
    >
      <div className={style.titlePart}>
        <div style={STYLE_ICON_CONTAINER} title="">
          {["host"].indexOf(type) === -1 ? (
            <Icon type={getIconType(type) as any} size={16} />
          ) : (
            <IconState
              state={getState(type) as any}
              color={getNeutralColor("light", 400) as any}
              resourceKey={getIconType(type) as any}
              size={16}
            />
          )}
        </div>
        <div className={style.title}>
          <Text title={title}>{title}</Text>
        </div>
      </div>
    </div>
  );
};

export default TreeNodeTitle;
