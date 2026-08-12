import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import {
  BaremetalInstanceStatus,
  BaremetalInstanceState,
} from "@zstack/zsphere-types";
import type { BaremetalInstance as IBaremetalInstance } from "@zstack/zsphere-types/graphql";
import React, { useEffect } from "react";
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

const Action: React.FC<IActionWrapperProps<IBaremetalInstance>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const current: IBaremetalInstance = selectedList?.[0];

  const onOk = async () => {
    const payload = selectedList.map((item: IBaremetalInstance) => {
      return {
        uuid: item.uuid,
      };
    });

    doAction({
      mutation: openBaremetalInstanceConsole,
      payload,
      name: intl.formatMessage({
        id: "open.baremetalInstance.console",
        defaultMessage: "Launch Bare Metal Instance Console",
      }),
      total: selectedList.length,
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
      },
    });
    setSelectedList?.([]);
  };

  useEffect(() => {
    if (current?.baremetalPxeServer?.attachedClusterUuids?.length && visible) {
      let vncUrl = `http://${window.location.hostname}:8090/vnc_lite.html?path=${current.uuid}/websockify?token=${current.uuid}`;
      if (
        current?.state === BaremetalInstanceState.Running &&
        current?.status === BaremetalInstanceStatus.Provisioning
      ) {
        vncUrl = `http://${window.location.hostname}:8090/${current.uuid}/vnc_lite.html?path=${current.uuid}/websockify?token=${current.uuid}`;
      } else if (
        current?.state === BaremetalInstanceState.Running &&
        current?.status === BaremetalInstanceStatus.Provisioned
      ) {
        vncUrl = `http://${window.location.hostname}:8090/${current.uuid}/`;
      }
      window.open(vncUrl);
      setVisible(false);
      onOk();
    }
  }, [current, visible]);

  return current?.baremetalPxeServer?.attachedClusterUuids?.length === 0 ? (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "baremetalInstance.modal.title.confirm.enable.baremetalInstance",
        defaultMessage: "Enable Bare Metal Instance?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      resourceType={intl.formatMessage({
        id: "baremetalInstance",
        defaultMessage: "Bare Metal Instance",
      })}
      onConfirm={() => {
        onOk();
      }}
    />
  ) : null;
};

export default Action;
