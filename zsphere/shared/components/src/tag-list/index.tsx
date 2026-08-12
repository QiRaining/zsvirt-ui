import { Tag } from "@zstack/design";
import { useSize } from "ahooks";
import cls from "classnames";
import { useState, useRef } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

export interface IProps {
  className?: string;
  tags: Array<{
    name?: string;
    uuid?: string;
    color?: string;
  }>;
}

export default function TagList({ tags, className }: IProps) {
  const intl = useIntl();
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostListRef = useRef<HTMLDivElement>(null);
  const containerSize = useSize(containerRef);
  const ghostListSize = useSize(ghostListRef);
  const isOverflow =
    containerSize.width &&
    ghostListSize.width &&
    ghostListSize.width > containerSize.width;

  const renderTagList = () => (
    <>
      {tags.map((item) => {
        return (
          <Tag color={item.color} key={item.uuid || item.name}>
            {item.name}
          </Tag>
        );
      })}
    </>
  );

  const renderBtn = () => (
    <a
      className={style.tagListBtn}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setVisible((value) => !value);
      }}
    >
      {visible
        ? intl.formatMessage({ id: "showUp", defaultMessage: "Fold up." })
        : intl.formatMessage({ id: "more", defaultMessage: "More" })}
    </a>
  );

  return (
    <div
      ref={containerRef}
      className={cls(style.tagList, className, {
        [style.tagListNonOverflow]: !isOverflow,
        [style.tagListExpand]: visible,
      })}
    >
      <div ref={ghostListRef} className={style.ghostWrapper}>
        {renderTagList()}
      </div>
      {visible ? (
        <div className={style.tagListWrapper}>
          {renderTagList()}
          {renderBtn()}
        </div>
      ) : (
        <>
          <div className={style.tagListWrapper}>{renderTagList()}</div>
          {renderBtn()}
        </>
      )}
    </div>
  );
}
