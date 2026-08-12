import {
  Action,
  Tag,
  Header,
  DetailBreadcrumb,
  useShare,
} from "@zstack/zsphere-components";
import type { L2Network as IL2Network } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { useActionConfig } from "../config";

import style from "./style.module.less";

const TAG_VERTICAL_ALIGN_STYLE = { verticalAlign: "text-bottom" } as const;

interface IProps {
  current: IL2Network;
  refetch?: any;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { name = "", description } = current;
  const intl = useIntl();
  const { list: menuList, viewMap } = useActionConfig();
  const { isShareResource } = useShare();

  const memoizedSelectedList = useMemo(() => [current], [current]);

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon="server-4"
        title={
          <div className="flex items-center gap-2">
            {name}
            {/* TODO 这里的useShare导入有问题,要么就是shared的导出有问题
             另外, 这里的Tag组件应该封装到Header里 */}
            {isShareResource([current]) ? (
              <Tag
                round
                size="small"
                level="weak"
                className={style.tag}
                style={TAG_VERTICAL_ALIGN_STYLE}
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
                style={TAG_VERTICAL_ALIGN_STYLE}
              >
                {intl.formatMessage({ id: "default", defaultMessage: "Default" })}
              </Tag>
            )}
          </div>
        }
        description={description}
        actions={
          <Action
            // TODO 这里的view需要根据是否共享资源来决定
            view={
              isShareResource([current]) ? "main.share" : "virtualization.main"
            }
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
