import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import { omit as _omit } from "lodash-es";
import React from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import BasicConfig, { VersionType } from "./basic-config";
import { AuthAlgorithmEnum, PrivacyAlgorithmEnum } from "./basic-config";
import {
  createSnmpManagementSchema,
  type CreateSnmpManagementFormValues,
} from "./schema";
import TrapConfig from "./trap-config";

const createSnmpAgent = gql`
  mutation createSnmpAgent($input: CreateSnmpAgentInput!) {
    createSnmpAgent(input: $input) {
      actionId
    }
  }
`;

export const initialBasicValues = {
  version: VersionType.v2c,
  port: 1161,
  authAlgorithmSwitch: false,
  authAlgorithm: AuthAlgorithmEnum.MD5,
  privacyAlgorithmSwitch: false,
  privacyAlgorithm: PrivacyAlgorithmEnum.DES,
  trapList: [],
};

const Create: React.FC<IActionWrapperProps<IZone>> = ({
  visible,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = React.useMemo<CreateSnmpManagementFormValues>(
    () => initialBasicValues,
    [],
  );
  const formSchema = React.useMemo(
    () => createSnmpManagementSchema(intl),
    [intl],
  );
  const form = useForm<CreateSnmpManagementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
    shouldUnregister: true,
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  React.useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const title = intl.formatMessage({
    id: "virtualization.snmp.management.enable.modal.title",
    defaultMessage: "Enable SNMP Management",
  });

  const submitHandle = React.useCallback(
    async (data: CreateSnmpManagementFormValues) => {
      const payload = _omit(data, [
        "authAlgorithmSwitch",
        "privacyAlgorithmSwitch",
        "confirmAuthPassword",
        "confirmPrivacyPassword",
      ]);

      doAction({
        mutation: createSnmpAgent,
        payload: {
          ...payload,
          port: +payload.port,
        },
        name: title,
        total: 1,
        type: "SnmpAgent",
      });
    },
    [doAction, title],
  );

  return (
    <DialogForm
      title={title}
      form={dialogForm}
      widthClassName="w-160"
      visible={visible}
      setVisible={setVisible}
      onOk={submitHandle}
      onCancel={() => setVisible(false)}
    >
      <Form {...form}>
        <BasicConfig form={form} />

        <TrapConfig form={form} />
      </Form>
    </DialogForm>
  );
};

export default Create;
