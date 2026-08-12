import { useActionConfig } from "@zstack/zsphere-engine/src/zsv-user-group";
import type { UserGroup as IUserGroup } from "@zstack/zsphere-types/graphql";
import Shared from "zsv_administration_shared/account-information/action/shared.tsx";

import ShareResource from "../../action/batch-share-resource";
import BindRole from "../../action/bind-role";
import Recall from "../../action/recall";
import JoinUserGroup from "../../user/action/join-userGroup";
import RemoveUserGroup from "../../user/action/remove-user-group";
import AddUser from "../action/add-user";
import DeleteUserGroup from "../action/delete-userGroup";
import ModifyConfig from "../action/modify-config";
import CreateUserGroup from "../create";

export default () => {
  const actions = useActionConfig<IUserGroup>([
    {
      key: "create.user.group",
      autoInjectPreValidator: false,
      primary: true,
      ActionWrapper: CreateUserGroup,
    },
    {
      key: "add.user",
      ActionWrapper: AddUser,
    },
    {
      key: "bind.role",
      ActionWrapper: BindRole,
    },
    {
      key: "virtualization.sharedResource",
      ActionWrapper: ShareResource,
    },
    { key: "modifyconfig.zsv", ActionWrapper: ModifyConfig },
    { key: "virtualization.delete", ActionWrapper: DeleteUserGroup },
    {
      key: "share",
      autoInjectPreValidator: false,
      ActionWrapper: Shared,
    },
    {
      key: "recall",
      ActionWrapper: Recall,
    },
    {
      key: "remove.from.user.group",
      ActionWrapper: RemoveUserGroup,
    },
    {
      key: "join.userGroup",
      autoInjectPreValidator: false,
      ActionWrapper: JoinUserGroup,
    },
  ]);

  return actions;
};
