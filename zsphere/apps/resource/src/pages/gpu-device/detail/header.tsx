import { Action, DetailBreadcrumb, Header } from "@zstack/zsphere-components";
import type { PciDevice as IPciDevice } from "@zstack/zsphere-types/graphql";
import React from "react";

import useActionConfig from "../config/useActionConfig";

interface IProps {
  current: IPciDevice;
  refetch: any;
}

const HostDetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { name } = current;
  const selectedList = [current];
  const { list, viewMap } = useActionConfig();

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon="pin-fill"
        title={name!}
        actions={
          <div className="flex justify-between">
            <div>
              <Action
                view="main"
                menuList={list}
                viewMap={viewMap}
                position="header"
                refetch={refetch}
                selectedList={selectedList}
              />
            </div>
          </div>
        }
      />
    </>
  );
};

export default HostDetailHeader;
