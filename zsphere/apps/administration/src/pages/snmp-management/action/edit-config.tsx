import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { SnmpAgent } from "@zstack/zsphere-types/graphql";
import { omit as _omit, keys as _keys } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import { Config } from "../create/basic-config";

const updateSnmpAgent = gql`
  mutation updateSnmpAgent($input: UpdateSnmpAgentInput!) {
    updateSnmpAgent(input: $input) {
      actionId
    }
  }
`;

export interface IProps {}

const Action: React.FC<IActionWrapperProps<SnmpAgent> & IProps> = ({
  visible,
  setVisible,
  refetch,
  selectedList,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();

  const title = intl.formatMessage({
    id: "edit.config",
    defaultMessage: "Modify Configuration",
  });

  const current = React.useMemo(() => selectedList?.[0] ?? {}, [selectedList]);

  const initialValues = React.useMemo<any>(
    () => ({
      port: current?.port,
      version: current?.version,
      readCommunity: current?.readCommunity,
      userName: current?.userName,
      authAlgorithmSwitch: !!current?.authAlgorithm,
      authAlgorithm: current?.authAlgorithm,
      privacyAlgorithmSwitch: !!current?.privacyAlgorithm,
      privacyAlgorithm: current?.privacyAlgorithm,
    }),
    [current],
  );

  React.useEffect(() => {
    if (visible) {
      form.setFields(
        _keys(initialValues)
          .filter((key) => initialValues[key])
          .map((key) => ({
            name: key,
            value: initialValues[key],
          })),
      );
    }
  }, [form, initialValues, visible]);

  const onOk = async (value: any) => {
    const payload = _omit(value, [
      "authAlgorithmSwitch",
      "privacyAlgorithmSwitch",
      "confirmAuthPassword",
      "confirmPrivacyPassword",
    ]);

    doAction({
      mutation: updateSnmpAgent,
      payload: {
        ...payload,
        port: +payload.port,
        uuid: current?.uuid,
      },
      type: "SnmpAgent",
      name: title,
      total: 1,
      onFinish: () => {
        refetch?.();
      },
    });
  };

  return (
    <DialogForm
      visible={visible}
      onOk={onOk}
      form={form}
      setVisible={setVisible}
      title={title}
    >
      <Form form={form}>
        <Config form={form} />
      </Form>
    </DialogForm>
  );
};

export default Action;
