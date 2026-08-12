import { zodResolver } from "@hookform/resolvers/zod";
import { Form, type SelectOptions } from "@zstack/design";
import {
  FieldStack,
  SelectField,
  SwitchField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createSetCrashStrategySchema,
  getCrashStrategyPayloadValue,
  type SetCrashStrategyFormValues,
} from "./schema";
import type { IProps } from "./select";

const normalizeCrashStrategy = (
  value?: string,
): SetCrashStrategyFormValues["crashStrategy"] => {
  if (value === "Reboot" || value === "Shutdown" || value === "Preserve") {
    return value;
  }

  return "Preserve";
};

const Action: React.FC<IProps> = ({ visible, setVisible, currItem, ok }) => {
  const intl = useIntl();
  const defaultValues = useMemo<SetCrashStrategyFormValues>(() => {
    const crashStrategy = currItem?.formItem?.value ?? "None";

    return {
      faultDetection: crashStrategy !== "None",
      crashStrategy: normalizeCrashStrategy(crashStrategy),
    };
  }, [currItem?.formItem?.value]);
  const formSchema = useMemo(() => createSetCrashStrategySchema(), []);
  const form = useForm<SetCrashStrategyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const faultDetection = form.watch("faultDetection");

  const onOk = (values: SetCrashStrategyFormValues) => {
    return ok(
      [
        {
          category: currItem?.formItem?.category,
          name: currItem?.formItem?.name,
          value: getCrashStrategyPayloadValue(values),
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

  const options = useMemo<SelectOptions[]>(
    () => [
      {
        value: "Preserve",
        label: intl.formatMessage({
          id: "Preserve",
          defaultMessage: "No Action",
        }),
      },
      {
        value: "Reboot",
        label: intl.formatMessage({
          id: "Reboot",
          defaultMessage: "Reboot",
        }),
      },
      {
        value: "Shutdown",
        label: intl.formatMessage({
          id: "Shutdown",
          defaultMessage: "Shutdown",
        }),
      },
    ],
    [intl],
  );

  return (
    <DialogForm
      form={dialogForm}
      setVisible={setVisible}
      visible={visible}
      title={intl.formatMessage({
        id: "set.crash.strategy",
        defaultMessage: "Set Failure Response Policy",
      })}
      onOk={onOk}
      alertType="danger"
      alertMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "vm.action.set.fault.detection.warning",
            defaultMessage: `1. If you modify the error inspection setting, restart the VM instance to make the modification take effect.
2. If you modify the error handling setting, the modification takes effect immediately.`,
          })}
        </ReactMarkdown>
      }
    >
      <Form {...form}>
        <FieldStack>
          <SwitchField
            form={form}
            label={intl.formatMessage({
              id: "fault.detection",
              defaultMessage: "Error Inspection",
            })}
            name="faultDetection"
            labelTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "vm.field.fault.detection.tooltip",
                  defaultMessage: `### Error Inspection
1. If you modify the error inspection setting, restart the VM instance to make the modification take effect.
2. After you enable error inspection, if a VM instance crashes, the system handles the error based on the specified error handling policy. In addition, the VM Crash alarm is triggered.
3. If you enable error inspection for a Linux-based VM instance, the kdump module is disabled after you restart the instance.`,
                })}
              </ReactMarkdown>
            }
            required
          />
          {faultDetection && (
            <SelectField
              form={form}
              label={intl.formatMessage({
                id: "vmCrashStrategy",
                defaultMessage: "Failure Response Policy",
              })}
              name="crashStrategy"
              options={options}
              required
            />
          )}
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
