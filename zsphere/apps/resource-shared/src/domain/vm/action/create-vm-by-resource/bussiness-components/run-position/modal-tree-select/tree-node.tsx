import { Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { IconState } from "@zstack/zsphere-components";
import { getNeutralColor } from "@zstack/zsphere-utils";
import React, { useMemo } from "react";

import style from "./style.module.less";

interface IProps {
  title: string;
  itemKey: string;
  level?: number;
  isSelected?: boolean;
  type?: "host" | "cluster";
  attr: any;
  extra?: React.ReactNode;
}

const TreeNodeTitle: React.FC<IProps> = ({
  itemKey,
  attr,
  type = "vm",
  title,
  extra,
}) => {
  //对应的资源状态
  const renderState = useMemo(() => {
    if (type === "host") {
      //
      return attr?.state ?? "";
    }

    return "enable";
  }, [attr?.state, type]);

  const renderIconType = useMemo(() => {
    if (type === "cluster") {
      return "server-1";
    }
    if (type === "host") {
      return "disk-2";
    }

    return "monitor";
  }, [type]);

  return (
    <div
      className={style.treeTitleContainer}
      data-type={type}
      data-key={itemKey}
    >
      <div className={style.titlePart}>
        <div style={{ flex: "none" }} title="">
          {["host"].indexOf(type) === -1 ? (
            <Icon type={renderIconType} size={16} />
          ) : (
            <IconState
              state={renderState}
              color={getNeutralColor("light", 400) as any}
              resourceKey={renderIconType}
              size={16}
            />
          )}
        </div>
        <div className={style.title}>
          <Text>{title}</Text>
        </div>
      </div>
      {extra}
    </div>
  );
};

export default TreeNodeTitle;
