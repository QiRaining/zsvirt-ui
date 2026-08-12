import { Action, Tag, useShare } from "@zstack/zsphere-components";
import { Header, DetailBreadcrumb } from "@zstack/zsphere-components";
import type { L3Network as IL3Network } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { useActionConfig } from "../config";

import style from "./style.module.less";

interface IProps {
  current: IL3Network;
  refetch?: any;
  iconType?: any;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch, iconType }) => {
  const { name = "" } = current;
  const intl = useIntl();
  const { list: menuList, viewMap } = useActionConfig();
  const { isShareResource } = useShare();

  const memoizedSelectedList = useMemo(() => [current], [current]);

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon={iconType || "d-portgroup"}
        title={
          <div className="flex items-center gap-2">
            {name}
            {isShareResource([current]) ? (
              <Tag
                round
                size="small"
                level="weak"
                className={style.tag}
                style={{ verticalAlign: "text-bottom" }}
              >
                {intl.formatMessage({
                  id: "sharedResource",
                  defaultMessage: "Share Resource",
                })}
              </Tag>
            ) : null}
            {current.isDefault && (
              <Tag
                round
                level="weak"
                className={style.tag}
                style={{ verticalAlign: "text-bottom" }}
              >
                {intl.formatMessage({ id: "default", defaultMessage: "Default" })}
              </Tag>
            )}
          </div>
        }
        actions={
          <Action
            view="virtualization.detail"
            viewMap={viewMap}
            menuList={menuList}
            position="header"
            refetch={refetch}
            selectedList={memoizedSelectedList}
          />
        }
      />
    </>
  );
};

export default DetailHeader;
