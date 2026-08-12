import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormItem, FormLabel } from "@zstack/design";
import {
  InputPasswordField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PrimaryStorageVO as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createModifyCephTokenSchema,
  type ModifyCephTokenFormValues,
} from "./schema";

const updateCephToken = gql`
  mutation updateCephToken($input: UpdateCephTokenInput!) {
    updateCephToken(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IPrimaryStorage>> = ({
  visible,
  selectedList,
  setVisible,
  refetch,
}) => {
  const { systemTag } = selectedList?.[0] || {};

  const cephToken = systemTag?.cephToken || "";

  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<ModifyCephTokenFormValues>(
    () => ({
      token: "",
    }),
    [],
  );
  const formSchema = useMemo(() => createModifyCephTokenSchema(intl), [intl]);
  const form = useForm<ModifyCephTokenFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (values: ModifyCephTokenFormValues) => {
    const { token = "" } = values;

    const payload = {
      token,
      uuid: selectedList[0].uuid,
    };
    doAction({
      mutation: updateCephToken,
      payload,
      name: intl.formatMessage({
        id: "change.primaryStorage.enterprise.edition.access.token",
        defaultMessage: "Edit  Distributed Storage  Enterprise Access Token",
      }),
      type: "PrimaryStorageVO",
      total: 1,
      onFinish: () => {
        refetch?.();
      },
    });
  };

  const title = useMemo(() => {
    if (cephToken && cephToken !== "") {
      return intl.formatMessage({
        id: "change.primaryStorage.enterprise.edition.access.token",
        defaultMessage: "Edit  Distributed Storage  Enterprise Access Token",
      });
    }
    return intl.formatMessage({
      id: "change.primaryStorage.enterprise.set.access.token",
      defaultMessage: "Set  Distributed Storage  Enterprise Access Token",
    });
  }, [intl, cephToken]);

  const tokenFieldLabel = useMemo(() => {
    if (cephToken && cephToken !== "") {
      return intl.formatMessage({
        id: "change.primaryStorage.enterprise.new.access.token",
        defaultMessage: "New",
      });
    }
    return intl.formatMessage({
      id: "change.primaryStorage.enterprise.origin.access.token",
      defaultMessage: "Access Token",
    });
  }, [intl, cephToken]);
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={title}
    >
      <Form {...form}>
        <FieldStack>
          {cephToken && (
            <FormItem className="flex flex-row gap-2">
              <FormLabel className="mt-[5px] flex">
                {intl.formatMessage({
                  id: "primaryStorage.enterprise.edition.origin.access.token",
                  defaultMessage: "Current",
                })}
              </FormLabel>
              <div>{Array(8).fill("*").join("")}</div>
            </FormItem>
          )}
          <InputPasswordField
            form={form}
            name="token"
            label={tokenFieldLabel}
            required
            size="m"
            labelTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "primaryStorage.enterprise.edition.access.token.tooltip",
                  defaultMessage: `### Ceph Enterprise Access Token

The token used to access Ceph Enterprise. If you enter the access token, the primary storage can be attached only to elastic baremetal clusters. Unless necessary, we recommend that you do not enter the token.`,
                })}
              </ReactMarkdown>
            }
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
