import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";

type IValues = Record<string, any>;
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  AccountVO as IAccount,
  VmInstance as IVmInstance,
  Image as IImage,
  VmTemplate as IVmTemplate,
  L2Network as IL2Network,
  L3Network as IL3Network,
} from "@zstack/zsphere-types/graphql";
import type { FormInstance } from "antd/es/form";
import _ from "lodash-es";
import React, { useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import { createUserGroup } from "../../../../gql/user-group.gql";
import ShareResourceConfig from "../../components/share-resource";
import BasicConfig from "./basic-config";

export const initialBasicValues = {
  name: "",
  description: "",
};

const CHUNKSIZE = 50;

const CreateUserGroup: React.FC<IActionWrapperProps<any>> = ({
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
    async (values: IValues) => {
      const {
        name,
        description,
        roleUuids = [],
        userList = [],
        vmList = [],
        vmTemplateList = [],
        l2NetworkList = [],
        l3NetworkList = [],
        imageList = [],
      } = values;

      const payload = {
        name,
        description,
        roleUuids,
        accountUuids: userList.map((user: IAccount) => user.uuid),
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
          mutation: createUserGroup,
          payload,
          name: intl.formatMessage({
            id: "virtualization.new.user.group",
            defaultMessage: "New User Group",
          }),
          total: 1,
          type: "UserGroup",
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
        id: "virtualization.new.user.group.title",
        defaultMessage: "New User Group",
      })}
      form={form}
      widthClassName="w-160"
      visible={visible}
      setVisible={setVisible}
      onOk={submitHandle}
      onCancel={() => setVisible(false)}
    >
      <Form form={form} ref={formRef} initialValues={initialBasicValues}>
        <BasicConfig form={form} />
        <ShareResourceConfig form={form} showInfo={true} isGroup={true} />
      </Form>
    </DialogForm>
  );
};

export default CreateUserGroup;
