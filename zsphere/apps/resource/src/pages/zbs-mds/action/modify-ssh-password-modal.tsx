import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  InputPasswordField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { MdsConfigType } from "@zstack/zsphere-types";
import type {
  CbdMds as ICbdMds,
  UpdateCbdMdsPayload as IUpdateCbdMdsPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import {
  createModifyCbdMdsSshPasswordSchema,
  type ModifyCbdMdsSshPasswordFormValues,
} from "./schema";

import style from "./style.module.less";

const updateCbdMds = gql`
  mutation updateCbdMds($input: UpdateCbdMdsInput!) {
    updateCbdMds(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<ICbdMds>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<ModifyCbdMdsSshPasswordFormValues>(
    () => ({
      password: "",
      confirmPassword: "",
    }),
    [],
  );
  const formSchema = useMemo(
    () => createModifyCbdMdsSshPasswordSchema(intl),
    [intl],
  );
  const form = useForm<ModifyCbdMdsSshPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const onOk = async (values: ModifyCbdMdsSshPasswordFormValues) => {
    const payload: IUpdateCbdMdsPayload[] = selectedList?.map((item) => {
      return {
        uuid,
        configType: MdsConfigType.SSH_PASSWORD,
        newConfigValue: values.password,
        mdsAddr: item.addr as string,
      };
    });

    doAction({
      mutation: updateCbdMds,
      payload,
      name: intl.formatMessage({
        id: "change.sshPassword",
        defaultMessage: "Modify SSH Password",
      }),
      total: 1,
      onFinish: () => {
        setSelectedList?.([]);
        refetch?.();
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
        id: "change.sshPassword",
        defaultMessage: "Modify SSH Password",
      })}
    >
      <Form {...form}>
        <FieldStack>
          <InputPasswordField
            form={form}
            name="password"
            label={intl.formatMessage({
              id: "newPassword",
              defaultMessage: "New Password",
            })}
            required
            className={style["width-320"]}
          />
          <InputPasswordField
            form={form}
            name="confirmPassword"
            label={intl.formatMessage({
              id: "confirmPassword",
              defaultMessage: "Confirm Password",
            })}
            required
            className={style["width-320"]}
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
