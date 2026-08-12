import { useActionConfig } from "@zstack/zsphere-engine/src/vm-group";
import type { IOption } from "@zstack/zsphere-engine/src/vm-group/useActionConfig";
import type { VmGroup } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import { verifyDelete, verifySingleSelect } from "../../action/validator";
import CreateModal from "../action/create";

export default () => {
  const intl = useIntl();
  const options: IOption<VmGroup> = [
    {
      key: "create.vm.group",
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
      key: "add.vm",
      preValidators: [verifySingleSelect],
      ActionWrapper: require("../action/add-vm").default,
    },
    {
      key: "remove.vm",
      ActionWrapper: require("../action/remove-vm").default,
    },
    {
      key: "edit",
      name: intl.formatMessage({
        id: "edit.nameAndDescription",
        defaultMessage: "Edit Name and Description",
      }),
      ActionWrapper: require("../action/edit").default,
    },
    {
      key: "delete",
      validators: [verifyDelete],
      ActionWrapper: require("../action/delete").default,
    },
  ];
  return useActionConfig<VmGroup>(options);
};
