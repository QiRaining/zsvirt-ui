import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  InputUnitField,
  SelectField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import * as _ from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";

import {
  createConditionalDynamicGlobalConfigSchema,
  type DynamicGlobalConfigFormValues,
} from "./schema";

export interface IProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  currItem: any;
  ok: (payloadList: UpdateGlobalConfigPayload[], configName?: string) => void;
}

const DeletionPolicy: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const list = currItem;
  const category = _.get(currItem, ["0", "formItem", "category"], "");
  const deletionPolicy = _.find(
    list,
    (it) => it.key === `${category}.deletionPolicy`,
  );
  const expungePeriod = _.find(
    list,
    (it) => it.key === `${category}.expungePeriod`,
  );
  const policyName = "deletionPolicy";
  const periodName = "expungePeriod";
  const defaultValues = useMemo<DynamicGlobalConfigFormValues>(
    () => ({
      [policyName]: _.get(deletionPolicy, ["formItem", "value"], "Delay"),
      [periodName]: {
        number: "",
        unit: _.get(expungePeriod, ["formItem", "unitList", "0", "value"], ""),
      },
    }),
    [deletionPolicy, expungePeriod],
  );
  const formSchema = useMemo(
    () =>
      createConditionalDynamicGlobalConfigSchema(
        (values) => values[policyName] === "Delay",
        {
          [periodName]: expungePeriod?.formItem?.rules,
        },
      ),
    [expungePeriod?.formItem?.rules],
  );
  const form = useForm<DynamicGlobalConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const policy = form.watch(policyName);
  const options =
    deletionPolicy?.formItem?.selectList?.map((it: any) => ({
      label: it.displayName,
      value: String(it.value),
    })) ?? [];

  const onOk = (values: DynamicGlobalConfigFormValues) => {
    if (values[policyName] === "Delay") {
      ok(
        [
          { category: `${category}`, name: "deletionPolicy", value: "Delay" },
          {
            category: `${category}`,
            name: "expungePeriod",
            value: `${expungePeriod?.formItem?.formatFunction?.(values[periodName])}`,
          },
        ],
        deletionPolicy?.name,
      );
      return;
    }

    ok(
      [
        {
          category: `${category}`,
          name: "deletionPolicy",
          value: `${values[policyName]}`,
        },
      ],
      deletionPolicy?.name,
    );
  };

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={deletionPolicy?.name}
      form={dialogForm}
      alertMessage={
        deletionPolicy?.alertMessage && (
          <ReactMarkdown>{deletionPolicy?.alertMessage}</ReactMarkdown>
        )
      }
      alertType="warning"
      onOk={onOk}
    >
      <Form {...form}>
        <FieldStack>
          <SelectField
            form={form}
            label={deletionPolicy?.name}
            name={policyName}
            labelTooltip={
              <ReactMarkdown>{deletionPolicy?.description}</ReactMarkdown>
            }
            required
            options={options}
            className="w-60"
          />
          {policy === "Delay" ? (
            <InputUnitField
              form={form}
              label=""
              name={periodName}
              unitList={expungePeriod?.formItem?.unitList}
              maxLength={15}
            />
          ) : null}
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default DeletionPolicy;
