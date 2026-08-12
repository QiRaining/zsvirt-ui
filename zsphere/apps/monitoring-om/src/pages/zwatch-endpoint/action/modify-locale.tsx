import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { SelectField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  EndPoint as IEndPoint,
  UpdateEndpointPayload as IUpdateEndpointPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createModifyEndpointLocaleSchema,
  getEndpointLocaleOptions,
  normalizeEndpointLocale,
  type ModifyEndpointLocaleFormValues,
} from "./schema";

const ActionModal: React.FC<IActionWrapperProps<IEndPoint>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<ModifyEndpointLocaleFormValues>(() => {
    return {
      locale: normalizeEndpointLocale(selectedList?.[0]?.topic?.locale),
    };
  }, [selectedList]);
  const formSchema = useMemo(() => createModifyEndpointLocaleSchema(), []);
  const form = useForm<ModifyEndpointLocaleFormValues>({
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

  const updateSNSApplicationEndpoint = gql`
    mutation updateSNSApplicationEndpoint($input: UpdateEndpointInput!) {
      updateSNSApplicationEndpoint(input: $input) {
        actionId
      }
    }
  `;

  const handleOk = async (value: ModifyEndpointLocaleFormValues) => {
    const payload: IUpdateEndpointPayload = {
      uuid: selectedList?.[0]?.topic?.uuid ?? "",
      locale: value?.locale,
    };
    doAction({
      mutation: updateSNSApplicationEndpoint,
      payload,
      name: intl.formatMessage({
        id: "modify.endpointLocale",
        defaultMessage: "Modify Message Language",
      }),
      total: 1,
      type: "EndPoint",
      onFinish: () => {
        setSelectedList?.([]);
        setVisible(false);
        refetch?.();
      },
    });
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "zwatchEndpoint.modal.title.modify.endpointLocale",
        defaultMessage: "Modify Message Language",
      })}
      alertType="info"
      alertMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "zwatchEndpoint.modal.modify.endpointLocale.alert.info",
            defaultMessage: "The modified message language takes effect in the next alarm message.",
          })}
        </ReactMarkdown>
      }
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={handleOk}
    >
      <Form {...form}>
        <SelectField
          form={form}
          name="locale"
          label={intl.formatMessage({
            id: "endpointLocale",
            defaultMessage: "Message Language",
          })}
          options={getEndpointLocaleOptions(intl)}
          className="w-100"
          required
        />
      </Form>
    </DialogForm>
  );
};

export default ActionModal;
