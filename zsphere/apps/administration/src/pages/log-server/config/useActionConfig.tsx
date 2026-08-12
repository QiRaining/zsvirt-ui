import { useActionConfig } from "@zstack/zsphere-engine/src/log-server";
import { useAction } from "@zstack/zsphere-hooks";
import type {
  LogServer as ILogServer,
  TestLogServerPayload,
} from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import { testLogServer } from "../../../gql/log-server.gql";
import {
  buildTestLogServerConfiguration,
  parseLogServerLabelValue,
} from "../action/schema";
import { verifyMulti, verifySingle } from "../action/validator";

const TEST_CONNECTION_SYSTEM_TAGS = ["ephemeral::validationOnly"];

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  return useActionConfig<ILogServer>([
    {
      key: "create.logServer",
      primary: true,
      autoInjectPreValidator: false,
      ActionWrapper: require("../action/add-modal").default,
    },
    {
      key: "edit",
      name: intl.formatMessage({
        id: "edit",
        defaultMessage: "Edit",
      }),
      preValidators: [verifySingle],
      ActionWrapper: require("../action/update-modal").default,
    },
    {
      key: "test",
      onClick: ({ selectedList, setSelectedList }) => {
        const payload: TestLogServerPayload[] = selectedList.map((t) => {
          const values = {
            ...parseLogServerLabelValue(t.labelValue),
            name: t.name,
            host: t.hostname ?? "",
            port: t.port ?? "",
          };

          return buildTestLogServerConfiguration(
            values,
            TEST_CONNECTION_SYSTEM_TAGS,
          );
        });
        doAction({
          mutation: testLogServer,
          payload,
          name: intl.formatMessage({
            id: "test.logserver",
            defaultMessage: "Test Log Server",
          }),
          type: "LogServer",
          total: selectedList.length,
          onFinish: () => {
            setSelectedList?.([]);
          },
        });
      },
    },
    {
      key: "delete",
      preValidators: [verifyMulti],
      ActionWrapper: require("../action/delete-modal").default,
    },
  ]);
};
