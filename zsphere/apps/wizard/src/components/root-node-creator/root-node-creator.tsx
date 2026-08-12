import { gql } from "@apollo/client";
import { Input } from "@zstack/design";
import { TextArea, Form } from "@zstack/zsphere-components";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import { ResourceQueryType } from "@zstack/zsphere-types";
import type { ForwardRefRenderFunction } from "react";
import React, { forwardRef, useImperativeHandle } from "react";
import { useIntl } from "react-intl";

import type {
  IWizardFormHandler,
  IWizardFormProps,
} from "../../../src/components/interface";

const CREATE_ZONE = gql`
  mutation createZone($input: CreateZoneInput!) {
    createZone(input: $input) {
      actionId
    }
  }
`;

interface IRootNodeCreatorProps extends IWizardFormProps {}

interface IRootNodeFormValues {
  name: string;
  description: string;
}

const RootNodeCreator: ForwardRefRenderFunction<
  IWizardFormHandler,
  IRootNodeCreatorProps
> = (props, ref) => {
  const { handleTaskFinished } = props;
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();
  const { commonNameRules, commonDescriptionRules, validatorUniqName } =
    useValidator(intl);

  const submit = async () => {
    await form.validateFields();
    form.submit();
  };

  useImperativeHandle(ref, () => ({
    submit,
  }));
  const handleFinish = (values: IRootNodeFormValues) => {
    console.log("values", values);
    doAction({
      mutation: CREATE_ZONE,
      payload: {
        ...values,
      },
      name: intl.formatMessage({
        id: "create.zone",
        defaultMessage: "New Data Center",
      }),
      total: 1,
      type: "Zone",
      onFinish: handleTaskFinished,
    });
  };

  const initialValues = {
    name: "Datacenter-1",
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Form form={form} onFinish={handleFinish} initialValues={initialValues}>
        <Form.Item
          name="name"
          label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
          validateTrigger="onBlur"
          rules={[
            ...commonNameRules,
            validatorUniqName(
              ResourceQueryType.Zone,
              undefined,
              intl.formatMessage({
                id: "zone.name.by.used",
                defaultMessage: "The name is already used by another data center. Enter another name.",
              }),
            ),
          ]}
        >
          <Input className="width-320" />
        </Form.Item>
        <Form.Item
          name="description"
          rules={commonDescriptionRules}
          label={intl.formatMessage({
            id: "description",
            defaultMessage: "Description",
          })}
        >
          <TextArea className="width-320" isShowLimit limit={256} />
        </Form.Item>
      </Form>
    </div>
  );
};

export default forwardRef(RootNodeCreator);
