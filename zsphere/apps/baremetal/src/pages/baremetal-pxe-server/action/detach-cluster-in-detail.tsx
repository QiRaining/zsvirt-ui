import { gql } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { BaremetalPxeServer as IBaremetalPxeServer } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

const detachBaremetalPxeServer = gql`
  mutation ($input: DetachBaremetalPxeServerInput!) {
    detachBaremetalPxeServer(input: $input) {
      actionId
    }
  }
`;

const DetachCluster: React.FC<IActionWrapperProps<IBaremetalPxeServer>> = ({
  visible,
  setVisible,
  refetch,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const onOk = () => {
    const payload = selectedList?.map((item) => ({
      clusterUuid: item.uuid,
      pxeServerUuid: uuid,
    }));

    doAction({
      mutation: detachBaremetalPxeServer,
      payload,
      name: intl.formatMessage({
        id: "detach.baremetal.pxeServer",
        defaultMessage: "Detach Bare Metal Cluster",
      }),
      total: selectedList.length,
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
        setSelectedList?.([]);
        refetch?.();
      },
    });
  };

  return (
    <DialogP1
      onConfirm={() => {
        onOk();
      }}
      visible={visible}
      resourceNames={(selectedList ?? []).map((item) => item.name ?? item.uuid)}
      setVisible={setVisible}
      resourceType={intl.formatMessage({
        id: "baremetalPxeServer.cluster",
        defaultMessage: "Bare Metal Cluster",
      })}
      title={intl.formatMessage({
        id: "baremetalPxeServer.modal.title.confirm.detach.baremetalCluster",
        defaultMessage: "Detach Bare Metal Cluster?",
      })}
      bannerMessage={intl.formatMessage({
        id: "baremetalPxeServer.modal.detach.cluster.alert.danger",
        defaultMessage:
          "Detaching baremetal clusters will expunge the deploying baremetal instances, while the consoles of the deployed baremetal instances cannot be accessed. Exercise caution when performing this operation.",
      })}
    />
  );
};

export default DetachCluster;
