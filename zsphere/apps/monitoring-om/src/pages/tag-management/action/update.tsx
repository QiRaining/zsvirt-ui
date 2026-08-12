import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sketch } from "@uiw/react-color";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Tag,
} from "@zstack/design";
import {
  FieldStack,
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { Icon } from "@zstack/icon";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Tag as ITag } from "@zstack/zsphere-types/graphql";
import { getThemeColor, formatResourceName } from "@zstack/zsphere-utils";
import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { createUpdateTagSchema, type UpdateTagFormValues } from "./schema";

import style from "./style.module.less";

const updateTag = gql`
  mutation updateTag($input: UpdateTagInput!) {
    updateTag(input: $input) {
      actionId
    }
  }
`;

const mode = "light";
const presetColors = [
  getThemeColor("blue", mode, 500),
  getThemeColor("purple", mode, 500),
  getThemeColor("violet", mode, 500),
  getThemeColor("teal", mode, 500),
  getThemeColor("green", mode, 500),
  getThemeColor("yellow-green", mode, 500),
  getThemeColor("yellow", mode, 500),
  getThemeColor("red", mode, 500),
];

const Action: React.FC<IActionWrapperProps<ITag>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const title = intl.formatMessage({
    id: "virtualization.tag.action.update.modal.title",
    defaultMessage: "Edit Tag",
  });

  const current = React.useMemo(() => selectedList?.[0] ?? {}, [selectedList]);

  const defaultValues = useMemo<UpdateTagFormValues>(
    () => ({
      name: current.name ?? "",
      description: current.description ?? "",
      color: current.color ?? getThemeColor("blue", mode, 500),
    }),
    [current.color, current.description, current.name],
  );
  const formSchema = useMemo(() => createUpdateTagSchema(intl), [intl]);
  const form = useForm<UpdateTagFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const watchedName = form.watch("name");
  const watchedColor = form.watch("color");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (data: UpdateTagFormValues) => {
    const payload = {
      uuid: current.uuid,
      name: data.name,
      description: data.description,
      color: data.color,
    };

    doAction({
      mutation: updateTag,
      payload,
      name: title,
      total: 1,
      type: "Tag",
      onProgress: () => {
        setSelectedList?.([]);
      },
    });
  };
  return (
    <DialogForm
      title={title}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form {...form}>
        <FieldStack>
          <div className="flex flex-row gap-2">
            <div className="mt-[5px] box-border flex h-min w-40 min-w-40 items-center gap-1 text-sm text-neutral-600">
              {intl.formatMessage({
                id: "tag.preview",
                defaultMessage: "Tag Preview",
              })}
            </div>
            <div className="flex min-h-8 w-80 min-w-0 items-center overflow-hidden">
              {watchedName ? (
                <Tag color={watchedColor} className="max-w-full">
                  {watchedName}
                </Tag>
              ) : null}
            </div>
          </div>
          <InputField
            form={form}
            name="name"
            label={intl.formatMessage({
              id: "name",
              defaultMessage: "Name",
            })}
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
            rows={3}
            limit={256}
            size="m"
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem className="flex flex-row gap-2">
                <FormLabel className="mt-[5px] flex">
                  {intl.formatMessage({
                    id: "tag.form.color",
                    defaultMessage: "Color",
                  })}
                </FormLabel>
                <FormControl>
                  <div className={style.colorPickerWrapper}>
                    <div
                      className={style.colorPickerTrigger}
                      onClick={() => setColorPickerOpen(!colorPickerOpen)}
                    >
                      <div
                        className={style.colorPreview}
                        style={{ background: field.value }}
                      />
                      <span className={style.colorHex}>{field.value}</span>
                      <Icon
                        type="arrow-down-fill"
                        className={`${style.colorArrow} ${colorPickerOpen ? style.colorArrowOpen : ""}`}
                      />
                    </div>
                    {colorPickerOpen && (
                      <div className={style.colorPickerPanel}>
                        <Sketch
                          color={field.value}
                          onChange={(color: { hex: string }) => {
                            field.onChange(color.hex);
                          }}
                          presetColors={presetColors}
                          style={{
                            boxShadow: "none",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
