import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  UsbDevice as IUsbDevice,
  // ActionSendResp as IActionSendResp,
  // UpdateUsbInput as IInput
} from "@zstack/zsphere-types/graphql";
import type React from "react";
import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { createModifyUsbNameSchema, type ModifyUsbNameValues } from "./schema";

const updateUsbDevice = gql`
  mutation updateUsbDevice($input: UpdateUsbDeviceInput!) {
    updateUsbDevice(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IUsbDevice>> = ({
  visible,
  selectedList,
  setSelectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<ModifyUsbNameValues>(
    () => ({
      name: selectedList?.[0]?.name ?? "",
    }),
    [selectedList],
  );
  const formSchema = useMemo(() => createModifyUsbNameSchema(intl), [intl]);
  const form = useForm<ModifyUsbNameValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);
  const onOk = async (values: ModifyUsbNameValues) => {
    const payload = selectedList.map((it) => {
      return {
        ...values,
        uuid: it.uuid,
      };
    });
    doAction({
      mutation: updateUsbDevice,
      payload,
      name: intl.formatMessage({
        id: "modify.device.name",
        defaultMessage: "Edit Device Name",
      }),
      total: selectedList.length,
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
        // refetch?.()
      },
    });
    setVisible(false);
    setSelectedList?.([]);
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "modify.device.name",
        defaultMessage: "Edit Device Name",
      })}
    >
      <Form {...form}>
        <InputField
          form={form}
          name="name"
          label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
          required
          size="m"
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
