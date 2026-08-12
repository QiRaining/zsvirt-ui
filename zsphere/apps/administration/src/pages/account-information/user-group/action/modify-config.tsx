import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { Spinner } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type {
  UserGroup as IUserGroup,
  ZsvRole as IZsvRole,
  VmInstance as IVmInstance,
  L3Network as IL3Network,
  AccountVO as IAccount,
} from "@zstack/zsphere-types/graphql";
import { chunk as _chunk, difference as _difference } from "lodash-es";
import React, { useEffect, useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import ShareResourceConfig from "../../components/share-resource";
import { useQuerySharedResource } from "../../hooks";
import BasicConfig from "../create/basic-config";

interface IProps {
  refetch: any;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  selectedList: IUserGroup[];
  setSelectedList?: any;
  position?: string;
  view?: string;
}

const CHUNKSIZE = 50;

const updateUserGroupConfig = gql`
  mutation updateUserGroupConfig($input: UpdateUserGroupConfigInput!) {
    updateUserGroupConfig(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IProps> = ({
  refetch,
  visible,
  selectedList,
  setSelectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();

  const {
    querySharedResource,
    result: sharedResourceData,
    loading,
  } = useQuerySharedResource({
    type: "userGroup",
    uuid: selectedList?.[0]?.uuid ?? "",
  });

  const querySharedResourceCallback = useCallback(() => {
    if (selectedList?.[0]?.uuid) {
      querySharedResource();
    }
  }, [selectedList?.[0]?.uuid]);

  useEffect(() => {
    if (visible) {
      querySharedResourceCallback();
    } else if (!visible) {
      form.resetFields();
      setSelectedList?.([]);
    }
  }, [visible]);

  const formValuesForGroup = useMemo(() => {
    if (!visible || !sharedResourceData || !selectedList?.[0]) {
      return null;
    }

    const current = selectedList[0];

    const { accountList, zsvRoleList, vmInstanceList, ...restOfData } =
      sharedResourceData;

    return {
      name: current.name,
      description: current.description,
      ...restOfData,
      userList: accountList,
      roleUuids: zsvRoleList.map((role: IZsvRole) => role.uuid),
      vmList: vmInstanceList,
    };
  }, [visible, sharedResourceData, selectedList]);

  useEffect(() => {
    if (formValuesForGroup) {
      setTimeout(() => {
        form.setFieldsValue(formValuesForGroup);
      }, 0);
    }
  }, [formValuesForGroup]);

  const onOk = async (values: any) => {
    const {
      name,
      description,
      userList = [],
      roleUuids = [],
      vmList = [],
      l3NetworkList = [],
    } = values;

    const payload = {
      uuid: selectedList?.[0].uuid,
      name,
      description,
      removeAccountUuids: _difference(
        sharedResourceData.accountList.map((user: IAccount) => user.uuid),
        userList.map((user: IAccount) => user.uuid),
      ),
      addAccountUuids: _difference(
        userList.map((user: IAccount) => user.uuid),
        sharedResourceData.accountList.map((user: IAccount) => user.uuid),
      ),
      removeRoleUuids: _difference(
        sharedResourceData.zsvRoleList.map((role: IZsvRole) => role.uuid),
        roleUuids,
      ),
      addRoleUuids: _difference(
        roleUuids,
        sharedResourceData.zsvRoleList.map((role: IZsvRole) => role.uuid),
      ),
      removeResourceUuids: _chunk(
        _difference(
          [
            ...sharedResourceData.vmInstanceList.map(
              (vm: IVmInstance) => vm.uuid,
            ),
            ...sharedResourceData.l3NetworkList.map(
              (l3Network: IL3Network) => l3Network.uuid,
            ),
          ],
          [
            ...vmList.map((vm: IVmInstance) => vm.uuid),
            ...l3NetworkList.map((l3Network: IL3Network) => l3Network.uuid),
          ],
        ),
        CHUNKSIZE,
      ),
      addResourceUuids: _chunk(
        _difference(
          [
            ...vmList.map((vm: IVmInstance) => vm.uuid),
            ...l3NetworkList.map((l3Network: IL3Network) => l3Network.uuid),
          ],
          [
            ...sharedResourceData.vmInstanceList.map(
              (vm: IVmInstance) => vm.uuid,
            ),
            ...sharedResourceData.l3NetworkList.map(
              (l3Network: IL3Network) => l3Network.uuid,
            ),
          ],
        ),
      ),
    };

    doAction({
      mutation: updateUserGroupConfig,
      type: "UserGroup",
      payload,
      name: intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      }),
      total: 1,
      onFinish: () => {
        refetch?.();
        form.resetFields();
        setSelectedList?.([]);
      },
    });
    setVisible(false);
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
      <Spinner spinning={loading}>
        <Form form={form}>
          <BasicConfig form={form} />
          <ShareResourceConfig form={form} showInfo={true} isGroup={true} />
        </Form>
      </Spinner>
    </DialogForm>
  );
};

export default Action;
