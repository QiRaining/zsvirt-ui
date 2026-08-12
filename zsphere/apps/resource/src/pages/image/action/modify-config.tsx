import { gql } from "@apollo/client";
import { Form, InputDebounce, Select } from "@zstack/zsphere-components";
import { TextArea } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { ImageMediaType } from "@zstack/zsphere-types";
import type { Image as IImage } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import type { FormInstance } from "antd/es/form";
import { cloneDeep as _cloneDeep } from "lodash-es";
import React, { useCallback, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

const { Item } = Form;
const { Option } = Select;

const imageModifyConfig = gql`
  mutation imageModifyConfig($input: ImageModifyConfigInput!) {
    imageModifyConfig(input: $input) {
      actionId
    }
  }
`;

interface ICommon {
  name: string;
  description?: string;
  mediaType: ImageMediaType;
  format: string;
}

const ModifyConfigModal: React.FC<
  Omit<IActionWrapperProps<IImage>, "view" | "position">
> = ({ visible, setVisible, selectedList = [], setSelectedList }) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const { longDescriptionRules, commonNameRules } = useValidator(intl);

  const initialBasicValues: ICommon = useMemo(() => {
    const {
      name,
      description,
      mediaType,
      format = "",
    } = selectedList?.[0] || {};
    return {
      name,
      description,
      mediaType,
      format,
    };
  }, [selectedList]);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(initialBasicValues);
    }
  }, [visible, initialBasicValues]);

  const formRef = React.createRef<FormInstance>();

  const submitHandle = useCallback(
    async (data) => {
      const { ...updatePayload } = _cloneDeep(data);

      doAction({
        mutation: imageModifyConfig,
        payload: {
          baseUpdate: {
            uuid: selectedList?.[0]?.uuid,
            ...updatePayload,
          },
        },
        name: intl.formatMessage({
          id: "modify.image.config",
          defaultMessage: "Modify Image Configuration",
        }),
        total: 1,
        type: "Image",
        onFinish: () => {
          setVisible(false);
          setSelectedList?.([]);
        },
      });
    },
    [doAction, intl, selectedList],
  );

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "modify.config",
        defaultMessage: "Modify Configuration",
      })}
      form={form}
      widthClassName="w-150"
      visible={visible}
      setVisible={setVisible}
      className=""
      onOk={submitHandle}
      onCancel={() => setVisible(false)}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form
        form={form}
        ref={formRef}
        className={style.form}
        initialValues={initialBasicValues}
      >
        <div className={style.card}>
          <Item
            label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
            name="name"
            rules={commonNameRules}
            required
          >
            <InputDebounce className={style["width-320"]} />
          </Item>
          <Item
            name="description"
            label={intl.formatMessage({
              id: "description",
              defaultMessage: "Description",
            })}
            validateTrigger="onBlur"
            rules={longDescriptionRules}
          >
            <TextArea
              rows={3}
              className={style["width-320"]}
              isShowLimit
              limit={2000}
            />
          </Item>
          <Item
            label={intl.formatMessage({
              id: "imageType",
              defaultMessage: "Image Type",
            })}
          >
            {ImageMediaType.DataVolumeTemplate === selectedList?.[0]?.mediaType
              ? intl.formatMessage({
                  id: "volumeImage",
                  defaultMessage: "Disk Image",
                })
              : intl.formatMessage({
                  id: "systemImage",
                  defaultMessage: "System Image",
                })}
          </Item>
          <Item
            name="format"
            label={intl.formatMessage({
              id: "imageFormat",
              defaultMessage: "Image Format",
            })}
          >
            <Select className={style["width-160"]}>
              <Option value="qcow2">qcow2</Option>
              {ImageMediaType.DataVolumeTemplate !==
                selectedList?.[0]?.mediaType && (
                <Option value="iso">iso</Option>
              )}
              <Option value="raw">raw</Option>
            </Select>
          </Item>
        </div>
      </Form>
    </DialogForm>
  );
};

export default ModifyConfigModal;
