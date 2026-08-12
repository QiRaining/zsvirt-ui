import { Icon } from "@zstack/icon";
import { Color, getThemeColor, getNeutralColor } from "@zstack/zsphere-utils";
import { Tag as AntTag } from "antd";
import { TagProps } from "antd/es/tag/index";
import cls from "classnames";
import React, { useMemo } from "react";

import { getBaseCls } from "../../_utils/common";
import Text from "../text";

import "./style.less";

export interface IProps extends TagProps {
  size?: "medium" | "small";
  round?: boolean;
  level?: "strong" | "default" | "weak";
  mode?: Color.IMode;
  theme?: Color.ITheme;
}

const Tag: React.FC<IProps> = ({
  color,
  size,
  children,
  closable,
  onClick,
  className,
  round,
  level,
  mode = "light",
  theme,
  ...props
}) => {
  const colorObj = useMemo(() => {
    let bgColor: string;
    let textColor: string;
    let borderColor: string;
    if (color) {
      switch (color) {
        case "#186EAE":
        case "#0076F7":
        case "#005BD4":
          theme = "blue";
          break;
        case "#2CA6E6":
        case "#01C8E6":
        case "#039CC4":
          theme = "teal";
          break;
        case "#7385A8":
        case "#4F57FF":
        case "#3940DB":
          theme = "violet";
          break;
        case "#8A65D4":
        case "#9A45E4":
        case "#7A35C3":
          theme = "purple";
          break;
        case "#D14B52":
        case "#FF3F46":
        case "#DB2E43":
        case "#F93940":
          theme = "red";
          break;
        case "#DF9900":
        case "#FF9000":
        case "#DB7200":
          theme = "yellow";
          break;
        case "#918A12":
        case "#ADCC00":
        case "#92B102":
        case "#A9C800":
          theme = "yellow-green";
          break;
        case "#318857":
        case "#5BD149":
        case "#3CB335":
        case "#57D344":
          theme = "green";
          break;
      }
    }
    if (theme) {
      switch (level) {
        case "strong":
          textColor = getNeutralColor(mode, 0);
          bgColor = getThemeColor(theme, mode, 500);
          borderColor = getThemeColor(theme, mode, 500);
          break;
        case "weak":
          textColor = getThemeColor(theme, mode, 600);
          bgColor = getNeutralColor(mode, 0);
          borderColor = getThemeColor(theme, mode, 400);
          break;
        default:
          textColor = getThemeColor(theme, mode, 600);
          bgColor = getThemeColor(theme, mode, 100);
          borderColor = getThemeColor(theme, mode, 100);
          break;
      }
    } else {
      switch (level) {
        case "strong":
          textColor = getNeutralColor(mode, 0);
          bgColor = getNeutralColor(mode, 700);
          borderColor = getNeutralColor(mode, 700);
          break;
        case "weak":
          textColor = getNeutralColor(mode, 700);
          bgColor = getNeutralColor(mode, 0);
          borderColor = getNeutralColor(mode, 400);
          break;
        default:
          textColor = getNeutralColor(mode, 700);
          bgColor = getNeutralColor(mode, 200);
          borderColor = getNeutralColor(mode, 200);
          break;
      }
    }
    return {
      bgColor,
      textColor,
      borderColor,
    };
  }, [color, theme, mode]);

  return (
    <AntTag
      {...props}
      className={cls(
        getBaseCls("tag"),
        { [getBaseCls("tag-medium")]: size === "medium" },
        { [getBaseCls("tag-small")]: size === "small" },
        { [getBaseCls("tag-round")]: round },
        className,
      )}
      style={{
        color: colorObj.textColor,
        backgroundColor: colorObj.bgColor,
        borderColor: colorObj.borderColor,
        ...props?.style,
      }}
      closable={closable}
      closeIcon={closable && <Icon type="close" />}
      onClick={onClick}
    >
      <div
        className={cls(
          getBaseCls("tag-content"),
          { [getBaseCls("tag-content-closable")]: closable },
          { [getBaseCls("tag-content-clickable")]: !!onClick },
        )}
      >
        <Text value={children as string | number | null | undefined} />
      </div>
    </AntTag>
  );
};

export default Tag;
