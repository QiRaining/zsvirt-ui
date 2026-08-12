import { Icon } from "@zstack/icon";
import { createVmCustomSpecification } from "@zstack/virtualization-resource/src/gql/vm-spec.gql";
import { ZSVForm, Form, Select } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { VmSpecPlatform } from "@zstack/zsphere-types";
import type { VmCustomSpecification } from "@zstack/zsphere-types/graphql";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";

import ConfigInfoForm from "../components/config-info-form";
import { getVmSpecPayload } from "../components/utils";

import style from "./style.module.less";

const STYLE_ICON = { color: "var(--neutral-600)" } as const;
const STYLE_TEXT = { color: "var(--neutral-700)" } as const;

export default function Create({
  visible,
  setVisible,
}: IActionWrapperProps<VmCustomSpecification>) {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const title = intl.formatMessage({
    id: "create.vm.spec",
    defaultMessage: "New VM Specification",
  });

  const onOk = (values: Record<string, any>) => {
    const { name, description, platform, vmSpecConfig } = values;
    const payload: Record<string, any> = {
      name,
      description,
      platform,
      ...getVmSpecPayload(platform, vmSpecConfig),
    };

    doAction({
      mutation: createVmCustomSpecification,
      payload,
      total: 1,
      name: title,
      type: "VmCustomSpecification",
    });
  };

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [form, visible]);

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={title}
      form={form}
      widthClassName="w-150"
      onOk={onOk}
    >
      <Form form={form}>
        <ZSVForm.Card
          title={intl.formatMessage({
            id: "basic.info",
            defaultMessage: "Basic Info",
          })}
        >
          <ZSVForm.NameAndDesc />
          <Form.Item
            name="platform"
            label={intl.formatMessage({
              id: "vm.spec.platform",
              defaultMessage: "Target VM OS",
            })}
            initialValue={VmSpecPlatform.Windows}
          >
            <Select className="width-240">
              {Object.values(VmSpecPlatform).map((platform) => (
                <Select.Option key={platform} value={platform}>
                  <div className={style.platformOption}>
                    {platform === VmSpecPlatform.Windows ? (
                      <Icon style={STYLE_ICON} type="windows" />
                    ) : (
                      <Icon style={STYLE_ICON} type="linux" />
                    )}
                    <span style={STYLE_TEXT}>{platform}</span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </ZSVForm.Card>
        <ZSVForm.Card
          title={intl.formatMessage({
            id: "config.info",
            defaultMessage: "Configurations",
          })}
        >
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.platform !== curr.platform}
          >
            {({ getFieldValue }) => (
              <ConfigInfoForm platform={getFieldValue("platform")} />
            )}
          </Form.Item>
        </ZSVForm.Card>
      </Form>
    </DialogForm>
  );
}
