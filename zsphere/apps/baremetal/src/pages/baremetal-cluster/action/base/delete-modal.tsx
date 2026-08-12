import { gql } from "@apollo/client";
import { DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import { sumBy } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import useModalOpenState from "../../../../utils/use-modal-show-state";

const DELETE_CLUSTER = gql`
  mutation deleteCluster($input: DeleteClusterInput!) {
    deleteCluster(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<ICluster>> = ({
  // refetch,
  view: _view,
  position: _position,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const { open, afterClose } = useModalOpenState({ visible });

  //***处理敏感操作***
  const needValidate = useSensitiveJudge();

  const onOk = async () => {
    const payload = selectedList.map((item: ICluster) => {
      return { uuid: item.uuid };
    });
    doAction({
      mutation: DELETE_CLUSTER,
      payload,
      name: intl.formatMessage({
        id: "delete.baremetalCluster",
        defaultMessage: "Delete Bare Metal Cluster",
      }),
      total: selectedList.length,
      type: "Cluster",
      onFinish: () => {
        // refetch?.()
        setSelectedList?.([]);
      },
    });
  };

  if (!open) {
    return null;
  }

  return (
    <DialogP0Smart
      title={intl.formatMessage({
        id: "baremetalCluster.modal.title.confirm.delete.baremetalCluster",
        defaultMessage: "Delete Bare Metal Cluster?",
      })}
      resourceType={intl.formatMessage({
        id: "baremetalCluster",
        defaultMessage: "Bare Metal Cluster",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={() => {
        onOk();
      }}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "baremetalCluster.modal.delete.alert.danger",
            defaultMessage: `Deleting bare metal clusters will delete all bare metal chassis and bare metal instances in the cluster. Proceed with caution.`,
          })}
        </ReactMarkdown>
      }
      needValidate={needValidate}
      afterClose={afterClose}
    />
  );
};

export default Action;
