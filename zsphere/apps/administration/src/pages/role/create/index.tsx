import { Form } from "@zstack/zsphere-components";
import { getMenuTree } from "@zstack/zsphere-config";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { FormInstance } from "antd/es/form";
import { forEach as _forEach, chunk as _chunk } from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { useIntl } from "react-intl";

import { createRole } from "../../../gql/role.gql";
import allApis from "../detail/api-auth/configures/apis.json";
import { usePrivilegeBuilder } from "../hooks/use-ui-privilege/use-privilege-builder";
import { useRoleFilterConfig } from "../hooks/use-ui-privilege/use-role-filter-config";
import { transformUiPrivilege } from "../utils";
import AuthConfig from "./auth-config";
import BasicConfig from "./basic-config";
import {
  collectDefaultCheckedKeys,
  collectFilteredMenuTreeKeys,
} from "./collect-default-checked-keys";

export const initialValues = {
  name: "",
  description: "",
  uiPrivilege: {
    uiPrivilege: {},
    checkedKeys: [],
  },
};

const CreateRole: React.FC<IActionWrapperProps<any>> = ({
  visible,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const formRef = React.createRef<FormInstance>();
  const menu = useMemo(() => getMenuTree("root", intl), [intl]);
  const { buildPrivilegeMap } = usePrivilegeBuilder();
  const { filteredMenuKeys } = useRoleFilterConfig();
  const uiPrivilegeForRoleType = buildPrivilegeMap({
    roleUuid: "",
    isSodOrViewer: false,
  });
  const defaultCheckedKeys = useMemo(
    () => collectDefaultCheckedKeys(menu, filteredMenuKeys),
    [menu, filteredMenuKeys],
  );
  const filteredCheckedKeys = useMemo(
    () => collectFilteredMenuTreeKeys(menu, filteredMenuKeys),
    [menu, filteredMenuKeys],
  );

  useEffect(() => {
    if (visible) {
      form.resetFields();
      const privilegeWithDefaults = _forEach(
        structuredClone(uiPrivilegeForRoleType),
        (item) => {
          item.views.forEach((view: any) => {
            view.selected = true;
          });

          item.actions.forEach((action: any) => {
            action.selected = true;
          });
        },
      );

      form.setFields([
        {
          name: "uiPrivilege",
          value: {
            uiPrivilege: privilegeWithDefaults,
            checkedKeys: defaultCheckedKeys,
          },
        },
      ]);
    }
  }, [visible, form, uiPrivilegeForRoleType, defaultCheckedKeys]);

  const submitHandle = (data: any) => {
    const _actions = _chunk(allApis, 500);
    const policies = _actions.map((apiList: any) => ({
      effect: "Allow",
      actions: apiList,
    }));

    const payload = {
      ...data,
      uiPrivilege: transformUiPrivilege(data?.uiPrivilege, filteredCheckedKeys),
      policies,
    };

    try {
      doAction({
        mutation: createRole,
        payload,
        name: intl.formatMessage({
          id: "virtualization.new.role",
          defaultMessage: "New Role",
        }),
        total: 1,
        type: "Role",
      });
    } catch (e) {
      console.error("创建失败", e);
    }
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "virtualization.new.role.title",
        defaultMessage: "New Role",
      })}
      form={form}
      widthClassName="w-150"
      visible={visible}
      setVisible={setVisible}
      onOk={submitHandle}
      onCancel={() => setVisible(false)}
    >
      <Form form={form} ref={formRef} initialValues={initialValues}>
        <BasicConfig />
        <AuthConfig form={form} />
      </Form>
    </DialogForm>
  );
};

export default CreateRole;
