import { Checkbox } from "@zstack/design";
import ConfigInfoForm from "@zstack/virtualization-resource/src/pages/vm-spec/components/config-info-form";
import { getVmSpecConfig } from "@zstack/virtualization-resource/src/pages/vm-spec/components/utils";
import VmSpecList from "@zstack/virtualization-resource/src/pages/vm-spec/list";
import { ModalSelect, Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { Op } from "@zstack/zsphere-types";
import type { VmCustomSpecification } from "@zstack/zsphere-types/graphql";
import { isEqual } from "lodash-es";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";

// Style constants
const MARGIN_TOP_4_STYLE = { marginTop: 4 } as const;

export interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  originalValue: VmCustomSpecification;
  customConfig?: any;
  onOk: (value: VmCustomSpecification, customConfig?: any) => void;
}

export default function VmSpecModal({
  visible,
  setVisible,
  originalValue,
  customConfig,
  onOk,
}: IProps) {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [vmSpec, setVmSpec] = useState<VmCustomSpecification | null>(null);
  const [showConfig, setShowConfig] = useState(true);

  const initialValues = useMemo(() => {
    if (vmSpec) {
      return { vmSpecConfig: getVmSpecConfig(vmSpec) };
    }
    if (customConfig) {
      return { vmSpecConfig: customConfig };
    }
    return { vmSpecConfig: getVmSpecConfig(originalValue) };
  }, [vmSpec, originalValue, customConfig]);

  const handleSubmit = (values: any) => {
    if (vmSpec) {
      onOk(
        vmSpec,
        showConfig && !isEqual(initialValues.vmSpecConfig, values.vmSpecConfig)
          ? values.vmSpecConfig
          : null,
      );
    } else if (showConfig) {
      onOk(
        originalValue,
        !isEqual(initialValues.vmSpecConfig, values.vmSpecConfig)
          ? values.vmSpecConfig
          : customConfig,
      );
    } else {
      onOk(originalValue, null);
    }
  };

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [form, visible]);

  useEffect(() => {
    if (vmSpec) {
      form.resetFields();
    }
  }, [form, vmSpec]);

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "modify.vm.spec",
        defaultMessage: "Modify VM Specification",
      })}
      form={form}
      widthClassName="w-150"
      onOk={handleSubmit}
      onCancel={() => {
        setVmSpec(null);
        setShowConfig(true);
      }}
    >
      <Form form={form} initialValues={initialValues}>
        <Form.Item
          label={intl.formatMessage({
            id: "vm.spec",
            defaultMessage: "VM Specifications",
          })}
          required
        >
          <ModalSelect
            className="width-240"
            title={intl.formatMessage({
              id: "select.vm.spec",
              defaultMessage: "Select VM Specification",
            })}
            value={[vmSpec ?? originalValue]}
            onChange={(value) => setVmSpec(value?.[0])}
            disableRemoveSelect
          >
            <VmSpecList
              view="select"
              defaultQuery={{
                conditions: [
                  { key: "platform", op: Op.eq, value: originalValue.platform },
                ],
              }}
            />
          </ModalSelect>
          <div style={MARGIN_TOP_4_STYLE}>
            <label className="flex w-fit cursor-pointer items-center text-sm">
              <Checkbox
                checked={showConfig}
                onCheckedChange={(val) => setShowConfig(val === true)}
              />
              <span className="pl-2">
                {intl.formatMessage({
                  id: "vm.create.by.template.field.adjust.vm.spec",
                  defaultMessage: "Edit VM Specification",
                })}
              </span>
            </label>
          </div>
        </Form.Item>
        {showConfig ? (
          <ConfigInfoForm platform={originalValue.platform} showResetPasswd />
        ) : null}
      </Form>
    </DialogForm>
  );
}
