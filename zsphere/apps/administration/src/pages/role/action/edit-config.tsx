import { Form } from "@zstack/zsphere-components";
import { getMenuTree } from "@zstack/zsphere-config";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { ZsvRole as IZsvRole } from "@zstack/zsphere-types/graphql";
import type { FormInstance } from "antd/es/form";
import { forEach as _forEach } from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { useIntl } from "react-intl";

import { updateRoleConfig } from "../../../gql/role.gql";
import { initialValues } from "../create";
import AuthConfig from "../create/auth-config";
import BasicConfig from "../create/basic-config";
import { collectFilteredMenuTreeKeys } from "../create/collect-default-checked-keys";
import { usePrivilegeBuilder } from "../hooks/use-ui-privilege/use-privilege-builder";
import { useRoleFilterConfig } from "../hooks/use-ui-privilege/use-role-filter-config";
import { transformUiPrivilege } from "../utils";

interface IProps {
  refetch?: any;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  selectedList: IZsvRole[];
  setSelectedList?: any;
  position?: string;
  view?: string;
}

const Action: React.FC<IProps> = ({
  refetch,
  visible,
  selectedList,
  setSelectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const formRef = React.createRef<FormInstance>();
  const [form] = Form.useForm();
  const doAction = useAction();
  const { buildPrivilegeMap } = usePrivilegeBuilder();
  const current = useMemo(() => selectedList?.[0], [selectedList]);
  const uiPrivilege = useMemo(
    () => JSON.parse(current?.uiPrivilege || "{}"),
    [current?.uiPrivilege],
  );
  const _uiPrivilege = buildPrivilegeMap({
    roleUuid: current?.uuid ?? "",
    isSodOrViewer: false,
  });
  const menu = useMemo(() => getMenuTree("root", intl), [intl]);
  const { filteredMenuKeys } = useRoleFilterConfig(current);
  const filteredCheckedKeys = useMemo(
    () => collectFilteredMenuTreeKeys(menu, filteredMenuKeys),
    [menu, filteredMenuKeys],
  );
  const filteredCheckedKeySet = useMemo(
    () => new Set(filteredCheckedKeys),
    [filteredCheckedKeys],
  );

  useEffect(() => {
    const checkedKeys: string[] = [];

    if (!visible) {
      return;
    }

    const uiPrivilegeCopy = structuredClone(_uiPrivilege);

    _forEach(uiPrivilegeCopy, (value, key) => {
      if (uiPrivilege[key] && !filteredCheckedKeySet.has(key)) {
        checkedKeys.push(key);
      }
      value.views.forEach((view: any, index: number) => {
        uiPrivilegeCopy[key].views[index].selected = !!(
          uiPrivilege[key] && uiPrivilege[key].views.includes(view.key)
        );
      });
      value.actions.forEach((action: any, index: number) => {
        uiPrivilegeCopy[key].actions[index].selected = !!(
          uiPrivilege[key] && uiPrivilege[key].actions.includes(action.key)
        );
      });
    });

    form.setFieldsValue({
      name: current?.name,
      description: current?.description,
      uiPrivilege: {
        uiPrivilege: uiPrivilegeCopy,
        checkedKeys,
      },
    });
  }, [
    visible,
    current,
    _uiPrivilege,
    uiPrivilege,
    filteredCheckedKeySet,
    form,
  ]);

  const onOk = (values: any) => {
    const payload = {
      ...values,
      uiPrivilege: transformUiPrivilege(
        values?.uiPrivilege,
        filteredCheckedKeys,
      ),
      uuid: current?.uuid,
    };
    doAction({
      mutation: updateRoleConfig,
      payload,
      type: "Role",
      name: intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      }),
      total: 1,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogForm
      widthClassName="w-150"
      title={intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      })}
      resourceName={selectedList?.[0]?.name}
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
    >
      <Form form={form} ref={formRef} initialValues={initialValues}>
        <BasicConfig />
        <AuthConfig form={form} />
      </Form>
    </DialogForm>
  );
};

export default Action;
