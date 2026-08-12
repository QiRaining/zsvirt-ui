import { gql, useLazyQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { Spin } from "@zstack/design";
import { clusterCount } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { DialogBase, DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { ClusterQueryType, Op } from "@zstack/zsphere-types";
import type { NvmeServer as INvmeServer } from "@zstack/zsphere-types/graphql";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const deleteNvmeServer = gql`
  mutation deleteNvmeServer($input: DeleteNvmeServerInput!) {
    deleteNvmeServer(input: $input) {
      actionId
    }
  }
`;

const Delete: React.FC<IActionWrapperProps<INvmeServer>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const needValidate = useSensitiveJudge();
  const [isDataReady, setIsDataReady] = useState<boolean>(false);

  const [getClusterCount, { data, loading }] = useLazyQuery(clusterCount, {
    nextFetchPolicy: "no-cache",
    onCompleted: () => {
      setIsDataReady(true);
    },
  });

  useEffect(() => {
    if (visible && selectedList?.[0]?.uuid) {
      setIsDataReady(false);
      getClusterCount({
        variables: {
          type: ClusterQueryType.GetClusterByNvmeServer,
          conditions: [
            {
              key: "hypervisorType",
              op: Op.eq,
              value: "KVM",
            },
          ],
          extraConditions: [
            {
              key: "nvmeServerUuid",
              op: Op.eq,
              value: selectedList[0].uuid,
            },
          ],
        },
      });
    }
  }, [visible, selectedList?.[0]?.uuid]);

  const onOk = async () => {
    doAction({
      mutation: deleteNvmeServer,
      payload: {
        uuid: selectedList?.[0]?.uuid,
      },
      name: intl.formatMessage({
        id: "delete.nvmeStorage",
        defaultMessage: "Delete NVMe Storage",
      }),
      total: 1,
      onFinish: () => {
        refetch?.();
        setVisible(false);
        setSelectedList?.([]);
      },
    });
  };

  const NoNextModalActionTips = (
    <DialogBase
      visible={visible}
      setVisible={setVisible}
      title={String(
        intl.formatMessage({
          id: "nvme.storage.title.modal.cannot.delete.nvmeStorage",
          defaultMessage: "Cannot Delete NVMe Storage",
        }),
      )}
      footer={
        <Button
          key="submit"
          variant="primary"
          onClick={() => setVisible(false)}
        >
          {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
        </Button>
      }
    >
      {intl.formatMessage({
        id: "nvme.storage.modal.delete.info",
        defaultMessage: "Detach clusters from the NVMe storage before the deletion.",
      })}
    </DialogBase>
  );

  const DeleteModalAction = (
    <DialogP0Smart
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "nvme.storage.modal.delete.alert.danger",
            defaultMessage: `1. If LUN are used as data storage, deleting the NVMe storage will cause the data storage to lose connection.
2. If LUN are passed through to a virtual machine, deleting the NVMe storage will pose a risk of data loss.`,
          })}
        </ReactMarkdown>
      }
      title={intl.formatMessage({
        id: "nvme.storage.modal.title.confirm.delete.",
        defaultMessage: "Delete NVMe Storage?",
      })}
      resourceType={intl.formatMessage({
        id: "neme.storage",
        defaultMessage: "NVMe Storage",
      })}
      resourceNames={(selectedList || []).map((r) => r.name ?? r.uuid)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
      needValidate={needValidate}
    />
  );

  if (!visible) {
    return null;
  }

  if (loading || !isDataReady) {
    return <Spin />;
  }

  return data?.clusterList?.total ? NoNextModalActionTips : DeleteModalAction;
};

export default Delete;
