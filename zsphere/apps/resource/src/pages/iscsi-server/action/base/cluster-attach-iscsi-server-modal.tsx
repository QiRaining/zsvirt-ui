import { gql } from "@apollo/client";
import ClusterList from "@zstack/virtualization-resource/src/pages/cluster/list";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { ClusterQueryType, Op } from "@zstack/zsphere-types";
import type {
  Cluster as ICluster,
  AttachIscsiServerToClusterPayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

const _attachIscsiServerToClusters = gql`
  mutation attachIscsiServerToClusters(
    $input: AttachIscsiServerToClusterInput!
  ) {
    attachIscsiServerToClusters(input: $input) {
      actionId
    }
  }
`;

const getUuid = <T extends { uuid: string }>(
  selectedList: T[],
  searchParams: URLSearchParams,
) => {
  const uuid = searchParams.get("uuid");

  // 在detail页面
  if (uuid) {
    return uuid;
  }

  // list 页面
  return selectedList?.[0]?.uuid;
};

const AttachClusterList: React.FC<IActionWrapperProps<ICluster>> = ({
  source,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [searchParams] = useSearchParams();
  const iscsiServerUuid =
    source?.current?.uuid || getUuid(selectedList, searchParams);

  const onOk = (cluster: ICluster[]) => {
    const payload: AttachIscsiServerToClusterPayload[] =
      cluster.map(({ uuid }) => ({
        uuid: iscsiServerUuid,
        clusterUuid: uuid,
      })) || [];
    doAction({
      mutation: _attachIscsiServerToClusters,
      payload,
      name: intl.formatMessage({
        id: "attach.cluster",
        defaultMessage: "Attach Cluster",
      }),
      total: payload?.length || 1,
      type: "Cluster",
      onFinish: () => {
        setSelectedList?.([]);
      },
    });

    setVisible(false);
  };

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "select.cluster",
        defaultMessage: "Select Cluster",
      })}
      selectType="checkbox"
      modalWidth={800}
      visible={visible}
      setVisible={setVisible}
      showSelect={false}
      onOk={onOk}
    >
      <ClusterList
        view="select.iscsi.server.attach"
        defaultQuery={{
          type: ClusterQueryType.ISCSIServerAttachableCluster,
          conditions: [
            {
              key: "hypervisorType",
              op: Op.eq,
              value: "KVM",
            },
          ],
          extraConditions: [
            {
              key: "iscsiServerUuid",
              op: Op.eq,
              value: iscsiServerUuid,
            },
          ],
        }}
      />
    </ModalSelect>
  );
};

export default AttachClusterList;
