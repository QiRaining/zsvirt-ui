import { Icon, type IconTypes } from "@zstack/icon";
import cls from "classnames";
import React, { memo } from "react";

import { getBaseCls } from "../../_utils/common";
import Text from "../../a-cloud-old-components/text";

import "./style.less";

export interface IProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  icon?: IconTypes | React.ReactElement;
  title: React.ReactElement | string;
  actions?: React.ReactElement;
  fields?: React.ReactElement;
  suffix?: React.ComponentType<any>;
}

const baseCls = getBaseCls("zsv-header-detail");

const IconWrapper: React.FC<{
  icon: IconTypes | React.ReactElement | undefined;
}> = ({ icon }) => {
  if (React.isValidElement(icon)) {
    return icon;
  }
  return (
    <div className={`${baseCls}-icon-container`}>
      <Icon
        type={icon as IconTypes}
        style={{
          width: 24,
          height: 24,
          fill: "var(--neutral-0)",
          color: "var(--neutral-0)",
        }}
        className={`${baseCls}-icon-inner`}
      />
    </div>
  );
};

const Suffix = memo(
  ({ suffix }: { suffix: React.ComponentType<any> | undefined }) => {
    if (!suffix) {
      return null;
    }

    return React.createElement(suffix);
  },
);

const Detail: React.FC<IProps> = (props) => {
  const { className, icon, title, actions, fields, suffix } = props;

  const hasActions = Boolean(actions);
  const hasFields = Boolean(fields);
  const hasSuffix = !!suffix;

  return (
    <div className={cls(baseCls, className)} id="zstack-header-detail">
      <div className={`${baseCls}-header`}>
        <div className={`${baseCls}-icon`}>
          <IconWrapper icon={icon} />
        </div>
        <div
          className={cls(
            `${baseCls}-basic-container`,
            !hasActions && `${baseCls}-basic-container-no-action`,
          )}
        >
          <div className={`${baseCls}-basic-info`}>
            <div className={`${baseCls}-title-container`}>
              <div className={`${baseCls}-title`}>
                <Text value={title as string | number | null | undefined}>
                  {title}
                </Text>
                {hasSuffix && <Suffix suffix={suffix} />}
              </div>
            </div>
          </div>
          {hasActions && <div className={`${baseCls}-actions`}>{actions}</div>}
        </div>
      </div>
      {hasFields && <div className={`${baseCls}-fields`}>{fields}</div>}
    </div>
  );
};

export default Detail;
