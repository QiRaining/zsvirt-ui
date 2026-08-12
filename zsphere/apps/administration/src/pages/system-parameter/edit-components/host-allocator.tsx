import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  SwitchField,
  InputUnitField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import { find as _find, get as _get } from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
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

const HostAllocator: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const intl = useIntl();
  const list = currItem;
  const concurrent = _find(
    list,
    (it) => it.key === "hostAllocator.hostAllocator.concurrent",
  );
  const syncLevel = _find(
    list,
    (it) => it.key === "hostAllocator.hostAllocator.concurrent.level",
  );
  const enabledName = "enabled";
  const levelName = "level";
  const defaultValues = useMemo<DynamicGlobalConfigFormValues>(
    () => ({
      [enabledName]:
        _get(concurrent, ["formItem", "value"], "false") === "true",
      [levelName]: { number: "", unit: "" },
    }),
    [concurrent],
  );
  const formSchema = useMemo(
    () =>
      createConditionalDynamicGlobalConfigSchema(
        (values) => Boolean(values[enabledName]),
        {
          [levelName]: _get(syncLevel, ["formItem", "rules"], []),
        },
      ),
    [syncLevel],
  );
  const form = useForm<DynamicGlobalConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const enabled = form.watch(enabledName);
  const disableNonZhLangUnit =
    syncLevel?.formItem?.componentProps?.disableNonZhLangUnit;

  const onOk = (values: DynamicGlobalConfigFormValues) => {
    if (values[enabledName]) {
      ok(
        [
          {
            category: "hostAllocator",
            name: "hostAllocator.concurrent",
            value: "true",
          },
          {
            category: "hostAllocator",
            name: "hostAllocator.concurrent.level",
            value: `${(values[levelName] as { number?: string })?.number}`,
          },
        ],
        concurrent?.name,
      );
      return;
    }

    ok(
      [
        {
          category: "hostAllocator",
          name: "hostAllocator.concurrent",
          value: "false",
        },
      ],
      concurrent?.name,
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
      title={concurrent?.name}
      form={dialogForm}
      alertMessage={
        concurrent?.alertMessage && (
          <ReactMarkdown>{concurrent?.alertMessage}</ReactMarkdown>
        )
      }
      alertType="warning"
      onOk={onOk}
    >
      <Form {...form}>
        <FieldStack>
          <SwitchField
            form={form}
            label={concurrent?.name}
            name={enabledName}
            required
            labelTooltip={
              <ReactMarkdown>{concurrent?.description}</ReactMarkdown>
            }
          />
          {enabled ? (
            <InputUnitField
              form={form}
              label={intl.formatMessage({
                id: "concurrentQuantity",
                defaultMessage: "Concurrent Allocations",
              })}
              name={levelName}
              required
              suffix={
                disableNonZhLangUnit && intl.locale !== "zh-CN" ? null : (
                  <span className="ml-2">
                    {intl.formatMessage({
                      id: "count.ge",
                      defaultMessage: " ",
                    })}
                  </span>
                )
              }
              maxLength={15}
            />
          ) : null}
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default HostAllocator;
