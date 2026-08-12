import { RadioGroup } from "@zstack/design";
import { ImageType } from "@zstack/virtualization-resource/src/pages/image/type/image-type";
import {
  AuthHander,
  Form,
  Select,
  TextArea,
  useAuth,
} from "@zstack/zsphere-components";
import { InputDebounce } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { ResourceQueryType } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

const { Item } = Form;
const { Option } = Select;

interface IProps {
  form: any;
}

const BasicPart: React.FC<IProps> = () => {
  const intl = useIntl();
  const { longDescriptionRules, commonNameRules, validatorUniqName } =
    useValidator(intl);

  const { hasAuth } = useAuth();
  const volumeImageAuth = {
    type: "block" as const,
    resource: "image",
    authKey: "volume.image",
  };

  return (
    <div className={style.card}>
      <div className={style.title}>
        <div className={style.rect} />
        <div className={style.text}>
          {intl.formatMessage({ id: "basic.info", defaultMessage: "Basic Info" })}
        </div>
      </div>
      <Item
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        name="name"
        rules={[
          ...commonNameRules,
          validatorUniqName(
            ResourceQueryType.Image,
            undefined,
            intl.formatMessage({
              id: "image.field.name.validator.duplicate",
              defaultMessage: "This name is already in use. Enter a different name.",
            }),
            true,
          ),
        ]}
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
        name="imageType"
        label={intl.formatMessage({
          id: "imageType",
          defaultMessage: "Image Type",
        })}
      >
        <RadioGroup
          options={[
            {
              value: "system",
              label: intl.formatMessage({
                id: "systemImage",
                defaultMessage: "System Image",
              }),
            },
            ...(hasAuth(volumeImageAuth)
              ? [
                  {
                    value: "volume",
                    label: (
                      <AuthHander {...volumeImageAuth}>
                        {intl.formatMessage({
                          id: "volumeImage",
                          defaultMessage: "Disk Image",
                        })}
                      </AuthHander>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Item>
      <Item
        shouldUpdate={(prev, curr) => prev.imageType !== curr.imageType}
        noStyle
      >
        {({ getFieldValue }) => {
          return (
            <Item
              name="format"
              label={intl.formatMessage({
                id: "imageFormat",
                defaultMessage: "Image Format",
              })}
            >
              <Select className={style["width-160"]}>
                <Option value="qcow2">qcow2</Option>
                {getFieldValue("imageType") === ImageType.system && (
                  <Option value="iso">iso</Option>
                )}
                <Option value="vmdk">vmdk</Option>
                <Option value="raw">raw</Option>
              </Select>
            </Item>
          );
        }}
      </Item>
    </div>
  );
};

export default React.memo(BasicPart);
