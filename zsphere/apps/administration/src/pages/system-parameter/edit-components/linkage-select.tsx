import { useLazyQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  type SelectOptions,
} from "@zstack/design";
import { useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import * as _ from "lodash-es";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { getCustomCpuMode } from "../../../gql/global-config.gql";
import {
  createLinkageCpuModeSchema,
  type LinkageCpuModeFormValues,
} from "./schema";

export interface IProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  currItem: any;
  ok: (payloadList: UpdateGlobalConfigPayload[], configName?: string) => void;
}

const LinkageSelect: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const intl = useIntl();
  const [getData, { data }] = useLazyQuery(getCustomCpuMode);
  useEffect(() => {
    if (visible) {
      getData();
    }
  }, [getData, visible]);
  const { list = [] } = data?.getCustomCpuMode || {};
  const custom = intl.formatMessage({
    id: "custom.cpuMode",
    defaultMessage: "Custom",
  });
  const defaultOptions: SelectOptions[] = useMemo(
    () => [
      { value: "none", label: "none" },
      { value: "host-model", label: "host-model" },
      {
        value: "host-passthrough",
        label: "host-passthrough",
      },
      {
        value: custom,
        label: custom,
      },
    ],
    [custom],
  );
  const customCpuMode: SelectOptions[] = useMemo(
    () =>
      _.without(
        list as string[],
        ...defaultOptions.map((item) => item.value),
      ).map((cv) => ({ value: cv, label: cv })),
    [defaultOptions, list],
  );

  const defaultFirstSelect = useMemo(() => {
    const value = currItem?.formItem?.value;
    return defaultOptions.some((cv) => cv.value === value) ? value : custom;
  }, [currItem?.formItem?.value, custom, defaultOptions]);

  const [firstSelect, setFirstSelect] = useState(defaultFirstSelect);
  const [secondSelect, setSecondSelect] = useState(currItem?.formItem?.value);
  const defaultValues = useMemo<LinkageCpuModeFormValues>(
    () => ({
      cpuMode:
        firstSelect === custom ? (secondSelect ?? "") : (firstSelect ?? ""),
    }),
    [custom, firstSelect, secondSelect],
  );
  const formSchema = useMemo(() => createLinkageCpuModeSchema(), []);
  const form = useForm<LinkageCpuModeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const onOk = () => {
    return ok(
      [
        {
          category: currItem?.formItem?.category,
          name: currItem?.formItem?.name,
          value: firstSelect === custom ? secondSelect : firstSelect,
        },
      ],
      currItem?.name,
    );
  };

  useEffect(() => {
    if (visible) {
      setFirstSelect(defaultFirstSelect);
      setSecondSelect(currItem?.formItem?.value);
    }
  }, [currItem?.formItem?.value, defaultFirstSelect, visible]);

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const CustomSelect = () => {
    const handleFirstSelect = (value: string) => {
      if (value === custom) {
        setSecondSelect(customCpuMode[0]?.value);
      }
      setFirstSelect(value);
      form.setValue(
        "cpuMode",
        value === custom ? (customCpuMode[0]?.value ?? "") : value,
      );
    };
    const handleSecondSelect = (value: string) => {
      setSecondSelect(value);
      form.setValue("cpuMode", value);
    };

    return (
      <>
        <Select
          value={firstSelect}
          onValueChange={handleFirstSelect}
          options={defaultOptions}
          className="w-40"
        />
        {firstSelect === custom && (
          <Select
            value={secondSelect}
            onValueChange={handleSecondSelect}
            options={customCpuMode}
            className="ml-2 w-40"
          />
        )}
      </>
    );
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "vm.cpuMode",
        defaultMessage: "VM CPU Mode",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      alertMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "globalConfig.kvm.vm.cpuMode.alert",
            defaultMessage: "",
          })}
        </ReactMarkdown>
      }
      alertType="danger"
    >
      <Form {...form}>
        <FormField
          control={form.control}
          name="cpuMode"
          render={() => {
            return (
              <FormItem className="flex flex-row gap-2">
                <FormLabel
                  info={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "vm.field.cpuMode.tooltip",
                        defaultMessage: ``,
                      })}
                    </ReactMarkdown>
                  }
                >
                  {intl.formatMessage({
                    id: "vm.cpuMode",
                    defaultMessage: "VM CPU Mode",
                  })}
                </FormLabel>
                <div className="flex flex-col">
                  <FormControl>
                    <div className="flex">
                      <CustomSelect />
                    </div>
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            );
          }}
        />
      </Form>
    </DialogForm>
  );
};

export default LinkageSelect;
