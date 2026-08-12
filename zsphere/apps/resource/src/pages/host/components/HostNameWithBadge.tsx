import { Text } from "@zstack/design";
import { ResourceName, Tag } from "@zstack/zsphere-components";
import { NodeType } from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import type { HostVO } from "@zstack/zsphere-types/graphql";
import React from "react";
import type { IntlShape } from "react-intl";

import style from "./style.module.less";

export const renderHostNameWithBadge = ({
  intl,
  current,
  view = "select",
}: {
  intl: IntlShape;
  current: HostVO;
  view?: string;
}) => {
  const { hostNodeInfo } = current;
  const nameContent = view?.includes("select") ? (
    <Text>{current?.name}</Text>
  ) : (
    <ResourceName
      value={current?.name}
      link={{
        to: `/host`,
        microAppName: "virtualization-resource",
        uuid: current?.uuid,
        leftnav: LeftNavType.ClusterHost,
        keepState: false,
      }}
    />
  );

  return (
    <div className={style.nameWrapper}>
      {nameContent}
      {hostNodeInfo?.nodeType === NodeType.ManagementNode && (
        <Tag round level="weak" className={style.tag}>
          {intl.formatMessage({
            id: "mangementNode",
            defaultMessage: "Management Node",
          })}
        </Tag>
      )}
    </div>
  );
};
