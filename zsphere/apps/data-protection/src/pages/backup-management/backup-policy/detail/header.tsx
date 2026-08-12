import { Header, DetailBreadcrumb, Action } from "@zstack/zsphere-components";
import type { VmGroup } from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import { useEffect } from "react";

import useActionConfig from "../config/useActionConfig";

export interface IProps {
  current?: VmGroup;
  refetch?: () => void;
}

export default function DetailHeader({ current, refetch }: IProps) {
  const { list: menuList, viewMap } = useActionConfig();
  const name = current?.name ?? "";

  useEffect(() => {
    const cb = () => refetch?.();
    bus.addListener("action:refetch:SchedulerJobGroup", cb);
    return () => bus.removeListener("action:refetch:SchedulerJobGroup", cb);
  }, [refetch]);

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon="backup"
        title={name}
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
      />
    </>
  );
}
