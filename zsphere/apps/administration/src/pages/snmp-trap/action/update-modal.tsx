import { gql } from "@apollo/client";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  SnmpTrapReceiver,
  UpdateSnmpTrapReceiverPayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { SnmpTrapProtityModel, type ISnmpTrapProtity } from "../create";

const updateSnmpTrapReceiver = gql`
  mutation updateSnmpTrapReceiver($input: UpdateSnmpTrapReceiverInput!) {
    updateSnmpTrapReceiver(input: $input) {
      actionId
    }
  }
`;

const UpdateAction: React.FC<IActionWrapperProps<SnmpTrapReceiver>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async (values: ISnmpTrapProtity) => {
    const payload: UpdateSnmpTrapReceiverPayload = {
      ...values,
      uuid: selectedList?.[0]?.uuid,
    };

    doAction({
      mutation: updateSnmpTrapReceiver,
      payload,
      name: intl.formatMessage({
        id: "modify.snmp.trap",
        defaultMessage: "Modify SNMP Trap Receiver Info",
      }),
      type: "SnmpTrap",
      total: 1,
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };
  return (
    <SnmpTrapProtityModel
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      selectedList={(selectedList ?? []) as ISnmpTrapProtity[]}
      setSelectList={(list) => {
        setSelectedList?.(list as SnmpTrapReceiver[]);
      }}
    />
  );
};

export default UpdateAction;
