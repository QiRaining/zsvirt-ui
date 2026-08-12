import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { ThirdPartyAuthVO as IThirdPartyAuth } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  updateAccountThirdPartyAuth,
  updateThirdPartyAuth,
} from "../../../gql/account-third-party-auth.gql";
import { getSsoType } from "../uitls";
import {
  createUpdateThirdPartyAuthSchema,
  type UpdateThirdPartyAuthFormValues,
} from "./schema";

const Action: React.FC<IActionWrapperProps<IThirdPartyAuth>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const current = selectedList?.[0] || {};

  const { isLdapServer, isOIDC } = getSsoType(current);

  const gql = React.useMemo(() => {
    if (isOIDC) {
      return updateAccountThirdPartyAuth;
    }
    if (isLdapServer) {
      return updateThirdPartyAuth;
    }
  }, [isLdapServer, isOIDC]);

  const doAction = useAction();

  const defaultValues = useMemo<UpdateThirdPartyAuthFormValues>(() => {
    const values: UpdateThirdPartyAuthFormValues = {
      name: "",
      description: "",
    };
    if (selectedList?.length) {
      const { name, description } = selectedList[0];
      values.name = name ?? "";
      values.description = description ?? "";
    }
    return values;
  }, [selectedList]);
  const formSchema = useMemo(
    () => createUpdateThirdPartyAuthSchema(intl),
    [intl],
  );
  const form = useForm<UpdateThirdPartyAuthFormValues>({
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

  const onOk = (values: UpdateThirdPartyAuthFormValues) => {
    const { name, description } = values;

    const payload = isLdapServer
      ? { ldapServerUuid: current.uuid, name, description }
      : { uuid: current.uuid, name, description };

    doAction({
      mutation: gql,
      payload,
      name: intl.formatMessage({
        id: "modify.account.3rdPartyAuthServer",
        defaultMessage: "Modify SSO Server Configurations",
      }),
      total: 1,
      onFinish: () => {
        refetch?.();
      },
    });
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "account.3rdPartyAuthentication.modal.title.confirm.edit",
        defaultMessage: "Edit SSO Server",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="name"
            label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
            required
            size="m"
          />
          <TextareaField
            form={form}
            name="description"
            label={intl.formatMessage({
              id: "introduction",
              defaultMessage: "Description",
            })}
            rows={4}
            maxLength={256}
            size="m"
            showCount
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
