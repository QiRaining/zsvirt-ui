import { gql } from "@apollo/client";
import { queryClusterList } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { ETabType } from "@zstack/virtualization-resource/src/pages/cluster/constant";
import AttachClusterToL2NetworkModal from "@zstack/virtualization-resource/src/pages/l2-network/action/attach-cluster-modal";
import { verifyCreateInstance } from "@zstack/virtualization-resource/src/pages/vm/action/validators";
import { useActionConfig as _useActionConfig } from "@zstack/zsphere-engine/src/cluster";
import type { IOption } from "@zstack/zsphere-engine/src/cluster/useActionConfig";
import { useAction } from "@zstack/zsphere-hooks";
import { PrimaryStorageType } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import { get, reduce } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import UpdateClusterModal from "../action/update-modal";
import {
  enabled,
  disabled,
  verifySingle,
  isAttachL2network,
  verifyAddDataStorage,
  canAttachPrimaryStorage,
  canDetachPrimaryStorage,
  canDetachFromL2Network,
  verifyMulti,
  verifyNotSelect,
} from "../action/validator";

export const enableCluster = gql`
  mutation enableCluster($input: ChangeClusterStateInput!) {
    enableCluster(input: $input) {
      actionId
    }
  }
`;

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  const options = React.useMemo<IOption<ICluster>>(
    () => [
      {
        key: "virtualization.create.cluster",
        autoInjectPreValidator: false,
        ActionWrapper: require("../create").default,
      },
      {
        key: "modify.config",
        ActionWrapper: require("../action/modify-config").default,
      },
      {
        key: "edit",
        name: intl.formatMessage({
          id: "virtualization.edit.nameandDescription",
          defaultMessage: "Edit Name and Description",
        }),
        ActionWrapper: (props) => {
          return (
            <UpdateClusterModal
              {...props}
              title={intl.formatMessage({
                id: "virtualization.edit.nameandDescription",
                defaultMessage: "Edit Name and Description",
              })}
            />
          );
        },
      },
      {
        key: "enable",
        icon: "play-circle-fill",
        iconStyle: {
          color: "#5ACA49",
        },
        validators: [enabled],
        onClick: ({ selectedList, setSelectedList }) => {
          const payload = selectedList.map((item: ICluster) => {
            return { uuid: item.uuid };
          });
          doAction({
            mutation: enableCluster,
            payload,
            name: intl.formatMessage({
              id: "enable.cluster",
              defaultMessage: "Enable Cluster",
            }),
            total: selectedList.length,
            onFinish: () => {
              setSelectedList?.([]);
            },
          });
        },
      },
      {
        key: "disable",
        icon: "stop-circle-fill",
        iconStyle: {
          color: "#F4454C",
        },
        validators: [disabled],
        ActionWrapper:
          require("@zstack/virtualization-resource/src/pages/cluster/action/stop-modal")
            .default,
      },
      {
        key: "delete",
        ActionWrapper: require("../action/delete").default,
      },
      {
        key: "create.l3Network",
        ActionWrapper: require("../../l2-network/create").default,
      },
      {
        key: "virtualization.create.instance",
        autoInjectPreValidator: false,
        preValidators: [verifyCreateInstance],
        ActionWrapper: require("../../vm/create/enter-select-modal").default,
      },
      {
        key: "add.dataStorage",
        autoInjectPreValidator: false,
        validators: [verifyAddDataStorage],
        ActionWrapper: require("../../primary-storage/create").default,
        tooltip: ({ selectedList }) => {
          const cluster = selectedList?.[0];
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
            const vhostCount = get(
              primaryStorageTypeMap,
              PrimaryStorageType.Addon,
              0,
            );

            if (localStorageCount === 1 && nfsCount === 1) {
              return intl.formatMessage({
                id: "cluster.action.add.data.storage.oneLocal.oneNfs.tooltip",
                defaultMessage:
                  "This cluster has attached 1 local storage and 1 NFS storage, and does not support attaching any additional data storage.",
              });
            }

            if (localStorageCount === 3 && cephCount === 1) {
              return intl.formatMessage({
                id: "cluster.action.add.data.storage.threeLocal.oneCeph.tooltip",
                defaultMessage:
                  "The cluster has attached three local storage and one ZCE distributed storage. It does not support attaching any additional data storage.",
              });
            }

            if (vhostCount === 1) {
              return intl.formatMessage({
                id: "cluster.action.add.data.storage.oneVhost.tooltip",
                defaultMessage:
                  "This cluster has attached one ZHPS distributed storage and does not support attaching any additional data storage.",
              });
            }
          }

          return intl.formatMessage({
            id: "cluster.action.add.data.storage.tooltip",
            defaultMessage:
              "The cluster and attached data storage are subject to quantity and type limits. Currently, it does not support attaching new data storage.",
          });
        },
      },
      {
        key: "add.host",
        ActionWrapper: require("../../host/action/create").default,
      },
      {
        key: "virtualization.attach.l2.network",
        preValidators: [verifySingle],
        ActionWrapper: require("../action/l2/attach").default,
      },
      {
        key: "virtualization.detach.l2.network",
        preValidators: [verifySingle],
        validators: [isAttachL2network],
        ActionWrapper: require("../action/l2/detach").default,
      },
      {
        autoInjectPreValidator: false,
        key: "attach.in.virtualization.primary.storage",
        ActionWrapper:
          require("@zstack/virtualization-resource/src/pages/primary-storage/action/virtualization-primarystorage-attach-cluster-modal")
            .default,
      },
      {
        preValidators: [verifyMulti],
        key: "detach.in.virtualization.primary.storage",
        ActionWrapper:
          require("@zstack/virtualization-resource/src/pages/cluster/action/primaryStorage/detach-in-primary-storage-modal")
            .default,
      },
      {
        key: "virtualization.attach.primaryStorage",
        preValidators: [verifySingle],
        validators: [canAttachPrimaryStorage],
        ActionWrapper: require("../action/primaryStorage/attach").default,
      },
      {
        key: "virtualization.detach.primaryStorage",
        preValidators: [verifySingle],
        validators: [canDetachPrimaryStorage],
        ActionWrapper: require("../action/primaryStorage/detach").default,
      },
      {
        key: "virtualization.attach.to.l2.network",
        autoInjectPreValidator: false,
        preValidators: [
          (_current, source) =>
            !source?.current?.isDefault || source?.type === ETabType.BAREMETAL,
        ],
        ActionWrapper: (props) => {
          const memoizedSelectedList = useMemo(
            () => [props.source?.current as any],
            [props.source?.current],
          );
          return (
            <AttachClusterToL2NetworkModal
              {...props}
              originSelectedList={memoizedSelectedList}
              selectedList={memoizedSelectedList}
            />
          );
        },
      },
      {
        key: "virtualization.detach.from.l2.network",
        preValidators: [canDetachFromL2Network],
        validators: [
          (_current, source) =>
            !source?.current?.isDefault || source?.type === ETabType.BAREMETAL,
        ],
        ActionWrapper:
          require("@zstack/virtualization-resource/src/pages/l2-network/action/detach-cluster-in-sub")
            .default,
      },
      {
        key: "virtualization.modify.network.setting",
        ActionWrapper:
          require("../detail/resource-config/action/modify-network-setting")
            .default,
      },
      {
        key: "virtualization.modify.resource.config",
        ActionWrapper:
          require("../detail/resource-config/action/modify-resource-config")
            .default,
      },
      {
        key: "virtualization.modify.host.setting",
        ActionWrapper:
          require("../detail/resource-config/action/modify-host-setting")
            .default,
      },
      {
        key: "virtualization.modify.vm.setting",
        ActionWrapper:
          require("../detail/resource-config/action/modify-vm-setting").default,
      },
      {
        key: "virtualization.nvmeServer.attach.cluster",
        autoInjectPreValidator: false,
        ActionWrapper: require("../../nvme-server/action/attach-cluster-modal")
          .default,
      },
      {
        key: "virtualization.nvmeServer.detach.cluster",
        ActionWrapper: require("../../nvme-server/action/detach-cluster-modal")
          .default,
      },
      {
        key: "virtualization.iscsi.server.attach.cluster",
        autoInjectPreValidator: false,
        preValidators: [verifyNotSelect],
        ActionWrapper:
          require("../../iscsi-server/action/base/cluster-attach-iscsi-server-modal")
            .default,
      },
      {
        key: "virtualization.iscsi.server.detach.cluster",
        preValidators: [verifyMulti],
        ActionWrapper:
          require("../../iscsi-server/action/base/cluster-detach-iscsi-server-modal")
            .default,
      },
    ],
    [doAction, intl],
  );

  const config = _useActionConfig<ICluster>(options);

  return { ...config, gql: queryClusterList };
};
