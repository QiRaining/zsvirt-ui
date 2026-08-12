import { RadioGroup } from "@zstack/design";
import type { IQuery } from "@zstack/zsphere-types";
import {
  UserGroupQueryType,
  AccountQueryType,
  Op,
} from "@zstack/zsphere-types";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import AccountPlainList from "../../account/account-plain/account-plain-list";
import UserPlainGroupList from "../../user-group/user-group-plain/user-group-plain-list";
import useAccountActionConfig from "./use-account-action-config";
import useUserGroupActionConfig from "./use-user-group-action-config";

const STYLE_MARGIN_TOP = { marginTop: "8px" } as const;

export enum PageType {
  user = "user",
  userGroup = "userGroup",
}

interface ISharingPermissionsProps {
  defaultPage?: PageType;
  source?: any;
  defaultQuery?: IQuery;
}

// TODO: 共享权限Component - 用户/用户组
const SharingPermissions: React.FC<ISharingPermissionsProps> = ({
  defaultPage = PageType.user,
  source,
  defaultQuery,
}) => {
  const intl = useIntl();
  const [currentPage, setCurrentPage] = useState<PageType>(defaultPage);
  const notSharedUserGroupType = useMemo(() => source?.isTemplate, [source]);

  const accountActionConfig = useAccountActionConfig();
  const userGroupActionConfig = useUserGroupActionConfig();

  return notSharedUserGroupType ? (
    <AccountPlainList
      actionConfig={accountActionConfig}
      view="virtualization.sub.shareAuth"
      source={{ ...source, currentPage }}
      defaultQuery={{
        type: AccountQueryType.GET_ACCOUNT_BY_SHARED,
        conditions: [
          {
            key: "name",
            op: Op.ne,
            value: "admin",
          },
        ],
        ...defaultQuery,
      }}
    />
  ) : (
    <>
      <RadioGroup
        value={currentPage}
        defaultValue={PageType.user}
        variant="button"
        onValueChange={(value) => setCurrentPage(value as PageType)}
        options={[
          {
            value: PageType.user,
            label: intl.formatMessage({
              id: "virtualization.sub.shareAuth.user",
              defaultMessage: "User",
            }),
          },
          {
            value: PageType.userGroup,
            label: intl.formatMessage({
              id: "virtualization.sub.shareAuth.userGroup",
              defaultMessage: "User Group",
            }),
          },
        ]}
      />

      <div style={STYLE_MARGIN_TOP}>
        {currentPage === "user" ? (
          <AccountPlainList
            actionConfig={accountActionConfig}
            view="virtualization.sub.shareAuth"
            source={{ ...source, currentPage }}
            defaultQuery={{
              type: AccountQueryType.GET_ACCOUNT_BY_SHARED,
              conditions: [
                {
                  key: "name",
                  op: Op.ne,
                  value: "admin",
                },
              ],
              ...defaultQuery,
            }}
          />
        ) : (
          <UserPlainGroupList
            actionConfig={userGroupActionConfig}
            view="virtualization.sub.shareAuth"
            source={{ ...source, currentPage }}
            defaultQuery={{
              type: UserGroupQueryType.GET_USERGROUP_BY_SHARED,
              ...defaultQuery,
            }}
          />
        )}
      </div>
    </>
  );
};

export default SharingPermissions;
