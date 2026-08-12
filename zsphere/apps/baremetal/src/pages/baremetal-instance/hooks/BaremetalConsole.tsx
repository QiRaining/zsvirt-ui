import { gql } from "@apollo/client";
import { useAction } from "@zstack/zsphere-hooks";
import {
  BaremetalInstanceState,
  BaremetalInstanceStatus,
} from "@zstack/zsphere-types";
import type { BaremetalInstance as IBaremetalInstance } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

const openBaremetalInstanceConsole = gql`
  mutation openBaremetalInstanceConsole(
    $input: OpenBaremetalInstanceConsoleInput!
  ) {
    openBaremetalInstanceConsole(input: $input) {
      actionId
    }
  }
`;

const useBaremetalConsole = ({
  instance,
}: {
  instance: IBaremetalInstance;
}) => {
  const doAction = useAction();
  const intl = useIntl();
  const checkIfWebTerminalEnabled = () => {
    return instance?.state === BaremetalInstanceState.Running;
  };

  const onOk = async () => {
    const payload = { uuid: instance.uuid };
    doAction({
      mutation: openBaremetalInstanceConsole,
      payload,
      name: intl.formatMessage({
        id: "open.baremetalInstance.console",
        defaultMessage: "Launch Bare Metal Instance Console",
      }),
      total: 1,
    });
  };

  const onClick = () => {
    if (instance?.baremetalPxeServer?.attachedClusterUuids?.length) {
      let vncUrl = `http://${window.location.hostname}:8090/vnc_lite.html?path=${instance.uuid}/websockify?token=${instance.uuid}`;

      if (
        instance?.state === BaremetalInstanceState.Running &&
        instance?.status === BaremetalInstanceStatus.Provisioning
      ) {
        vncUrl = `http://${window.location.hostname}:8090/${instance.uuid}/vnc_lite.html?path=${instance.uuid}/websockify?token=${instance.uuid}`;
      } else if (
        instance?.state === BaremetalInstanceState.Running &&
        instance?.status === BaremetalInstanceStatus.Provisioned
      ) {
        vncUrl = `http://${window.location.hostname}:8090/${instance.uuid}/`;
      }

      window.open(vncUrl);
      onOk();
    }
  };

  return { checkIfWebTerminalEnabled, onOk, onClick };
};

export default useBaremetalConsole;
