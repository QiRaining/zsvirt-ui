import { useActionConfig } from "@zstack/zsphere-engine/src/host-group";
import type { IOption } from "@zstack/zsphere-engine/src/host-group/useActionConfig";
import type { HostGroup } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import CreateModal from "../action/create";
import UpdateModal from "../action/edit";
import {
  verifyDelete,
  verifyRemoveHost,
  verifySingleSelect,
} from "../action/validator";

export default () => {
  const intl = useIntl();
  const options: IOption<HostGroup> = [
    {
      key: "create.host.group",
      autoInjectPreValidator: false,
      primary: true,
      ActionWrapper: (props) => {
        const { selectedList, setVisible, visible } = props;
        return (
          <CreateModal
            selectedList={selectedList}
            setVisible={setVisible}
            visible={visible}
          />
        );
      },
    },
    {
      key: "edit",
      name: intl.formatMessage({
        id: "edit.nameAndDescription",
        defaultMessage: "Edit Name and Description",
      }),
      preValidators: [verifySingleSelect],
      ActionWrapper: (props) => <UpdateModal {...props} />,
    },
    {
      key: "add.host",
      preValidators: [verifySingleSelect],
      ActionWrapper: require("../action/add-host").default,
    },
    {
      key: "remove.host",
      validators: [verifyRemoveHost],
      ActionWrapper: require("../action/remove-host").default,
    },
    {
      key: "delete",
      validators: [verifyDelete],
      ActionWrapper: require("../action/delete").default,
    },
  ];
  return useActionConfig<HostGroup>(options);
};
