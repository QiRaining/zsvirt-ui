import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const ENABLE_CLUSTER = gql`
  mutation enableCluster($input: ChangeClusterStateInput!) {
    enableCluster(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<ICluster>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    const payload = selectedList.map((item: ICluster) => {
      return { uuid: item.uuid };
    });

    doAction({
      mutation: ENABLE_CLUSTER,
      payload,
      name: intl.formatMessage({
        id: "enable.baremetalCluster",
        defaultMessage: "Enable Baremetal Cluster",
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
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "baremetalCluster.modal.title.confirm.enable.baremetalCluster",
        defaultMessage: "Enable Bare Metal Cluster?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      resourceType={intl.formatMessage({
        id: "baremetalCluster",
        defaultMessage: "Bare Metal Cluster",
      })}
      onConfirm={() => {
        onOk();
      }}
    />
  );
};

export default Action;
