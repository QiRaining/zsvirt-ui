import { gql, useLazyQuery } from "@apollo/client";
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
import type { Tag as ITag, TagQueryResp } from "@zstack/zsphere-types/graphql";
import { getThemeColor } from "@zstack/zsphere-utils";
import { reduce } from "lodash-es";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { createCreateTagSchema, type CreateTagFormValues } from "./schema";

import style from "./style.module.less";

const queryTagList = gql`
  query queryTagList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: TagQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $resourceType: String
    $resourceConditions: [Condition!]
  ) {
    tagList(
      conditions: $conditions
      start: $start
      limit: $limit
      type: $type
      replyWithCount: true
      sortBy: $sortBy
      sortDirection: $sortDirection
      resourceType: $resourceType
      resourceConditions: $resourceConditions
    ) {
      total
      list {
        uuid
        name
        color
        type
        createDate
        value
        lastOpDate
        description
        owner {
          uuid
          type
          name
        }
        resourceCount
      }
    }
  }
`;

interface IProps extends IActionWrapperProps<ITag> {
  showCreate: boolean;
}
const createTag = gql`
  mutation createTag($input: CreateTagInput!) {
    createTag(input: $input) {
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

const CreateTags: React.FC<IProps> = ({
  visible,
  setVisible,
  setSelectedList,
  showCreate,
}) => {
  const intl = useIntl();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const doAction = useAction();

  const [query, { data }] = useLazyQuery<{
    tagList: TagQueryResp;
  }>(queryTagList);

  const tagListMap = useMemo(() => {
    const tagList = data?.tagList?.list ?? [];

    return reduce(
      tagList,
      (obj, tag) => {
        const key = `${tag.name}${tag.color}`;

        if (!obj[key]) {
          obj[key] = tag;
        }

        return obj;
      },
      {} as Record<string, ITag>,
    );
  }, [data]);

  const defaultValues = useMemo<CreateTagFormValues>(
    () => ({
      name: intl.formatMessage({
        id: "new.tag",
        defaultMessage: "New Tag",
      }),
      description: "",
      color: getThemeColor("blue", mode, 500),
    }),
    [intl],
  );
  const tagExists = useCallback(
    (name: string, color: string) => Boolean(tagListMap[`${name}${color}`]),
    [tagListMap],
  );
  const formSchema = useMemo(
    () => createCreateTagSchema(intl, tagExists),
    [intl, tagExists],
  );
  const form = useForm<CreateTagFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const watchedName = form.watch("name");
  const watchedColor = form.watch("color");

  useEffect(() => {
    if (visible) {
      query();
      form.reset(defaultValues);
    }
  }, [defaultValues, form, query, visible]);

  const onOk = async (value: CreateTagFormValues) => {
    const payload = {
      name: value.name.trim(),
      color: value.color,
      value: value.name,
      description: value.description,
    };

    doAction({
      mutation: createTag,
      payload,
      name: intl.formatMessage({
        id: "tag.action.create.tag",
        defaultMessage: "New Tag",
      }),
      total: 1,
      type: "Tag",
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };
  return (
    <>
      {showCreate && (
        <div onClick={() => setVisible(true)} className={style.createTag}>
          <Icon type="plus" />
          {intl.formatMessage({
            id: "tag.modal.title.create",
            defaultMessage: "New Tag",
          })}
        </div>
      )}
      <DialogForm
        title={intl.formatMessage({
          id: "tag.modal.title.create",
          defaultMessage: "New Tag",
        })}
        form={dialogForm}
        visible={visible}
        setVisible={setVisible}
        onOk={onOk}
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
    </>
  );
};
export default CreateTags;
