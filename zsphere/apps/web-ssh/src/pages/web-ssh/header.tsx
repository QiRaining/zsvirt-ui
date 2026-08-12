import { Alert, Tooltip } from "@zstack/design";
import { Icon, type IconTypes } from "@zstack/icon";
import cs from "classnames";
import type { CSSProperties } from "react";
import React from "react";

import style from "./style.module.less";

interface IMenuItemProps {
  content?: React.ReactNode;
  className?: string;
  iconType?: IconTypes;
  toolTip?: boolean;
  maxPercent?: number;
  decorator?: (content?: React.ReactNode) => React.ReactNode;
}

const Content: React.FC<
  Omit<IMenuItemProps, "toolTip"> & {
    style?: CSSProperties;
    innerClassName?: string;
  }
> = ({
  content,
  className,
  iconType,
  decorator,
  style: cssStyle,
  innerClassName,
}) => {
  return (
    <div className={cs(className, style.menuItem)}>
      {iconType && <Icon type={iconType} />}
      {decorator
        ? decorator(
            <span style={cssStyle} className={innerClassName}>
              {content}
            </span>,
          )
        : content}
    </div>
  );
};
const MenuItem: React.FC<IMenuItemProps> = ({
  content,
  toolTip = false,
  maxPercent,
  ...rest
}) => {
  // const content = rest?.decorator ? rest?.decorator(_content) : _content
  if (toolTip) {
    const { showToolTip, width } = toolTipText(content, maxPercent);
    if (showToolTip) {
      return (
        <Tooltip title={content}>
          <div className={cs(rest.className, style.menuItem)}>
            {rest.iconType && <Icon type={rest.iconType} />}
            {rest.decorator
              ? rest.decorator(
                  <span style={{ width }} className={style.ellipsis}>
                    {content}
                  </span>,
                )
              : content}
          </div>
        </Tooltip>
      );
    }
  }

  return <Content content={content} {...rest} />;
};

const getDomWidth = (text: string, className = "terminalHeaderMeasureDiv") => {
  const measureDiv = document.createElement("div");
  measureDiv.className = className;
  measureDiv.textContent = text;
  document.documentElement.append(measureDiv);
  setTimeout(() => {
    measureDiv.remove();
  });

  return measureDiv.clientWidth;
};

const toolTipText = (text = "", maxPercent = 0.5) => {
  const textWidth = getDomWidth(text);

  const windowWidth = document.documentElement.clientWidth;

  const percent = (textWidth * 1.0) / windowWidth;
  const showToolTip = percent > maxPercent;
  const width = Math.round(maxPercent * windowWidth);
  return {
    showToolTip,
    width,
  };
};

interface WebShellHeaderProps {
  title?: string;
  sn?: string;
  ip?: string;
}
const WebSshHeader: React.FC<WebShellHeaderProps> = ({ title, sn, ip }) => {
  const menus: IMenuItemProps[] = [
    {
      iconType: "hard-drive",
      content: <div className={style.overflow}>{title}</div>,
      toolTip: true,
    },
    {
      content: sn,
      toolTip: true,
      maxPercent: 0.2,
      decorator: (_sn = "") => <>({_sn})</>,
      className: style.ipMargin,
    },
    {
      iconType: "IP",
      content: ip,
    },
  ];
  return (
    <header className={style.header}>
      {menus.map((menu, index) => (
        <MenuItem key={menu.iconType ?? `menu-${index}`} {...menu} />
      ))}
    </header>
  );
};

export const HeaderAlert: React.FC<{
  message: string;
}> = ({ message }) => {
  return (
    <Alert
      className={style.errorTip}
      variant="danger"
      display="strong"
      closable
    >
      {message}
    </Alert>
  );
};

export default WebSshHeader;
