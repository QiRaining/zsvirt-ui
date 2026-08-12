import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

import { bindRoles } from "../../../gql/user-group.gql";
import BindRoleConfirmModal from "../components/bind-role-confirm-modal";
import RoleSelect from "../components/role-select";
import { analyzeAccountTypes } from "../utils";

const Action: React.FC<IActionWrapperProps<any>> = ({
  refetch,
  visible,
  selectedList,
  setSelectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();
  const { isUserGroup, allowBindRole, onlyNormalAndThirdParty } =
    analyzeAccountTypes(selectedList);

  const onOk = async (values: any) => {
    setVisible(false);

    const payload = {
      resourceType:
        selectedList?.[0].__typename === "AccountVO" ? "Account" : "UserGroup",
      roleUuids:
        typeof values.roleUuids === "string"
          ? [values?.roleUuids]
          : values?.roleUuids || [],
      resourceUuids: selectedList.map((item) => item.uuid),
    };

    doAction({
      mutation: bindRoles,
      payload,
      name: intl.formatMessage({
        id: "virtualization.bind.role",
        defaultMessage: "Assign Role",
      }),
      total: 1,
      type: "UserGroup",
      onFinish: () => {
        refetch?.();
      },
    });
  };

  if (!allowBindRole && !isUserGroup) {
    return (
      <BindRoleConfirmModal
        visible={visible}
        setVisible={setVisible}
        onOk={() => {
          setVisible(false);
          setSelectedList?.([]);
        }}
        modalConfirmContent={intl.formatMessage({
          id: "bind.role.mixed.content",
          defaultMessage: "To assign roles to multiple users, all selected users must be of the same type.",
        })}
        alertMessage={intl.formatMessage({
          id: "bind.role.mixed.alert",
          defaultMessage: "Cannot Assign Role",
        })}
      />
    );
  }

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "bind.role.title",
        defaultMessage: "Assign Role",
      })}
      resourceName={
        selectedList.length > 1
          ? intl.formatMessage(
              { id: "object.count", defaultMessage: "{num} objects" },
              { num: selectedList.length },
            )
          : selectedList[0]?.name
      }
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
    >
      <Form form={form}>
        <RoleSelect multiple={onlyNormalAndThirdParty || isUserGroup} />
      </Form>
    </DialogForm>
  );
};

export default Action;
