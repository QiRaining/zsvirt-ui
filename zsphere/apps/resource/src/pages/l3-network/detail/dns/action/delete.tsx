import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

interface IDns {
  dns: string;
  l3NetworkUuid?: string;
}

const removeDnsFromL3Network = gql`
  mutation removeDnsFromL3Network($input: RemoveDnsFromL3NetworkInput!) {
    removeDnsFromL3Network(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IDns>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    setVisible(false);
    setSelectedList!([]);
    doAction({
      mutation: removeDnsFromL3Network,
      payload: selectedList.map((item) => {
        return {
          dns: item.dns,
          l3NetworkUuid: item.l3NetworkUuid,
        };
      }),
      type: "Dns",
      name: intl.formatMessage({
        id: "delete.dns",
        defaultMessage: "Delete DNS",
      }),
      total: selectedList.length,

      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP3
      setVisible={setVisible}
      onConfirm={onOk}
      visible={visible}
      title={intl.formatMessage({
        id: "dns.modal.title.confirm.delete.dns",
        defaultMessage: "Delete DNS?",
      })}
      resourceNames={selectedList.map((dns) => dns.dns)}
      resourceType=""
    />
  );
};

export default Action;
