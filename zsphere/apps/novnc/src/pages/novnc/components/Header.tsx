import { Tooltip } from "@zstack/design";
import { Icon, type IconTypes } from "@zstack/icon";
import { Layout } from "antd";
import cs from "classnames";
import React, { useMemo } from "react";

import style from "./style.module.less";

const { Header } = Layout;
interface INoVncHeaderProps {
  title?: string;
  platform?: string;
  ip?: string;
  uuid?: string;
}

interface IMenuItemProps {
  content?: string;
  className?: string;
  iconType: IconTypes;
  toolTipContent?: string;
}

const MenuItem: React.FC<IMenuItemProps> = ({
  content,
  iconType,
  className,
  toolTipContent,
}) => {
  const showToolTip = !!toolTipContent;

  const Content = useMemo(() => {
    if (showToolTip) {
      return (
        <Tooltip title={toolTipContent}>
          <span>{content}</span>
        </Tooltip>
      );
    }

    return content;
  }, [content, showToolTip, toolTipContent]);

  return (
    <div className={cs(className, style.menuItem)}>
      <Icon type={iconType} />
      {Content}
    </div>
  );
};
const NoVncHeader: React.FC<INoVncHeaderProps> = ({
  title,
  platform,
  uuid,
  ip,
}) => {
  const platformIcon = (
    {
      linux: "linux",
      windows: "windows",
      other: "file",
    } as any
  )[platform!]!;

  const showToolTip = title?.length && title?.length > 40;
  const _title = showToolTip ? `${title?.slice(0, 40)}...` : title;
  const menus: IMenuItemProps[] = [
    {
      iconType: "monitor",
      content: `${_title} (${uuid})`,
      toolTipContent: showToolTip ? title : undefined,
    },
    {
      iconType: platformIcon as any,
      content: platform,
    },
    {
      iconType: "IP",
      content: ip,
    },
  ];
  return (
    <Header className={style.header}>
      {menus.map((menu) => (
        <MenuItem key={menu.iconType} {...menu} />
      ))}
    </Header>
  );
};

export default NoVncHeader;
