import { DetailBreadcrumb, Header, Action } from "@zstack/zsphere-components";
import type { ResourceAttributeKey } from "@zstack/zsphere-types/graphql";
import React from "react";

import useActionConfig from "../config/useActionConfig";

export interface IProps {
  current?: ResourceAttributeKey;
  refetch?: () => void;
}

export default function DetailHeader({ current, refetch }: IProps) {
  const { list: menuList, viewMap } = useActionConfig();
  const name = current?.name ?? "";

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon="pricetags"
        title={name}
        actions={
          <Action
            view="main"
            refetch={refetch}
            resource="resource.attribute.key"
            position="header"
            menuList={menuList}
            viewMap={viewMap}
            selectedList={current ? [current] : []}
          />
        }
      />
    </>
  );
}
