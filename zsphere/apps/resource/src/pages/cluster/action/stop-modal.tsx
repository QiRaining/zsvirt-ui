import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const disableCluster = gql`
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
      mutation: disableCluster,
      payload,
      name: intl.formatMessage({
        id: "disable.cluster",
        defaultMessage: "Disable Cluster",
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

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "cluster.modal.disable.alert.danger",
            defaultMessage: `Disabling a cluster also disables all the hosts in the cluster.`,
          })}
        </ReactMarkdown>
      }
      title={intl.formatMessage({
        id: "cluster.modal.title.confirm.disable.cluster",
        defaultMessage: "Disable Cluster?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      resourceType={intl.formatMessage({
        id: "cluster",
        defaultMessage: "Cluster",
      })}
      onConfirm={() => {
        onOk();
      }}
    />
  );
};

export default Action;
