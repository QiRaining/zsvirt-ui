import { Tooltip } from "@zstack/design";
import { Icon, type IconTypes } from "@zstack/icon";
import React from "react";
import SVG from "react-inlinesvg";

import styles from "./style.module.less";

interface InitWayItemProps {
  icon: IconTypes;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

const InitWayItem: React.FC<InitWayItemProps> = ({
  icon,
  title,
  description,
  selected,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={
        selected ? styles["item-selected"] : styles["item-not-selected"]
      }
    >
      {selected && (
        <div className={styles["selected-indicator"]}>
          <SVG
            className={styles.triangle}
            src={require("../../assets/illustration_triangle.svg")}
            uniquifyIDs
          />
          <Icon type="checkmark" className={styles.checkmark} />
        </div>
      )}
      <div className={styles["icon-title"]}>
        <div
          className={
            selected ? styles["iconself-checked"] : styles["iconself-uncheck"]
          }
        >
          <Icon
            type={icon}
            className={
              selected ? styles["icon-checked"] : styles["icon-uncheck"]
            }
          />
        </div>
        <Tooltip title={title}>
          <div className={styles.title}>{title}</div>
        </Tooltip>
      </div>
      <div className={styles.description}>
        <Tooltip title={description}>
          <p
            className={styles.descriptionText}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </p>
        </Tooltip>
      </div>
    </div>
  );
};

export default InitWayItem;
