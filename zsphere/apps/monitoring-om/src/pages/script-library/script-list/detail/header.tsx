import { Header, Action, DetailBreadcrumb } from "@zstack/zsphere-components";
import type { Script } from "@zstack/zsphere-types/graphql";
import React from "react";

import useActionConfig from "../config/useActionConfig";

import style from "./style.module.less";

interface IProps {
  current: Script;
  refetch: any;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { list: menuList, viewMap } = useActionConfig();
  const { name, description } = current;
  return (
    <div className={style["script-header"]}>
      <DetailBreadcrumb breadcrumbItems={[{ name: name! }]} />
      <Header.Detail
        icon="file-code"
        title={name!}
        actions={
          <Action
            view="main"
            menuList={menuList}
            viewMap={viewMap}
            position="header"
            refetch={refetch}
            selectedList={[current]}
          />
        }
        description={description}
      />
    </div>
  );
};

export default DetailHeader;
