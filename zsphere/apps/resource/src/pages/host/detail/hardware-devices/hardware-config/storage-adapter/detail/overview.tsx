import { Action, DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import useActionConfig from "../config/useActionConfig";
import { formatType, renderIdentifier, renderState } from "../util";

import style from "./style.module.less";

export interface IProps {
  current: any;
}

export default function Overview({ current }: IProps) {
  const intl = useIntl();
  const { list: menuList, viewMap } = useActionConfig();
  const selectedList = useMemo(() => [current], [current]);

  const list: ListItem[] = useMemo(() => {
    const driver = current?.model?.match(/DVR:([^ ]+)/)?.[1];
    const firmware = current?.model?.match(/FW:([^ ]+)/)?.[1];
    return [
      {
        label: intl.formatMessage({ id: "name", defaultMessage: "Name" }),
        value: current.name,
      },
      {
        label: intl.formatMessage({
          id: "common.state",
          defaultMessage: "Status",
        }),
        value: renderState(current),
      },
      {
        label: intl.formatMessage({ id: "model", defaultMessage: "Model" }),
        value:
          current?.type === "FC"
            ? current?.model?.split(" ")[0]
            : current?.model,
      },
      {
        label: intl.formatMessage({ id: "type", defaultMessage: "Type" }),
        value: formatType(current),
      },
      {
        label: intl.formatMessage({
          id: "storage.adapter.identifier",
          defaultMessage: "Identifier",
        }),
        value: renderIdentifier(current),
      },
      {
        label: intl.formatMessage({
          id: "storage.adapter.speed",
          defaultMessage: "Speed",
        }),
        value: current.speed || "-",
      },
      {
        label: intl.formatMessage({
          id: "storage.adapter.target",
          defaultMessage: "Target",
        }),
        value: current.target,
      },
      {
        label: intl.formatMessage({ id: "device", defaultMessage: "Device" }),
        value: current.device,
      },
      {
        label: intl.formatMessage({
          id: "storage.adapter.driver.version",
          defaultMessage: "Driver Version",
        }),
        show: !!driver,
        value: driver,
      },
      {
        label: intl.formatMessage({
          id: "storage.adapter.firmware.version",
          defaultMessage: "Firmware Version",
        }),
        show: !!firmware,
        value: firmware,
      },
    ];
  }, [current, intl]);

  return (
    <div className={style.basicInfo}>
      {current?.type !== "FC" && (
        <Action
          menuList={menuList}
          viewMap={viewMap}
          view="main"
          position="header"
          selectedList={selectedList}
        />
      )}
      <DraggableCard
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
        isList
      >
        <List list={list} bordered={false} />
      </DraggableCard>
    </div>
  );
}
