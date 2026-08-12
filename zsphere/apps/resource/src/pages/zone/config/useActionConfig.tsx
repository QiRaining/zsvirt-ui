import { zoneList } from "@zstack/virtualization-resource/src/gql/zone.gql";
import DirListCreate from "@zstack/virtualization-resource/src/pages/directory/action/dir-list-create";
import CreatePrimaryStorage from "@zstack/virtualization-resource/src/pages/primary-storage/create";
import { useActionConfig } from "@zstack/zsphere-engine/src/zone";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import React, { Suspense } from "react";
import { useIntl } from "react-intl";

import CreateBackupStorage from "../../backup-storage/create";
import CreateCluster from "../../cluster/create";
import CreateL2Network from "../../l2-network/create";
import CreateModal from "../action/create-modal";
import DeleteAction from "../action/delete";
import DetachModal from "../action/detach-modal";
import UpdateModal from "../action/update-modal";
import { verifyStop, verifyUninstall } from "../action/validator";

const LazyCreateBaremetalCluster = React.lazy(() =>
  import("zsv_baremetal/baremetal-cluster/action/create-modal").catch(() => ({
    default: () => null,
  })),
);

// Wrap the lazy remote module in a Suspense boundary — otherwise React throws
// "A component suspended while responding to synchronous input" when the action
// menu renders the modal, which is caught by SubAppLayoutErrorBoundary and
// shows the panic fallback page (ZSV-11981).
const CreateBaremetalCluster: React.FC<IActionWrapperProps<IZone>> = (
  props,
) => (
  <Suspense fallback={null}>
    <LazyCreateBaremetalCluster {...props} />
  </Suspense>
);

export default () => {
  const intl = useIntl();
  const config = useActionConfig<IZone>([
    {
      key: "create.zone",
      ActionWrapper: CreateModal,
      autoInjectPreValidator: false,
      primary: true,
    },
    {
      key: "virtualization.create.instance.group",
      ActionWrapper: DirListCreate,
    },
    {
      key: "delete",
      ActionWrapper: DeleteAction,
    },

    {
      key: "uninstall",
      validators: [verifyStop],
      preValidators: [verifyUninstall],
      ActionWrapper: DetachModal,
    },
    {
      key: "edit",
      name: intl.formatMessage({
        id: "virtualization.zone.action.edit",
        defaultMessage: "Edit Name and Description",
      }),
      ActionWrapper: UpdateModal,
    },
    {
      key: "virtualization.add.dataStore",
      ActionWrapper: CreatePrimaryStorage,
    },
    {
      key: "virtualization.create.l2network",
      ActionWrapper: CreateL2Network,
    },
    {
      key: "virtualization.add.imageStore",
      ActionWrapper: CreateBackupStorage,
    },
    {
      key: "virtualization.create.cluster",
      ActionWrapper: CreateCluster,
    },
    {
      key: "virtualization.create.baremetal.clsuter",
      ActionWrapper: CreateBaremetalCluster,
    },
  ]);
  return {
    ...config,
    gql: zoneList,
  };
};
