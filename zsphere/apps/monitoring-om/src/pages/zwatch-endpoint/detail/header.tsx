import { Header, DetailBreadcrumb, Action } from "@zstack/zsphere-components";
import { EndPointType as IEndPointType } from "@zstack/zsphere-types";
import type { EndPoint as IEndPoint } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import useActionConfig from "../config/useActionConfig";

interface IProps {
  current: IEndPoint;
  refetch: any;
}

const BSDetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { list: menuList, viewMap } = useActionConfig();
  const { name, type } = current;
  const intl = useIntl();
  const _name =
    type === IEndPointType.SYSTEM_HTTP
      ? intl.formatMessage({
          id: "systemAlarmEndpoint",
          defaultMessage: "System Endpoint",
        })
      : name;
  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name: _name }]} />
      <Header.Detail
        icon="mail-receive"
        title={_name!}
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
};

export default BSDetailHeader;
