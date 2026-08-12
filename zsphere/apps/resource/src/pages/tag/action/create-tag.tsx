import { gql, useLazyQuery } from "@apollo/client";
import { Sketch } from "@uiw/react-color";
import { Input, Tag } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { queryTagList } from "@zstack/virtualization-resource/src/gql/tag.gql";
import { TextArea, Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Tag as ITag, TagQueryResp } from "@zstack/zsphere-types/graphql";
import { getThemeColor } from "@zstack/zsphere-utils";
import { reduce } from "lodash-es";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

interface Iprops extends IActionWrapperProps<ITag> {
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
const CreateTags: React.FC<Iprops> = ({
  visible,
  setVisible,
  setSelectedList,
  showCreate,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [currColor, setCurrColor] = useState<string>(
    getThemeColor("blue", mode, 500),
  );
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const { commonDescriptionRules } = useValidator(intl);
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

  useEffect(() => {
    if (visible) {
      query();
    }
  }, [visible]);

  const onOk = async (value: any) => {
    await form.validateFields();

    const payload = {
      name: value.name?.trim(),
      color: currColor,
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
        form={form}
        visible={visible}
        setVisible={setVisible}
        onOk={onOk}
      >
        <Form
          form={form}
          initialValues={{
            name: intl.formatMessage({
              id: "new.tag",
              defaultMessage: "New Tag",
            }),
          }}
        >
          <Form.Item
            noStyle
            shouldUpdate={(prev, current) =>
              prev.color !== current.color || prev.name !== current.name
            }
          >
            {({ getFieldValue }) => {
              return (
                <Form.Item
                  label={intl.formatMessage({
                    id: "tag.preview",
                    defaultMessage: "Tag Preview",
                  })}
                >
                  {getFieldValue("name") && (
                    <Tag color={currColor}>{getFieldValue("name")}</Tag>
                  )}
                </Form.Item>
              );
            }}
          </Form.Item>
          <Form.Item
            name="name"
            label={intl.formatMessage({
              id: "name",
              defaultMessage: "Name",
            })}
            required
            rules={[
              () => ({
                validator(rule, value) {
                  const result = value ? value.trim() : value;
                  if (!result) {
                    return Promise.reject(
                      Error(
                        intl.formatMessage({
                          id: "global.field.validator.input.required",
                          defaultMessage: "This field is required.",
                        }),
                      ),
                    );
                  }

                  const currentTag = `${result}${currColor}`;

                  if (tagListMap[currentTag]) {
                    return Promise.reject(
                      Error(
                        intl.formatMessage({
                          id: "tag.field.name.valid.error.duplicate",
                          defaultMessage: "A label with the same name and color already exists.",
                        }),
                      ),
                    );
                  }

                  if (result.length > 20) {
                    return Promise.reject(
                      Error(
                        intl.formatMessage({
                          id: "tag.form.length.required",
                          defaultMessage: "Tag name cannot exceed 20 characters.",
                        }),
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input className={style["width-320"]} />
          </Form.Item>
          <Form.Item
            name="description"
            label={intl.formatMessage({
              id: "introduction",
              defaultMessage: "Description",
            })}
            rules={commonDescriptionRules}
          >
            <TextArea
              className={style["width-320"]}
              rows={3}
              isShowLimit
              limit={256}
            />
          </Form.Item>
          <Form.Item
            name="color"
            label={intl.formatMessage({
              id: "tag.form.color",
              defaultMessage: "Color",
            })}
          >
            <div className={style.colorPickerWrapper}>
              <div
                className={style.colorPickerTrigger}
                onClick={() => setColorPickerOpen(!colorPickerOpen)}
              >
                <div
                  className={style.colorPreview}
                  style={{ background: currColor }}
                />
                <span className={style.colorHex}>{currColor}</span>
                <Icon
                  type="arrow-down-fill"
                  className={`${style.colorArrow} ${colorPickerOpen ? style.colorArrowOpen : ""}`}
                />
              </div>
              {colorPickerOpen && (
                <div className={style.colorPickerPanel}>
                  <Sketch
                    color={currColor}
                    onChange={(color: { hex: string }) => {
                      setCurrColor(color.hex);
                    }}
                    presetColors={presetColors}
                    style={{
                      boxShadow: "none",
                    }}
                  />
                </div>
              )}
            </div>
          </Form.Item>
        </Form>
      </DialogForm>
    </>
  );
};
export default CreateTags;
