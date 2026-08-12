import SelectTag from "@zstack/virtualization-resource/src/pages/tag/components/select-tag/index";
import { TextArea, Form } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import React from "react";
import { useIntl } from "react-intl";

export default function GeneralOptions() {
  const intl = useIntl();
  const { longDescriptionRules } = useValidator(intl);

  return (
    <>
      <Form.Item
        name="description"
        rules={longDescriptionRules}
        label={intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        })}
      >
        <TextArea className="width-320" isShowLimit limit={2000} rows={4} />
      </Form.Item>
      <Form.Item
        name="tags"
        label={intl.formatMessage({
          id: "virtualization.create.instance.config.general.config.tag",
          defaultMessage: "Tag",
        })}
      >
        <SelectTag className="width-320" />
      </Form.Item>
    </>
  );
}
