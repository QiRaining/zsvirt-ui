import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { LogServer as ILogServer } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { updateLogServer } from "../../../gql/log-server.gql";
import {
  createUpdateLogServerSchema,
  parseLogServerLabelValue,
  type UpdateLogServerFormValues,
} from "./schema";

const Action: React.FC<IActionWrapperProps<ILogServer>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const selectedLogServer = selectedList?.[0];

  const defaultValues = useMemo<UpdateLogServerFormValues>(() => {
    const parsedValues = parseLogServerLabelValue(
      selectedLogServer?.labelValue,
    );

    return {
      name: selectedLogServer?.name ?? "",
      description: selectedLogServer?.description ?? parsedValues.description,
    };
  }, [selectedLogServer]);
  const formSchema = useMemo(() => createUpdateLogServerSchema(intl), [intl]);
  const form = useForm<UpdateLogServerFormValues>({
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

  const onOk = (values: UpdateLogServerFormValues) => {
    if (!selectedLogServer) {
      return;
    }

    doAction({
      mutation: updateLogServer,
      payload: {
        uuid: selectedLogServer.uuid,
        name: values.name.trim(),
        description: values.description.trim(),
      },
      name: intl.formatMessage({
        id: "modify.log.server",
        defaultMessage: "Modify Log Server",
      }),
      total: 1,
      type: "LogServer",
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "edit",
        defaultMessage: "Edit",
      })}
      resourceName={selectedLogServer?.name}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="name"
            label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
            required
            maxLength={128}
            size="m"
            labelClassName="w-28 shrink-0"
          />
          <TextareaField
            form={form}
            name="description"
            label={intl.formatMessage({
              id: "introduction",
              defaultMessage: "Description",
            })}
            rows={3}
            maxLength={2000}
            showCount
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
