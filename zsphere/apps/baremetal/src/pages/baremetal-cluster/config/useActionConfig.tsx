import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/baremetal-cluster";
import { useAction } from "@zstack/zsphere-hooks";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import { verifyDelete } from "@zstack/zsphere-utils";
import { useIntl } from "react-intl";
import DetachClusterInSub from "zsv_resource/l2-network/action/detach-cluster-in-sub";
import CreateL2Network from "zsv_resource/l2-network/create";

import AddBaremetalChassis from "../../baremetal-chassis/create";
import AddBaremetalInstance from "../../baremetal-instance/create";
import ConfigPxeServerModal from "../../baremetal-pxe-server/action/create-modal";
import DetachClusterInDetail from "../../baremetal-pxe-server/action/detach-cluster-in-detail";
import AttachL2NetworkModal from "../action/attach-l2-network-modal";
import CreateBaremetalClusterModal from "../action/base/create-modal";
import DeleteBaremetalClusterModal from "../action/base/delete-modal";
import StopBaremetalClusterModal from "../action/base/stop-modal";
import UpdateBaremetalClusterModal from "../action/base/update-modal";
import DetachL2NetworkModal from "../action/detach-l2-network-modal";
import DetachPxeServerModal from "../action/pxe-server/detach";
import {
  canDetachFromL2Network,
  configPxeServer,
  isAttachL2network,
  isAttachPxeServer,
  verifyDisabled,
  verifyEnabled,
} from "../action/validator";

const ENABLE_CLUSTER = gql`
  mutation enableCluster($input: ChangeClusterStateInput!) {
    enableCluster(input: $input) {
      actionId
    }
  }
`;

const RECONNECT_BAREMETAL_PXE_SERVER = gql`
  mutation reconnectBaremetalPxeServer(
    $input: ReconnectBaremetalPxeServerInput!
  ) {
    reconnectBaremetalPxeServer(input: $input) {
      actionId
    }
  }
`;

const QUERY_BAREMETAL_CLUSTER_LIST = gql`
  query queryClusterList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    clusterList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      list {
        name
        uuid
        description
        createDate
        lastOpDate
        clusterKVMCpuModel
        checkCpuModel
        checkCpuModelId
        displayNetworkCidr
        migrateNetworkCidr
        type
        state
        hypervisorType
        isShowDrsTab
        isSupported
        isMaintenanceOfAllHost
        isAttachL2network
        isAttachPrimaryStorage
        isAttachBaremetalPxeServer
        primaryStorageCount
        volumeCount
        baremetalChassisNum
        baremetalInstanceNum
        baremetalPxeServer {
          name
          uuid
          description
          dhcpInterface
          dhcpRangeBegin
          dhcpRangeEnd
          hostname
          storagePath
          availableCapacity
          totalCapacity
          state
          sshPort
          status
          attachedClusterUuids
          createDate
          lastOpDate
        }
        runningVm
        zoneUuid
        zone {
          name
          uuid
        }
        hostList {
          uuid
          name
        }
      }
      total
    }
  }
`;

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  return {
    ...useActionConfig<ICluster>([
      // base part
      {
        key: "create.baremetal.cluster",
        autoInjectPreValidator: false,
        ActionWrapper: CreateBaremetalClusterModal,
      },
      {
        key: "add.baremetal.instance",
        ActionWrapper: AddBaremetalInstance,
      },
      {
        key: "delete",
        preValidators: [verifyDelete],
        ActionWrapper: DeleteBaremetalClusterModal,
      },
      {
        key: "edit",
        ActionWrapper: UpdateBaremetalClusterModal,
      },
      {
        key: "enable",
        validators: [verifyEnabled],
        onClick: ({ selectedList, setSelectedList }) => {
          const payload = selectedList.map((item: ICluster) => {
            return { uuid: item.uuid };
          });
          doAction({
            mutation: ENABLE_CLUSTER,
            payload,
            name: intl.formatMessage({
              id: "enable.baremetalCluster",
              defaultMessage: "Enable Baremetal Cluster",
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
        validators: [verifyDisabled],
        ActionWrapper: StopBaremetalClusterModal,
      },

      // about baremetal.chassis part
      {
        key: "add.baremetal.chassis",
        ActionWrapper: AddBaremetalChassis,
      },

      // about l2 part
      {
        key: "create.l2Network",
        ActionWrapper: CreateL2Network,
      },
      {
        key: "attach.l2network",
        autoInjectPreValidator: false,
        ActionWrapper: AttachL2NetworkModal,
      },
      {
        key: "detach.l2network",
        validators: [isAttachL2network],
        ActionWrapper: DetachL2NetworkModal,
      },
      {
        preValidators: [canDetachFromL2Network],
        key: "detach.in.l2network",
        ActionWrapper: DetachClusterInSub,
      },

      // about baremetal.pxe.server part
      {
        key: "detach.pxe.server",
        validators: [isAttachPxeServer],
        ActionWrapper: DetachPxeServerModal,
      },
      {
        key: "config.pxeServer",
        validators: [configPxeServer],
        ActionWrapper: ConfigPxeServerModal,
      },
      {
        key: "reconnect.pxe.server",
        validators: [isAttachPxeServer],
        onClick: ({ selectedList, setSelectedList }) => {
          doAction({
            mutation: RECONNECT_BAREMETAL_PXE_SERVER,
            payload: selectedList.map((cluster) => ({
              uuid: cluster.uuid,
            })),
            name: intl.formatMessage({
              id: "baremetal.pxe.server.action.reconnect",
              defaultMessage: "Reconnect Deployment Server",
            }),
            total: selectedList.length,
            type: "BaremetalPxeServer",
            onFinish: () => {
              setSelectedList?.([]);
            },
          });
        },
      },
      {
        key: "detach.in.pxe.server",
        ActionWrapper: DetachClusterInDetail,
      },

      // other
    ]),
    gql: QUERY_BAREMETAL_CLUSTER_LIST,
  };
};
