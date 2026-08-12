import { DetailBreadcrumb, Header } from "@zstack/zsphere-components";
import { Action, Tag } from "@zstack/zsphere-components";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import useActionConfig from "../config/useActionConfig";

import styles from "./style.module.less";

interface IProps {
  current: IVM;
  refetch: any;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { name = "", description, uuid } = current ?? {};
  const intl = useIntl();
  const { list: menuList, viewMap } = useActionConfig();

  const memoizedSelectedList = useMemo(() => [current], [current]);

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon="folder"
        title={
          uuid === "uuid" ? (
            <div className="flex items-center gap-2">
              <div>
                {intl.formatMessage({
                  id: "virtualization.default.dir",
                  defaultMessage: "Default Group",
                })}
              </div>
              <Tag round level="weak" className={styles["header-default-tag"]}>
                {intl.formatMessage({ id: "default", defaultMessage: "Default" })}
              </Tag>
            </div>
          ) : (
            name
          )
        }
        actions={
          uuid !== "uuid" ? (
            <Action
              view="virtualization.dir"
              viewMap={viewMap}
              menuList={menuList}
              position="header"
              source={current}
              selectedList={memoizedSelectedList}
            />
          ) : undefined
        }
      />
    </>
  );
};

export default DetailHeader;
