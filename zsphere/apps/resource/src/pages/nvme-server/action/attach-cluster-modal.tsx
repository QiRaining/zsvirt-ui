import { gql } from "@apollo/client";
import ClusterList from "@zstack/virtualization-resource/src/pages/cluster/list";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import { ClusterQueryType, Op } from "@zstack/zsphere-types";
import type {
  NvmeServer as INvmeServer,
  Cluster as ICluster,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

const attachNvmeServerToClusters = gql`
  mutation attachNvmeServerToClusters($input: AttachNvmeServerToClusterInput!) {
    attachNvmeServerToClusters(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<INvmeServer>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
  source,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async (values: any) => {
    setVisible(false);
    doAction({
      mutation: attachNvmeServerToClusters,
      payload: values?.map((it: ICluster) => {
        return {
          clusterUuid: it.uuid,
          uuid: selectedList?.[0]?.uuid || source?.uuid,
        };
      }),
      name: intl.formatMessage({
        id: "attach.cluster",
        defaultMessage: "Attach Cluster",
      }),
      total: 1,
      type: "NvmeServer",
      onFinish: () => {
        refetch?.();
      },
    });
  };

  const clusterDefaultQuery: IQuery = useMemo(() => {
    const defaultQuery: IQuery = {
      type: ClusterQueryType.NvmeServerAttachableCluster,
      conditions: [
        {
          key: "hypervisorType",
          op: Op.in,
          values: ["KVM", "baremetal2"],
        },
      ],
      extraConditions: [
        {
          key: "nvmeServerUuid",
          op: Op.eq,
          value: selectedList?.[0]?.uuid || source?.uuid,
        },
      ],
    };

    return defaultQuery;
  }, [selectedList, source]);

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "select.cluster",
        defaultMessage: "Select Cluster",
      })}
      showSelect={false}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      selectType="checkbox"
    >
      <ClusterList
        view="select.iscsi.server"
        defaultQuery={clusterDefaultQuery}
      />
    </ModalSelect>
  );
};

export default Action;
