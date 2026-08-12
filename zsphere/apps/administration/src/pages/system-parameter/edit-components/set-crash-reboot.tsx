import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@zstack/design";
import { useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createSetCrashRebootSchema,
  type SetCrashRebootFormValues,
} from "./schema";
import type { IProps } from "./select";

import styles from "./style.module.less";

const STYLE_ALIGN_CENTER = { alignItems: "center" } as const;
const STYLE_MARGIN_BOTTOM_0 = { marginBottom: 0 } as const;
const STYLE_INPUT_DURATION = { width: "80px", marginRight: "8px" } as const;
const STYLE_MARGIN_0_8 = { marginBottom: 0, margin: "0 8px" } as const;
const STYLE_INPUT_WIDTH_80 = { width: "80px" } as const;

const SetCrashReboot: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const intl = useIntl();
  const defaultValues = useMemo<SetCrashRebootFormValues>(() => {
    const [durationConfig, timesConfig] = currItem ?? [];
    const durationValue = parseInt(durationConfig?.formItem?.value, 10) / 60;

    return {
      duration: Number.isFinite(durationValue) ? String(durationValue) : "",
      times: String(timesConfig?.formItem?.value ?? ""),
    };
  }, [currItem]);
  const formSchema = useMemo(() => createSetCrashRebootSchema(intl), [intl]);
  const form = useForm<SetCrashRebootFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const onOk = (values: SetCrashRebootFormValues) => {
    return ok(
      [
        {
          category: "vm",
          name: "crash.rebootThreshold.duration",
          value: String(Number(values.duration) * 60),
        },
        {
          category: "vm",
          name: "crash.rebootThreshold.times",
          value: values.times,
        },
      ],
      currItem?.[0]?.name,
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
      title={currItem?.[0]?.name}
      form={dialogForm}
      alertMessage={
        currItem?.alertMessage && (
          <ReactMarkdown>{currItem?.alertMessage}</ReactMarkdown>
        )
      }
      alertType="info"
      onOk={onOk}
    >
      <Form {...form}>
        <FormItem className="flex flex-row gap-2">
          <FormLabel
            required
            className="mt-[5px] flex"
            info={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "globalConfig.vm.crash.rebootThreshold.duration.description",
                  defaultMessage: "none",
                })}
              </ReactMarkdown>
            }
          >
            {currItem?.[0]?.name}
          </FormLabel>
          <div className="flex flex-1 flex-col">
            <div className={styles.flex} style={STYLE_ALIGN_CENTER}>
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem style={STYLE_MARGIN_BOTTOM_0}>
                    <FormControl>
                      <Input {...field} style={STYLE_INPUT_DURATION} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {intl.formatMessage({
                id: "$number.minutes.reboot",
                defaultMessage: "minutes, restart",
              })}
              <FormField
                control={form.control}
                name="times"
                render={({ field }) => (
                  <FormItem style={STYLE_MARGIN_0_8}>
                    <FormControl>
                      <Input {...field} style={STYLE_INPUT_WIDTH_80} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {intl.formatMessage({
                id: "times",
                defaultMessage: " times",
              })}
            </div>
          </div>
        </FormItem>
      </Form>
    </DialogForm>
  );
};

export default SetCrashReboot;
