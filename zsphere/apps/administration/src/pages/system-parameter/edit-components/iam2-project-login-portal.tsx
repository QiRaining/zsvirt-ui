import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  SelectField,
  SwitchField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import * as _ from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { z } from "zod";

export interface IProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  currItem: any;
  ok: (payloadList: UpdateGlobalConfigPayload[], configName?: string) => void;
}

interface FormValues {
  cas: boolean;
  defaultLoginMethod: string;
}

const schema = z.object({
  cas: z.boolean(),
  defaultLoginMethod: z.string(),
});

const IAM2ProjectLoginPortal: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const intl = useIntl();
  const loginMethod = useMemo(() => {
    let value: any = {};
    try {
      value = JSON.parse(String(currItem?.formItem?.value));
    } catch (error) {
      console.log(error);
    }

    return {
      cas: _.get(value, ["cas", "enable"], false),
      defaultLoginMethod: _.get(value, "defaultLoginType", "local-iam2-user"),
    };
  }, [currItem?.formItem?.value]);
  const defaultValues = useMemo<FormValues>(
    () => ({
      cas: loginMethod.cas || false,
      defaultLoginMethod: loginMethod.defaultLoginMethod || "local-iam2-user",
    }),
    [loginMethod],
  );
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const cas = form.watch("cas");
  const selectList = useMemo(
    () => _.get(currItem, ["formItem", "selectList"]) ?? [],
    [currItem],
  );
  const options = useMemo(
    () =>
      selectList
        .filter((it: any) => cas || _.get(it, "value") !== "cas-iam2-user")
        .map((it: any) => ({
          label: it.displayName,
          value: String(it.value),
        })),
    [cas, selectList],
  );

  const onOk = (values: FormValues) => {
    return ok(
      [
        {
          category: currItem?.formItem?.category,
          name: currItem?.formItem?.name,
          value: `{"cas":{"enable":${values.cas},"type":"donghai"},"defaultLoginType":"${values.defaultLoginMethod}"}`,
        },
      ],
      currItem?.name,
    );
  };

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  useEffect(() => {
    if (!cas && form.getValues("defaultLoginMethod") === "cas-iam2-user") {
      form.setValue("defaultLoginMethod", "local-iam2-user", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [cas, form]);

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={currItem?.name}
      form={dialogForm}
      alertMessage={
        currItem?.alertMessage && (
          <ReactMarkdown>{currItem?.alertMessage}</ReactMarkdown>
        )
      }
      alertType="warning"
      onOk={onOk}
    >
      <Form {...form}>
        <FieldStack>
          <SwitchField
            form={form}
            label={intl.formatMessage({
              id: "CAS.certification.switch",
              defaultMessage: "CAS Authentication",
            })}
            name="cas"
            labelTooltip={
              <ReactMarkdown>
                {_.get(currItem, "description", "")}
              </ReactMarkdown>
            }
          />
          <SelectField
            form={form}
            label={intl.formatMessage({
              id: "defaultLoginMethod",
              defaultMessage: "Default Login Method",
            })}
            name="defaultLoginMethod"
            options={options}
            className="w-60"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default IAM2ProjectLoginPortal;
