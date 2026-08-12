import {
  Action,
  Tag,
  Header,
  DetailBreadcrumb,
  useShare,
} from "@zstack/zsphere-components";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import useActionConfig from "../config/useActionConfig";

import styles from "./style.module.less";

const STYLE_TAG = { verticalAlign: "text-bottom" } as const;

interface IProps {
  current: any;
  refetch?: any;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { name = "" } = current;
  const intl = useIntl();
  const { isShareResource } = useShare();
  const { list: menuList, viewMap } = useActionConfig();
  const selectedList = useMemo(() => [current], [current]);

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon="file-paste"
        title={
          <div className="flex items-center gap-2">
            {name}
            {isShareResource([current]) ? (
              <Tag
                round
                size="small"
                level="weak"
                className={styles.tag}
                style={STYLE_TAG}
              >
                {intl.formatMessage({
                  id: "sharedResource",
                  defaultMessage: "Share Resource",
                })}
              </Tag>
            ) : null}
          </div>
        }
        actions={
          <Action
            view="main"
            viewMap={viewMap}
            menuList={menuList}
            position="header"
            refetch={refetch}
            selectedList={selectedList}
          />
        }
      />
    </>
  );
};

export default DetailHeader;
