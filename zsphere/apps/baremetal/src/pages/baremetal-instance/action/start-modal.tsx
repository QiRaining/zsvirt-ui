import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import {
  BaremetalInstanceStatus,
  BaremetalInstanceState,
} from "@zstack/zsphere-types";
import type { BaremetalInstance as IBaremetalInstance } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { baremetalInstanceList } from "../../../gql/baremetal-instance.gql";
import { useRefresh } from "../hooks/useRefresh";

const startBaremetalInstance = gql`
  mutation startBaremetalInstance($input: StartBaremetalInstanceInput!) {
    startBaremetalInstance(input: $input) {
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
  const { callBack } = useRefresh(
    baremetalInstanceList,
    [{ key: "state", value: BaremetalInstanceState.Running }],
    "baremetalInstanceList",
  );

  const onOk = async () => {
    const payload = selectedList.map((item: IBaremetalInstance) => {
      return {
        uuid: item.uuid,
        pxeBoot: item.status !== BaremetalInstanceStatus.Provisioned,
      };
    });

    const uuidList = selectedList.map((item) => item.uuid);

    doAction({
      mutation: startBaremetalInstance,
      type: "BaremetalInstance",
      payload,
      name: intl.formatMessage({
        id: "start.baremetalInstance",
        defaultMessage: "Enable Bare Metal Instance",
      }),
      total: selectedList.length,
      onProgress: () => {},
      onFinish: () => {
        callBack(uuidList);
      },
    });
    setSelectedList?.([]);
  };

  return (
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
  );
};

export default Action;
