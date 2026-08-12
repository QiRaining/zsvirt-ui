import { Text } from "@zstack/design";
import { updateVmCustomSpecification } from "@zstack/virtualization-resource/src/gql/vm-spec.gql";
import { ZSVForm, Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmCustomSpecification } from "@zstack/zsphere-types/graphql";
import { isEqual } from "lodash-es";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import ConfigInfoForm from "../components/config-info-form";
import { getVmSpecConfig, getVmSpecPayload } from "../components/utils";

export default function EditConfig({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<VmCustomSpecification>) {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const title = intl.formatMessage({
    id: "edit.config",
    defaultMessage: "Modify Configuration",
  });
  const current = selectedList?.[0];

  const initialValues = useMemo(() => {
    if (!current) {
      return {};
    }
    return {
      name: current.name ?? "",
      description: current.description ?? "",
      vmSpecConfig: getVmSpecConfig(current),
    };
  }, [current]);

  const onOk = (values: any) => {
    if (!current) {
      return;
    }

    const payload: Record<string, any> = {};

    if (values.name !== current.name) {
      payload.name = values.name;
    }

    if (values.description !== (current.description ?? "")) {
      payload.description = values.description;
    }

    if (!isEqual(values.vmSpecConfig, initialValues.vmSpecConfig)) {
      Object.assign(
        payload,
        getVmSpecPayload(current.platform, values.vmSpecConfig),
      );
    }

    if (!Object.keys(payload).length) {
      return;
    }

    payload.uuid = current.uuid;

    doAction({
      mutation: updateVmCustomSpecification,
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
      resourceName={current?.name}
    >
      <Form form={form} initialValues={initialValues}>
        <ZSVForm.Card
          title={intl.formatMessage({
            id: "basic.info",
            defaultMessage: "Basic Info",
          })}
        >
          <ZSVForm.NameAndDesc />
          <Form.Item
            label={intl.formatMessage({
              id: "vm.spec.platform",
              defaultMessage: "Target VM OS",
            })}
          >
            <Text>{current?.platform}</Text>
          </Form.Item>
        </ZSVForm.Card>
        <ZSVForm.Card
          title={intl.formatMessage({
            id: "config.info",
            defaultMessage: "Configurations",
          })}
        >
          <ConfigInfoForm platform={current?.platform} showResetPasswd />
        </ZSVForm.Card>
      </Form>
    </DialogForm>
  );
}
