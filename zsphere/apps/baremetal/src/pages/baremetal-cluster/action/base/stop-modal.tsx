import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const DISABLE_CLUSTER = gql`
  mutation disableCluster($input: ChangeClusterStateInput!) {
    disableCluster(input: $input) {
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
      mutation: DISABLE_CLUSTER,
      payload,
      name: intl.formatMessage({
        id: "disable.baremetalCluster",
        defaultMessage: "Disable Baremetal Cluster",
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

  const alertMessageAlart = (
    <ReactMarkdown>
      {intl.formatMessage({
        id: "baremetalCluster.modal.disable.alert.danger",
        defaultMessage: `Stopping baremetal clusters will stop all of their baremetal chassis. Exercise caution when performing this operation.`,
      })}
    </ReactMarkdown>
  );

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      bannerMessage={alertMessageAlart}
      title={intl.formatMessage({
        id: "baremetalCluster.modal.title.confirm.disable.baremetalCluster",
        defaultMessage: "Disable Bare Metal Cluster?",
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
