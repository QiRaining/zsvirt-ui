import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { AccountType } from "@zstack/zsphere-types";
import type {
  UserGroup as IUserGroup,
  VmInstance as IVmInstance,
  Image as IImage,
  VmTemplate as IVmTemplate,
  L2Network as IL2Network,
  L3Network as IL3Network,
} from "@zstack/zsphere-types/graphql";
import type { FormInstance } from "antd/es/form";
import sha512 from "crypto-js/sha512";
import _ from "lodash-es";
import React, { useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import { createAccount } from "../../../../gql/account.gql";
import ShareResourceConfig from "../../components/share-resource";
import BasicConfig from "./basic-config";

export const initialBasicValues = {
  name: "",
  description: "",
  type: AccountType.Normal,
};

const CHUNKSIZE = 50;

const CreateUser: React.FC<IActionWrapperProps<any>> = ({
  visible,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();

  const formRef = React.createRef<FormInstance>();

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const submitHandle = useCallback(
    async (values: any) => {
      const {
        name,
        description,
        password,
        type,
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

      const payload = {
        name,
        description,
        type,
        password: sha512(password).toString(),
        roleUuids,
        userGroupUuids: userGroupList.map((user: IUserGroup) => user.uuid),
        resourceUuids: _.chunk(
          [
            ...vmList.map((vm: IVmInstance) => vm.uuid),
            ...vmTemplateList.map((vmTemplate: IVmTemplate) => vmTemplate.uuid),
            ...l2NetworkList.map((l2Network: IL2Network) => l2Network.uuid),
            ...l3NetworkList.map((l3Network: IL3Network) => l3Network.uuid),
            ...imageList.map((image: IImage) => image.uuid),
          ],
          CHUNKSIZE,
        ),
      };

      try {
        doAction({
          mutation: createAccount,
          payload,
          name: intl.formatMessage({
            id: "virtualization.new.user",
            defaultMessage: "New User",
          }),
          total: 1,
          type: "AccountVO",
        });
      } catch (e) {
        console.log("创建失败", e);
      }
    },
    [doAction, intl],
  );

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "virtualization.new.user",
        defaultMessage: "New User",
      })}
      form={form}
      widthClassName="w-160"
      visible={visible}
      setVisible={setVisible}
      onOk={submitHandle}
      onCancel={() => setVisible(false)}
    >
      <Form form={form} ref={formRef} initialValues={initialBasicValues}>
        <BasicConfig isCreate={true} form={form} />
        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) => prev.type !== curr.type}
        >
          {({ getFieldValue }) =>
            getFieldValue("type") === AccountType.Normal ? (
              <ShareResourceConfig form={form} />
            ) : null
          }
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default CreateUser;
