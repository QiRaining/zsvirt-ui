import { Icon } from "@zstack/icon";
import { getNeutralColor } from "@zstack/zsphere-utils";
import { Tooltip } from "antd";
import { isString } from "lodash-es";
import React, { useMemo } from "react";

import Text from "../a-cloud-old-components/text";
import IconState from "../icon-state";

import "../modal-tree-select/style.less";

interface IProps {
  title: string | React.ReactNode;
  itemKey: string;
  level?: number;
  isSelected?: boolean;
  attr: any;
  state?: string;
  icon?: string;
  disabled?: boolean;
  tooltip?: string;
}

const TreeNodeTitle: React.FC<IProps> = ({
  itemKey,
  attr,
  state,
  icon,
  title,
  disabled,
  tooltip,
}) => {
  //对应的资源状态

  const IconItem = useMemo(() => {
    if (state)
      return (
        <IconState
          state={state as any}
          color={getNeutralColor("light", 400) as any}
          resourceKey={icon as any}
          size={16}
        />
      );
    if (icon) return <Icon type={icon as any} />;
  }, [icon, attr, state]);

  const el = (
    <div className="treeTitleContainer" data-key={itemKey}>
      <div className="treeTitleContainer-titlePart">
        <div style={{ flex: "none" }} title="">
          {IconItem}
        </div>
        <div className="treeTitleContainer-titlePart-title">
          {isString(title) ? (
            <Text ellipsis={true} value={title} title={title} />
          ) : (
            title
          )}
        </div>
      </div>
    </div>
  );

  return disabled && tooltip ? <Tooltip title={tooltip}>{el}</Tooltip> : el;
};

export default TreeNodeTitle;
