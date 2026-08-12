import { useActionConfig } from "@zstack/zsphere-engine/src/account-third-party-auth";
import { useAction } from "@zstack/zsphere-hooks";
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import { testConnectionThirdParty } from "../../../gql/account-third-party-auth.gql";

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  const actions = useActionConfig<IAccount>([
    {
      key: "virtualization.edit.config",
      ActionWrapper: require("../action/edit-config").default,
    },
    {
      key: "virtualization.edit.info",
      ActionWrapper: require("../action/update-config").default,
    },
    {
      key: "virtualization.edit.name.and.description",
      ActionWrapper: require("../action/update-modal").default,
    },
    {
      key: "virtualization.delete",
      ActionWrapper: require("../action/delete-modal").default,
    },
    {
      key: "sync",
      ActionWrapper: require("../action/sync-modal").default,
    },
    {
      key: "testConnect",
      onClick: ({ selectedList }) => {
        const current = selectedList?.[0] ?? {};

        doAction({
          mutation: testConnectionThirdParty,
          payload: {
            uuid: current.uuid,
            ldapFilter: `name=${current.name}`,
          },
          name: intl.formatMessage({
            id: "test.connection.3rdPartyAuthServer",
            defaultMessage: "Test Connection of SSO Server",
          }),
          total: 1,
        });
      },
    },
    {
      key: "modify.rulesMapping",
      onClick: () => {},
    },
  ]);

  return actions;
};
