import { gql } from "@apollo/client";
import { primaryStorageList } from "@zstack/virtualization-resource/src/gql/primary-storage.gql";
import ModifyResourceConfig from "@zstack/virtualization-resource/src/pages/primary-storage/action/modify-resource-config";
import CreatePrimaryStorage from "@zstack/virtualization-resource/src/pages/primary-storage/create";
import { useActionConfig } from "@zstack/zsphere-engine/src/primary-storage";
import type { IOption } from "@zstack/zsphere-engine/src/primary-storage/useActionConfig";
import { useAction } from "@zstack/zsphere-hooks";
import { PrimaryStorageType } from "@zstack/zsphere-types";
import type { PrimaryStorageVO as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import { reduce, get, xor } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { SetResourceAttribute } from "../../../components/resource-attribute";
import ConsistencyCheckModal from "../action/consistency-check-modal";
import DeleteModal from "../action/delete-modal";
import DetachInClusterModal from "../action/detach-in-cluster-modal";
import DisabledModal from "../action/disabled-modal";
import EnterMaintenanceModeModal from "../action/enter-maintenance-mode-modal";
import ModifyCephTokenModal from "../action/modify-ceph-token-modal";
import ReconnectionModal from "../action/reconnection-modal";
import RegisterVmModal from "../action/register-vm-modal";
import UpdateModal from "../action/update-modal";
import {
  verifyStop,
  verifyStart,
  verifySingle,
  verifyMulti,
  verifyMaintenance,
  verifyDetachCluster,
  attachClusterValidator,
  verifyAddDataStorage,
  verifyRegisterVmAttachCluster,
  verifyRegisterVmClusterHasHost,
  verifyRegisterVmType,
  verifyConsistencyCheckType,
  verifyConsistencyCheckAttachCluster,
} from "../action/validator";
import AttachClusterModal from "../action/virtualization-primarystorage-attach-cluster-modal";
import DetachClusterModal from "../action/virtualization-primarystorage-detach-cluster-modal";

const updateAlarmLabel = gql`
  mutation updateAlarmLabel($input: UpdateAlarmLabelInput!) {
    updateAlarmLabel(input: $input) {
      actionId
    }
  }
`;

const enablePrimaryStorageList = gql`
  mutation enablePrimaryStorageList($input: EnablePrimaryStorageInput!) {
    enablePrimaryStorageList(input: $input) {
      actionId
    }
  }
`;

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  const options = useMemo<IOption<IPrimaryStorage>>(
    () => [
      {
        key: "add.data.storage",
        primary: true,
        preValidators: [verifyAddDataStorage],
        autoInjectPreValidator: false,
        ActionWrapper: CreatePrimaryStorage,
        tooltip: ({ source }) => {
          const cluster = source;
          if (cluster?.__typename === "Cluster") {
            const primaryStorageTypeMap = reduce(
              get(cluster, "primaryStorageList", []),
              (obj, ps) => {
                if (ps?.type) {
                  obj[ps?.type] = 1 + (obj[ps?.type] || 0);
                }

                return obj;
              },
              {} as any,
            );

            const localStorageCount = get(
              primaryStorageTypeMap,
              PrimaryStorageType.LocalStorage,
              0,
            );
            const nfsCount = get(
              primaryStorageTypeMap,
              PrimaryStorageType.NFS,
              0,
            );
            const _sharedBlockCount = get(
              primaryStorageTypeMap,
              PrimaryStorageType.SharedBlock,
              0,
            );
            const cephCount = get(
              primaryStorageTypeMap,
              PrimaryStorageType.Ceph,
              0,
            );

            if (localStorageCount === 1 && nfsCount === 1) {
              return intl.formatMessage({
                id: "primaryStorage.action.add.data.storage.oneLocal.oneNfs.tooltip",
                defaultMessage:
                  "This cluster has attached 1 local storage and 1 NFS storage, and does not support attaching any additional data storage.",
              });
            }

            if (localStorageCount === 3 && cephCount === 1) {
              return intl.formatMessage({
                id: "primaryStorage.action.add.data.storage.threeLocal.oneCeph.tooltip",
                defaultMessage:
                  "The cluster has attached three local storage and one ZCE distributed storage. It does not support attaching any additional data storage.",
              });
            }
          }

          return intl.formatMessage({
            id: "primaryStorage.action.add.data.storage.tooltip",
            defaultMessage:
              "The cluster and attached data storage are subject to quantity and type limits. Currently, it does not support attaching new data storage.",
          });
        },
      },
      {
        key: "edit.name.description",
        ActionWrapper: UpdateModal,
      },
      {
        validators: [verifyStart],
        key: "start",
        icon: "play-circle-fill",
        iconStyle: {
          color: "#5ACA49",
        },

        onClick: ({ selectedList, setSelectedList }) => {
          const payload = selectedList.map((item: IPrimaryStorage) => {
            return { uuid: item?.uuid };
          });
          doAction({
            mutation: enablePrimaryStorageList,
            payload,
            name: intl.formatMessage({
              id: "enable.primaryStorage",
              defaultMessage: "Enable Data Storage",
            }),
            total: selectedList.length,
            onFinish: () => {
              setSelectedList?.([]);
            },
          });
        },
      },
      {
        validators: [verifyStop],
        key: "stop",
        icon: "stop-circle-fill",
        iconStyle: {
          color: "#F4454C",
        },
        ActionWrapper: DisabledModal,
      },
      {
        preValidators: [verifyMulti],
        key: "reconnection",
        ActionWrapper: ReconnectionModal,
      },
      {
        preValidators: [verifySingle],
        key: "set.ceph.token",
        description: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "primary.storage.set.ceph.token.action.tooltip",
              defaultMessage: `The token used to access  Distributed Storage  Enterprise.`,
            })}
          </ReactMarkdown>
        ),
        ActionWrapper: ModifyCephTokenModal,
      },
      {
        key: "virtualization.primarystorage.attach.to.cluster",
        preValidators: [attachClusterValidator],
        ActionWrapper: AttachClusterModal,
      },
      {
        key: "virtualization.modify.advanced.config",
        ActionWrapper: ModifyResourceConfig,
      },
      {
        key: "virtualization.detach.from.cluster",
        preValidators: [verifySingle],
        validators: [verifyDetachCluster],
        ActionWrapper: DetachClusterModal,
      },
      {
        preValidators: [verifyMaintenance],
        key: "maintenance",
        ActionWrapper: EnterMaintenanceModeModal,
      },
      {
        key: "consistency.check",
        ActionWrapper: ConsistencyCheckModal,
        validators: [
          verifyConsistencyCheckType,
          verifyConsistencyCheckAttachCluster,
        ],
      },
      {
        key: "register.vm",
        preValidators: [verifySingle],
        validators: [
          verifyRegisterVmType,
          verifyRegisterVmAttachCluster,
          verifyRegisterVmClusterHasHost,
        ],
        ActionWrapper: RegisterVmModal,
      },
      {
        preValidators: [verifyMulti],
        key: "delete",
        ActionWrapper: DeleteModal,
      },
      {
        preValidators: [verifyMulti],
        key: "detach.in.cluster",
        ActionWrapper: DetachInClusterModal,
      },
      {
        key: "detach.alarm",
        preValidators: [verifyMulti],
        onClick: ({ source, selectedList, setSelectedList }) => {
          const labels = source?.labels;
          const key = labels?.[0]?.key;
          const labelUuid = labels[0].uuid;
          const oldValue = labels[0].value;
          const selectedUuids = selectedList?.map((cv) => cv?.uuid);
          const value = xor(oldValue.split("|"), selectedUuids).join("|");
          const payload = {
            uuid: labelUuid,
            key,
            value,
            operator: "Regex",
          };
          doAction({
            mutation: updateAlarmLabel,
            payload,
            name: intl.formatMessage({
              id: "remove.resource",
              defaultMessage: "Remove Resources",
            }),
            total: 1,
            onFinish: () => {
              setSelectedList?.([]);
            },
          });
        },
      },
      {
        key: "virtualization.set.resource.attribute",
        ActionWrapper: SetResourceAttribute,
      },
    ],
    [doAction, intl],
  );

  const config = useActionConfig<IPrimaryStorage>(options);

  // 新增：导出主存储对应的 gql，否者右键某个 tree 资源时不会请求数据，导致弹窗数据为空
  return { ...config, gql: primaryStorageList };
};
