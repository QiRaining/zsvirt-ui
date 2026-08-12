import { templatedVmInstanceList } from "@zstack/virtualization-resource/src/gql/vm.gql";
import CreateVmByTemplate from "@zstack/virtualization-resource/src/pages/vm/create-vm-by-resource/vm-template";
import { verifyCancelShare } from "@zstack/zsphere-components";
import { useActionConfig } from "@zstack/zsphere-engine/src/vm-template";
import type { VmTemplate as IVmTemplate } from "@zstack/zsphere-types/graphql";
import CancelShare from "zsv_administration_shared/account-information/action/cancel-share";
import SetShareTypeFromNoGroup from "zsv_administration_shared/account-information/action/set-share-type-from-noGroup";

import ChangeOwner from "../action/change-owner";
import ConvertToVm from "../action/conver-to-vm/index";
import DeleteAction from "../action/delete";
import EditConfigFormVm from "../action/edit-config-form-vm/index";
// shared start
import ShareResource from "../action/share-resource";
import UpdateAction from "../action/update";
// shared end

export default () => {
  return {
    ...useActionConfig<IVmTemplate>([
      {
        key: "transform.to.instance",
        ActionWrapper: ConvertToVm,
        autoInjectPreValidator: false,
      },
      {
        key: "delete",
        ActionWrapper: DeleteAction,
      },

      {
        key: "edit",
        ActionWrapper: UpdateAction,
      },
      {
        key: "edit.config",
        ActionWrapper: EditConfigFormVm,
      },
      {
        key: "change.owner",
        ActionWrapper: ChangeOwner,
      },
      {
        key: "create.instance",
        ActionWrapper: CreateVmByTemplate,
      },
      {
        key: "share.resource",
        autoInjectPreValidator: false,
        ActionWrapper: (props) => <ShareResource {...props} />,
      },
      {
        key: "cancel.share",
        validators: [verifyCancelShare],
        ActionWrapper: CancelShare,
      },
      {
        key: "set.share.type",
        ActionWrapper: SetShareTypeFromNoGroup,
      },
    ]),
    gql: templatedVmInstanceList,
  };
};
