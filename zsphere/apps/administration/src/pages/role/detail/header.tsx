import {
  DetailBreadcrumb,
  Header,
  Action,
  Tag,
} from "@zstack/zsphere-components";
import { ZsvRoleQueryType } from "@zstack/zsphere-types";
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import useActionConfig from "../config/useActionConfig";
import { transformRoleName } from "../utils";

interface IProps {
  current: IAccount;
  refetch: any;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const intl = useIntl();
  const { name = "", uuid = "" } = current;
  const selectedList = [current];

  const { list, viewMap } = useActionConfig();

  return (
    <>
      <DetailBreadcrumb
        breadcrumbItems={[{ name: transformRoleName(intl, { uuid, name }) }]}
      />
      <Header.Detail
        icon="authority"
        title={
          <div className="flex items-center gap-1">
            {transformRoleName(intl, { uuid, name })}
            {current?.type === ZsvRoleQueryType.Predefined && (
              <Tag round level="weak">
                {intl.formatMessage({ id: "default", defaultMessage: "Default" })}
              </Tag>
            )}
          </div>
        }
        actions={
          <Action
            view="virtualization.main"
            menuList={list}
            viewMap={viewMap}
            position="header"
            refetch={refetch}
            selectedList={selectedList.map((item) => ({
              ...item,
              name: transformRoleName(intl, item),
            }))}
          />
        }
      />
    </>
  );
};

export default DetailHeader;
