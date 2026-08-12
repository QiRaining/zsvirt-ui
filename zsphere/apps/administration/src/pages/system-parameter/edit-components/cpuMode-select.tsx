import { useQuery } from "@apollo/client";
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
import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";

import { getCustomCpuMode } from "../../../gql/global-config.gql";
import {
  createCpuModeSelectSchema,
  type CpuModeSelectFormValues,
} from "./schema";

export interface IProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  currItem: any;
  ok: (payloadList: UpdateGlobalConfigPayload[], configName?: string) => void;
}

interface ISelectProps {
  value: string | number;
  displayName: string;
}

const CommonCpuMode = ["none", "host-model", "host-passthrough"];
const STYLE_INLINE_FLEX = { display: "inline-flex" } as const;

const CpuModeSelect: React.FC<IProps> = ({
  visible,
  setVisible,
  currItem,
  ok,
}) => {
  const [firstSelect, setFirstSelect] = useState("none");
  const [secondSelect, setSecondSelect] = useState("");

  const { data } = useQuery(getCustomCpuMode);

  const customList = useMemo(() => {
    return _.difference(
      _.get(data?.getCustomCpuMode, "list", []),
      CommonCpuMode,
    );
  }, [data?.getCustomCpuMode]);
  const selectOptions = useMemo<SelectOptions[]>(
    () =>
      currItem?.formItem?.selectList?.map((it: ISelectProps) => ({
        value: String(it.value),
        label: it.displayName,
      })) ?? [],
    [currItem?.formItem?.selectList],
  );
  const customOptions = useMemo<SelectOptions[]>(
    () => customList?.map((value) => ({ value, label: value })) ?? [],
    [customList],
  );
  const defaultValues = useMemo<CpuModeSelectFormValues>(
    () => ({
      firstSelect,
      secondSelect,
    }),
    [firstSelect, secondSelect],
  );
  const formSchema = useMemo(() => createCpuModeSelectSchema(), []);
  const form = useForm<CpuModeSelectFormValues>({
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
          value: firstSelect === "__custom__" ? secondSelect : firstSelect,
        },
      ],
      currItem?.name,
    );
  };

  useEffect(() => {
    if (visible) {
      if (
        currItem?.formItem?.value &&
        _.includes(CommonCpuMode, currItem?.formItem?.value)
      ) {
        setFirstSelect(currItem?.formItem?.value);
        setSecondSelect("");
      }

      if (
        currItem?.formItem?.value &&
        !_.includes(CommonCpuMode, currItem?.formItem?.value)
      ) {
        setFirstSelect("__custom__");
        setSecondSelect(currItem?.formItem?.value);
      }
    }
  }, [currItem?.formItem?.value, visible]);

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const handleFirstSelect = (value: string) => {
    if (value === "__custom__") {
      setSecondSelect(customList?.[0]);
      form.setValue("secondSelect", customList?.[0] ?? "");
    }
    setFirstSelect(value);
    form.setValue("firstSelect", value);
  };

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
      onOk={() => onOk()}
    >
      <Form {...form}>
        <div style={STYLE_INLINE_FLEX}>
          <FormField
            control={form.control}
            name="firstSelect"
            render={() => (
              <FormItem className="flex flex-row gap-2">
                <FormLabel
                  required
                  info={<ReactMarkdown>{currItem?.description}</ReactMarkdown>}
                >
                  {currItem?.name}
                </FormLabel>
                <div className="flex flex-col">
                  <FormControl>
                    <Select
                      value={firstSelect}
                      onValueChange={handleFirstSelect}
                      options={selectOptions}
                      className="w-40"
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          {firstSelect === "__custom__" ? (
            <FormField
              control={form.control}
              name="secondSelect"
              render={() => (
                <FormItem className="ml-2">
                  <FormControl>
                    <Select
                      value={secondSelect}
                      onValueChange={(value) => {
                        setSecondSelect(value);
                        form.setValue("secondSelect", value);
                      }}
                      options={customOptions}
                      className="w-40"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
        </div>
      </Form>
    </DialogForm>
  );
};

export default CpuModeSelect;
