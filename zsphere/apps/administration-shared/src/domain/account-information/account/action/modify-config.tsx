import { gql } from "@apollo/client";
import { Spin, Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { AccountType } from "@zstack/zsphere-types";
import type {
  AccountVO as IAccount,
  ZsvRole as IZsvRole,
  UserGroup as IUserGroup,
  VmInstance as IVmInstance,
  Image as IImage,
  VmTemplate as IVmTemplate,
  L2Network as IL2Network,
  L3Network as IL3Network,
} from "@zstack/zsphere-types/graphql";
import { chunk as _chunk, difference as _difference } from "lodash-es";
import React, { useEffect, useMemo, useCallback } from "react";
import { useIntl } from "react-intl";

import ShareResourceConfig from "../../components/share-resource";
import { useQuerySharedResource } from "../../hooks";
import BasicConfig from "../components/basic-config";

interface IProps {
  refetch: any;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  selectedList: IAccount[];
  setSelectedList?: any;
  position?: string;
  view?: string;
}

const updateAccountConfig = gql`
  mutation updateAccountConfig($input: UpdateAccountConfigInput!) {
    updateAccountConfig(input: $input) {
      actionId
    }
  }
`;

const CHUNKSIZE = 50;

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
    type: "account",
    uuid: selectedList?.[0]?.uuid ?? "",
  });

  const querySharedResourceCallback = useCallback(() => {
    if (selectedList?.[0]?.uuid) {
      querySharedResource();
    }
  }, [selectedList]);

  useEffect(() => {
    if (visible) {
      querySharedResourceCallback();
    } else if (!visible) {
      form.resetFields();
      setSelectedList?.([]);
    }
  }, [visible]);

  const formValuesForUser = useMemo(() => {
    if (!visible || !sharedResourceData || !selectedList?.[0]) {
      return null;
    }

    const current = selectedList[0];

    const {
      vmInstanceList,
      templatedVmInstanceList,
      zsvRoleList,
      ...restOfData
    } = sharedResourceData;

    return {
      name: current.name,
      description: current.description,
      type: current.type,
      ...restOfData,
      vmList: vmInstanceList,
      vmTemplateList: templatedVmInstanceList,
      roleUuids: zsvRoleList.map((role: IZsvRole) => role.uuid),
    };
  }, [visible, sharedResourceData, selectedList]);

  useEffect(() => {
    if (formValuesForUser) {
      setTimeout(() => {
        form.setFieldsValue(formValuesForUser);
      }, 0);
    }
  }, [formValuesForUser]);

  const onOk = async (values: any) => {
    const {
      name,
      description,
      userGroupList = [],
      vmList = [],
      vmTemplateList = [],
      l2NetworkList = [],
      l3NetworkList = [],
      imageList = [],
    } = values;

    const roleUuids: string[] =
      typeof values.roleUuids === "string"
        ? [values?.roleUuids]
        : values?.roleUuids || [];

    const payload: any = {
      uuid: selectedList?.[0].uuid,
      description,
      removeUserGroupUuids: _difference(
        sharedResourceData.userGroupList.map(
          (userGroup: IUserGroup) => userGroup.uuid,
        ),
        userGroupList.map((userGroup: IUserGroup) => userGroup.uuid),
      ),
      addUserGroupUuids: _difference(
        userGroupList.map((userGroup: IUserGroup) => userGroup.uuid),
        sharedResourceData.userGroupList.map(
          (userGroup: IUserGroup) => userGroup.uuid,
        ),
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
            ...sharedResourceData.templatedVmInstanceList.map(
              (vm: IVmTemplate) => vm.uuid,
            ),
            ...sharedResourceData.l2NetworkList.map(
              (l2Network: IL2Network) => l2Network.uuid,
            ),
            ...sharedResourceData.l3NetworkList.map(
              (l3Network: IL3Network) => l3Network.uuid,
            ),
            ...sharedResourceData.imageList.map((image: IImage) => image.uuid),
          ],
          [
            ...vmList.map((vm: IVmInstance) => vm.uuid),
            ...vmTemplateList.map((vm: IVmTemplate) => vm.uuid),
            ...l2NetworkList.map((l2Network: IL2Network) => l2Network.uuid),
            ...l3NetworkList.map((l3Network: IL3Network) => l3Network.uuid),
            ...imageList.map((image: IImage) => image.uuid),
          ],
        ),
        CHUNKSIZE,
      ),
      addResourceUuids: _chunk(
        _difference(
          [
            ...vmList.map((vm: IVmInstance) => vm.uuid),
            ...vmTemplateList.map((vm: IVmTemplate) => vm.uuid),
            ...l2NetworkList.map((l2Network: IL2Network) => l2Network.uuid),
            ...l3NetworkList.map((l3Network: IL3Network) => l3Network.uuid),
            ...imageList.map((image: IImage) => image.uuid),
          ],
          [
            ...sharedResourceData.vmInstanceList.map(
              (vm: IVmInstance) => vm.uuid,
            ),
            ...sharedResourceData.templatedVmInstanceList.map(
              (vm: IVmTemplate) => vm.uuid,
            ),
            ...sharedResourceData.l2NetworkList.map(
              (l2Network: IL2Network) => l2Network.uuid,
            ),
            ...sharedResourceData.l3NetworkList.map(
              (l3Network: IL3Network) => l3Network.uuid,
            ),
            ...sharedResourceData.imageList.map((image: IImage) => image.uuid),
          ],
        ),
      ),
    };

    if (selectedList?.[0]?.name !== name) {
      payload.name = name;
    }

    doAction({
      mutation: updateAccountConfig,
      payload,
      name: intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      }),
      type: "AccountVO",
      total: 1,
      onFinish: () => {
        refetch?.();
        form.resetFields();
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
      form={form}
      visible={visible}
      setVisible={setVisible}
      resourceName={selectedList?.[0]?.name}
      onOk={onOk}
    >
      <Spin spinning={loading}>
        <Form form={form}>
          <BasicConfig form={form} />
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.type !== curr.type}
          >
            {({ getFieldValue }) =>
              getFieldValue("type") !== AccountType.SystemAdmin ? (
                <ShareResourceConfig form={form} />
              ) : null
            }
          </Form.Item>
        </Form>
      </Spin>
    </DialogForm>
  );
};

export default Action;
