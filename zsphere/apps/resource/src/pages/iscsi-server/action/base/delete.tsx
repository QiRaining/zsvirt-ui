import { gql, useLazyQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { getIscsiServerSummary } from "@zstack/virtualization-resource/src/gql/iscsi-server.gql";
import { DialogBase, DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  DeleteIscsiServerPayload,
  IscsiServer as IIscsiServer,
  IscsiServerRelateSummary as IIscsiServerRelateSummary,
} from "@zstack/zsphere-types/graphql";
import React, { useState, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const _deleteIscsiServers = gql`
  mutation deleteIscsiServers($input: DeleteIscsiServerInput!) {
    deleteIscsiServers(input: $input) {
      actionId
    }
  }
`;

const DeleteIscsiServer: React.FC<IActionWrapperProps<IIscsiServer>> = ({
  refetch,
  visible,
  setVisible,
  setSelectedList,
  selectedList = [],
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const [nextVisible, setNextVisible] = useState(false);
  //***处理敏感操作***
  const needValidate = useSensitiveJudge();

  const attachedClusterList = selectedList?.filter((item: IIscsiServer) => {
    return item?.iscsiClusterRefs?.length;
  });
  const noAttachedClusterList = selectedList?.filter((item: IIscsiServer) => {
    return !item?.iscsiClusterRefs?.length;
  });

  const [queryResourceCount, { data }] = useLazyQuery<{
    getIscsiServerSummary: IIscsiServerRelateSummary;
  }>(getIscsiServerSummary, {
    fetchPolicy: "network-only",
    variables: {
      uuids: selectedList?.map((item) => item?.uuid),
    },
  });

  useEffect(() => {
    if (visible) {
      queryResourceCount({
        variables: {
          uuids: noAttachedClusterList?.map((item) => item?.uuid),
        },
      });
    }
  }, [visible]);

  const onOk = () => {
    const payload: DeleteIscsiServerPayload[] = noAttachedClusterList.map(
      ({ uuid }) => ({
        uuid,
      }),
    );
    doAction({
      mutation: _deleteIscsiServers,
      payload,
      name: intl.formatMessage({
        id: "delete.iscsiServerStorage",
        defaultMessage: "Delete iSCSI Storage",
      }),
      total: noAttachedClusterList?.length || 1,
      type: "IscsiServer",

      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
    setVisible?.(false);
    setNextVisible(false);
  };

  // 无法删除提示，无"跳过并继续"
  const NoNextModalActionTips = (
    <DialogBase
      visible={visible}
      setVisible={setVisible}
      title={String(
        intl.formatMessage({
          id: "iscsiStorage.title.modal.cannot.delete.iscsiStorage",
          defaultMessage: "Cannot Delete iSCSI Storage",
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
        id: "iscsiServerStorage.modal.delete.alert.info",
        defaultMessage: "Detach clusters from the iSCSI storage before the deletion.",
      })}
    </DialogBase>
  );

  // 无法删除提示，有"跳过并继续"
  const WithNextModalActionTips = (
    <DialogBase
      visible={visible}
      setVisible={setVisible}
      title={String(
        intl.formatMessage({
          id: "hint",
          defaultMessage: "Notice",
        }),
      )}
      footer={
        <>
          <Button key="back" variant="link" onClick={() => setVisible(false)}>
            {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
          </Button>
          <Button
            key="submit"
            variant="primary"
            onClick={() => setNextVisible(true)}
          >
            {intl.formatMessage({
              id: "skipAndContinue",
              defaultMessage: "Skip and Continue",
            })}
          </Button>
        </>
      }
    >
      {intl.formatMessage({
        id: "iscsiServerStorage.modal.cannot.delete.alert.danger",
        defaultMessage: "Detach clusters from the iSCSI storage before the deletion.",
      })}
    </DialogBase>
  );

  const linkedResourceMessage = useMemo(() => {
    return intl.formatMessage(
      {
        id: "iSCSIServerLinkedresource",
        defaultMessage: "{vmInstanceCount} VMs and {volumeCount} disks",
      },

      {
        vmInstanceCount: data?.getIscsiServerSummary?.vmInstanceCount || 0,
        volumeCount: data?.getIscsiServerSummary?.volumeCount || 0,
      },
    );
  }, [data]);

  // 直接删除弹窗
  const DeleteModalAction = (
    <DialogP0Smart
      visible={visible}
      setVisible={setVisible}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "iSCSIServer.modal.delete.alert.danger",
            defaultMessage: `1. If LUNs are used as data storage, deleting the iSCSI storage will cause data storage to lose connection.
2. If LUNs are passed through to a virtual machine, deleting the iSCSI storage will pose a risk of data loss.`,
          })}
        </ReactMarkdown>
      }
      title={intl.formatMessage({
        id: "iscsiServer.modal.title.confirm.base.delete.iscsiServer",
        defaultMessage: "Delete iSCSI Storage?",
      })}
      resourceType={intl.formatMessage({
        id: "iscsiServerStorage",
        defaultMessage: "iSCSI Storage",
      })}
      resourceNames={noAttachedClusterList.map((r) => r.name ?? r.uuid)}
      onConfirm={onOk}
      needValidate={needValidate}
    />
  );

  // 下一步 删除弹窗
  const DeleteModalActionCon = (
    <DialogP0Smart
      visible={nextVisible}
      setVisible={setNextVisible}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "iSCSIServer.modal.delete.alert.danger",
            defaultMessage: `1. If LUNs are used as data storage, deleting the iSCSI storage will cause data storage to lose connection.
2. If LUNs are passed through to a virtual machine, deleting the iSCSI storage will pose a risk of data loss.`,
          })}
        </ReactMarkdown>
      }
      title={intl.formatMessage({
        id: "iscsiServer.modal.title.confirm.base.delete.iscsiServer",
        defaultMessage: "Delete iSCSI Storage?",
      })}
      resourceType={intl.formatMessage({
        id: "iscsiServerStorage",
        defaultMessage: "iSCSI Storage",
      })}
      resourceNames={noAttachedClusterList.map((r) => r.name ?? r.uuid)}
      onConfirm={onOk}
      needValidate={needValidate}
    />
  );

  /**
   * 存在已加载集群的iSCSI存储
   * 1. 提示 -> 确定：无法进行下一步删除操作，所选iSCSI存储都加载了集群
   * 2. 提示 -> 下一步：可以进行下一步删除操作，所选iSCSI存储存在加载集群的
   *
   */
  if (attachedClusterList.length > 0) {
    if (selectedList.length === attachedClusterList.length) {
      return (
        <>
          {NoNextModalActionTips}
          {DeleteModalActionCon}
        </>
      );
    }
    return (
      <>
        {WithNextModalActionTips}
        {DeleteModalActionCon}
      </>
    );
  }
  // 不存在已加载集群的iSCSI存储，可直接删除
  return DeleteModalAction;
};

export default DeleteIscsiServer;
