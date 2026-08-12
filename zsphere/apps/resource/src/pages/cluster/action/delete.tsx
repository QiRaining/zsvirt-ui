import { gql } from "@apollo/client";
import { DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Cluster } from "@zstack/zsphere-types/graphql";
import { sumBy } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const deleteCluster = gql`
  mutation deleteCluster($input: DeleteClusterInput!) {
    deleteCluster(input: $input) {
      actionId
    }
  }
`;

export default function Delete({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<Cluster>) {
  const intl = useIntl();
  const doAction = useAction();
  const needValidate = useSensitiveJudge();

  const onOk = async () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid };
    });
    doAction({
      mutation: deleteCluster,
      payload,
      name: intl.formatMessage({
        id: "delete.cluster",
        defaultMessage: "Delete Cluster",
      }),
      total: selectedList.length,
      type: "Cluster",
    });
  };

  return (
    <DialogP0Smart
      title={intl.formatMessage({
        id: "cluster.modal.title.confirm.delete.cluster",
        defaultMessage: "Delete Cluster?",
      })}
      resourceType={intl.formatMessage({
        id: "cluster",
        defaultMessage: "Cluster",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={() => {
        onOk();
      }}
      needValidate={needValidate}
      guide={intl.formatMessage({
        id: "delete",
        defaultMessage: "Delete",
      })}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "virtualization.cluster.modal.delete.alertMessage.danger",
            defaultMessage: `1. Deleting a cluster also deletes all the hosts in this cluster.

2. If the cluster has a local storage attached, you will also delete the virtual machines and snapshots on the hosts of the cluster. Proceed with caution.
          `,
          })}
        </ReactMarkdown>
      }
    />
  );
}
