import { Action } from "@zstack/zsphere-components";
import { DetailBreadcrumb, Header } from "@zstack/zsphere-components";
import { Illustration } from "@zstack/zsphere-illustration";
import type { BaremetalChassis as IBaremetalChassis } from "@zstack/zsphere-types/graphql";
import cls from "classnames";
import type { FC } from "react";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import useActionConfig from "../config/useActionConfig";

import style from "./style.module.less";

const STYLE_BLOCK = { display: "block" } as const;

export interface IProps {
  current: IBaremetalChassis;
  refetch: Function;
}

const DetailHeader: FC<IProps> = ({ current, refetch }) => {
  const intl = useIntl();
  const { name = "", status } = current || {};
  const { list: menuList, viewMap } = useActionConfig();
  const selectedList = useMemo(() => [current], [current]);

  const isConnected = !!status;

  const consoleIcon = useMemo(
    () => (
      <div
        className={cls(style["console-icon-container"], {
          [style.disabled]: !isConnected,
        })}
        onClick={() => {
          if (isConnected && current?.ipmiAddress) {
            window.open(`http://${current.ipmiAddress}`);
          }
        }}
      >
        <Illustration
          type="console.linux"
          width={120}
          height={68}
          style={STYLE_BLOCK}
        />
        <div className={style["console-icon-button"]}>
          {intl.formatMessage({
            id: "open.console",
            defaultMessage: "Launch Console",
          })}
        </div>
      </div>
    ),
    [isConnected, current, intl],
  );

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <div className={style.headerDetail}>
        {consoleIcon}
        <Header.Detail
          icon={<></>}
          title={name}
          actions={
            <Action
              view="main"
              viewMap={viewMap}
              menuList={menuList}
              position="header"
              refetch={refetch}
              source={current}
              selectedList={selectedList}
            />
          }
        />
      </div>
    </>
  );
};

export default DetailHeader;
