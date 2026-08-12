import type { ListItem } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import type {
  AccountThirdPartyAuth as IAccountThirdPartyAuth,
  ThirdPartyAuthVO as IThirdPartyAuthVO,
} from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import EditOidcConfig from "../../action/edit-config";

interface IProps {
  current: Partial<IAccountThirdPartyAuth & IThirdPartyAuthVO>;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch?: any;
}

const ConfigInfo: FC<IProps> = ({
  current,
  onCollapseChange,
  collapsed,
  refetch,
}) => {
  const intl = useIntl();
  const memoizedSelectedList = useMemo(
    () => [current as IAccountThirdPartyAuth],
    [current],
  );

  const [editConfigVisible, setEditConfigVisible] =
    React.useState<boolean>(false);

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "local.properties",
          defaultMessage: "Local Attributes",
        }),
        value: intl.formatMessage({
          id: "third.party.auth.properties",
          defaultMessage: "SSO Attributes",
        }),
      },
      {
        label: intl.formatMessage({
          id: "username",
          defaultMessage: "Username",
        }),
        value: current?.usernameProperty,
      },
    ],
    [intl, current],
  );

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "user.info.syncMappingRules",
          defaultMessage: "User Info Mapping Rule",
        })}
        isList
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
        titleActions={[
          {
            icon: "edit",
            onClick: () => setEditConfigVisible(true),
            authKey: "modify.rulesMapping",
            resource: "account.third.party.auth",
          },
        ]}
      >
        <List list={list} type="table" bordered={false} />
      </DraggableCard>

      <EditOidcConfig
        visible={editConfigVisible}
        setVisible={setEditConfigVisible}
        selectedList={memoizedSelectedList}
        view="main"
        position="header"
        refetch={refetch}
      />
    </>
  );
};

export default ConfigInfo;
