import { queryL2Network } from "@zstack/virtualization-resource/src/gql/l2-network.gql";
// shared end
import { verifyCancelShare } from "@zstack/zsphere-components";
import { useActionConfig as _useActionConfig } from "@zstack/zsphere-engine/src/l2-network";
import React from "react";
import { useIntl } from "react-intl";
import CancelShare from "zsv_administration_shared/account-information/action/cancel-share";

const LazyAttachL2NetworkModal = React.lazy(() =>
  import("zsv_baremetal/baremetal-cluster/action/attach-l2-network").catch(
    () => ({ default: () => null }),
  ),
);

const AttachL2NetworkModal: React.FC<any> = (props) => (
  <React.Suspense fallback={null}>
    <LazyAttachL2NetworkModal {...props} />
  </React.Suspense>
);
import SetShareType from "zsv_administration_shared/account-information/action/set-share-type";

import { SetResourceAttribute } from "../../../components/resource-attribute";
import AttachClusterModal from "../action/attach-cluster-modal";
import CreateL3Network from "../action/create-l3-network";
import DeleteModal from "../action/delete-modal";
import DetachClusterModal from "../action/detach-cluster-modal";
import DetachInBaremetalCluster from "../action/detach-in-baremetal-cluster";
// shared start
import ShareResource from "../action/share-resource";
import UpdateModal from "../action/update-modal";
import {
  verifySingleSelect,
  verifyDelete,
  verifyCanDetachCluster,
  verifyCanShare,
  verifyCanDelete,
} from "../action/validator";
import CreateL2Network from "../create";

function useActionConfig() {
  const intl = useIntl();

  const config = _useActionConfig([
    {
      key: "virtualization.create.l2.network",
      autoInjectPreValidator: false,
      ActionWrapper: CreateL2Network,
    },
    {
      key: "virtualization.edit.nameandDescription",
      ActionWrapper: UpdateModal,
    },
    {
      key: "virtualization.create.l3network",
      ActionWrapper: CreateL3Network,
    },
    // 在二层网络 加载集群
    {
      key: "virtualization.attach.cluster",
      preValidators: [verifySingleSelect],
      ActionWrapper: AttachClusterModal,
    },
    // 在二层网络 卸载集群
    {
      key: "virtualization.detach.cluster",
      preValidators: [verifySingleSelect],
      validators: [verifyCanDetachCluster],
      ActionWrapper: DetachClusterModal,
    },
    {
      key: "virtualization.set.shareType",
      validators: [verifyCanShare],
      ActionWrapper: SetShareType,
    },
    {
      key: "virtualization.delete",
      validators: [verifyCanDelete],
      preValidators: [verifyDelete],
      notSupportedModal: {
        title: intl.formatMessage({
          id: "l2network.delete.modal.title.not.support",
          defaultMessage: "Cannot Delete Distributed Switch",
        }),
        alertType: "warning",
        alertMessage: intl.formatMessage({
          id: "l2network.delete.modal.alert.default.port.group",
          defaultMessage: "You cannot delete a default distributed switch.",
        }),
      },
      ActionWrapper: DeleteModal,
    },
    {
      key: "share.resource",
      autoInjectPreValidator: false,
      ActionWrapper: (props) => <ShareResource {...props} />,
    },
    {
      validators: [verifyCancelShare],
      key: "cancel.share",
      ActionWrapper: CancelShare,
    },
    // 在裸金属集群详情页-分布式交换机Tab-加载集群
    {
      key: "attach.in.baremetal.cluster",
      autoInjectPreValidator: false,
      ActionWrapper: AttachL2NetworkModal,
    },
    // 在裸金属集群详情页-分布式交换机Tab-卸载集群
    {
      key: "detach.in.baremetal.cluster",
      ActionWrapper: DetachInBaremetalCluster,
    },
    {
      key: "virtualization.set.resource.attribute",
      ActionWrapper: SetResourceAttribute,
    },
  ]);
  return { ...config, gql: queryL2Network };
}

export default useActionConfig;
