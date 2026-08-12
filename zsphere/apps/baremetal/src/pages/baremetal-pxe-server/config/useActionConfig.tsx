import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/baremetal-pxe-server";
import { useAction } from "@zstack/zsphere-hooks";
import type { BaremetalPxeServer as IBaremetalPxeServer } from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import { verifyStart, verifyStop } from "../action/validator";

const reconnectBaremetalPxeServer = gql`
  mutation ($input: ReconnectBaremetalPxeServerInput!) {
    reconnectBaremetalPxeServer(input: $input) {
      actionId
    }
  }
`;

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  const options = useMemo(() => {
    return [
      {
        key: "reconnect",
        onClick: ({ selectedList, setSelectedList }) => {
          doAction({
            mutation: reconnectBaremetalPxeServer,
            payload: selectedList.map((cv) => ({
              uuid: cv.uuid,
            })),
            name: intl.formatMessage({
              id: "baremetal.pxeservice.action.reconnect",
              defaultMessage: "Reconnect Deployment Server",
            }),
            total: selectedList.length,
            onFinish: () => {
              setSelectedList?.([]);
            },
          });
        },
      },
      {
        key: "delete",
        ActionWrapper: require("../action/delete-baremetal-pxeservice").default,
      },
      {
        key: "edit",
        ActionWrapper: require("../action/update-modal").default,
      },
      {
        key: "start",
        ActionWrapper: require("../action/start-baremetal-pxeservice").default,
        validators: [verifyStart],
      },
      {
        key: "stop",
        ActionWrapper: require("../action/stop-baremetal-pxeservice").default,
        validators: [verifyStop],
      },
    ];
  }, [intl]);

  return useActionConfig<IBaremetalPxeServer>(options);
};
