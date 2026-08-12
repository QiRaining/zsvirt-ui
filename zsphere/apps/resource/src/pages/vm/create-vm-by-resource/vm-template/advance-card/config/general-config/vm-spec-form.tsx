import { Button, Text, Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import ConfigInfoForm from "@zstack/virtualization-resource/src/pages/vm-spec/components/config-info-form";
import { isVmToolsOutdated } from "@zstack/virtualization-resource/src/pages/vm-spec/components/utils";
import VmSpecList from "@zstack/virtualization-resource/src/pages/vm-spec/list";
import { VmSpecType } from "@zstack/virtualization-resource/src/pages/vm/create-vm-by-resource/vm-template/utils";
import { Input, Form, Select, ModalSelect } from "@zstack/zsphere-components";
import { useValidator, IIsRequiredType } from "@zstack/zsphere-hooks";
import { Op, GuestToolsState } from "@zstack/zsphere-types";
import type { VmInstance } from "@zstack/zsphere-types/graphql";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";

import VmSpecModal from "./vm-spec-modal";

import styles from "./style.module.less";

export default function VmSpecForm() {
  const intl = useIntl();
  const [showVmSpecModal, setShowVmSpecModal] = useState(false);
  const { isRequired } = useValidator(intl);
  const [form] = Form.useForm();

  // 监听模板和 guest 变化，设置 vmSpecType
  const vmTemplate = Form.useWatch("vmTemplate", form);
  const guest = Form.useWatch("guest", form);

  useEffect(() => {
    if (vmTemplate && vmTemplate.length > 0) {
      const vmTemplateInstance = vmTemplate[0] as VmInstance;
      const vmToolsInvalid =
        !!vmTemplateInstance &&
        (vmTemplateInstance.toolsState !== GuestToolsState.Installed ||
          isVmToolsOutdated(vmTemplateInstance));

      if (guest === "Other" || vmToolsInvalid) {
        form.setFieldsValue({ vmSpecType: VmSpecType.none });
      }
    }
  }, [vmTemplate, guest, form]);

  // 监听 guest 和 vmSpecType 变化，清空 vmSpecPreset
  const currentPresetValue = Form.useWatch(["vmSpecPreset", "value"], form);

  useEffect(() => {
    if (currentPresetValue?.[0] && currentPresetValue[0].platform !== guest) {
      form.setFieldsValue({ vmSpecPreset: { value: [] } });
    }
  }, [guest, currentPresetValue, form]);

  return (
    <>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev.vmTemplate !== curr.vmTemplate || prev.guest !== curr.guest
        }
      >
        {({ getFieldValue }) => {
          const vmTemplate = getFieldValue("vmTemplate")?.[0] as VmInstance;
          const vmToolsInvalid =
            !!vmTemplate &&
            (vmTemplate.toolsState !== GuestToolsState.Installed ||
              isVmToolsOutdated(vmTemplate));
          const guest = getFieldValue("guest");

          return (
            <Form.Item
              name="vmSpecType"
              label={intl.formatMessage({
                id: "vm.create.by.template.field.spec.type",
                defaultMessage: "OS Attribute",
              })}
              initialValue={VmSpecType.none}
            >
              <Select className="width-240" disabled={guest === "Other"}>
                <Select.Option value={VmSpecType.none}>
                  <Text>
                    {intl.formatMessage({
                      id: "vm.create.by.template.field.spec.type.none",
                      defaultMessage: "Do Not Customize",
                    })}
                  </Text>
                </Select.Option>
                <Select.Option
                  value={VmSpecType.preset}
                  disabled={vmToolsInvalid}
                >
                  {vmToolsInvalid ? (
                    <Tooltip
                      title={intl.formatMessage({
                        id: "vm.create.by.template.field.spec.type.preset.disabled.tooltip",
                        defaultMessage:
                          "Make sure the latest version of VMTools is installed and running properly on the VM template.",
                      })}
                    >
                      <Text className={styles.optionDisabled}>
                        {intl.formatMessage({
                          id: "vm.create.by.template.field.spec.type.preset",
                          defaultMessage: "Apply a Specification",
                        })}
                      </Text>
                    </Tooltip>
                  ) : (
                    <Text>
                      {intl.formatMessage({
                        id: "vm.create.by.template.field.spec.type.preset",
                        defaultMessage: "Apply a Specification",
                      })}
                    </Text>
                  )}
                </Select.Option>
                <Select.Option
                  value={VmSpecType.manual}
                  disabled={vmToolsInvalid}
                >
                  {vmToolsInvalid ? (
                    <Tooltip
                      title={intl.formatMessage({
                        id: "vm.create.by.template.field.spec.type.manual.disabled.tooltip",
                        defaultMessage:
                          "Make sure the latest version of VMTools is installed and running properly on the VM template.",
                      })}
                    >
                      <Text className={styles.optionDisabled}>
                        {intl.formatMessage({
                          id: "vm.create.by.template.field.spec.type.manual",
                          defaultMessage: "Manually Customize",
                        })}
                      </Text>
                    </Tooltip>
                  ) : (
                    <Text>
                      {intl.formatMessage({
                        id: "vm.create.by.template.field.spec.type.manual",
                        defaultMessage: "Manually Customize",
                      })}
                    </Text>
                  )}
                </Select.Option>
              </Select>
            </Form.Item>
          );
        }}
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev.guest !== curr.guest || prev.vmSpecType !== curr.vmSpecType
        }
      >
        {({ getFieldValue }) => {
          const guest = getFieldValue("guest");
          const vmSpecType = getFieldValue("vmSpecType");

          switch (vmSpecType) {
            case VmSpecType.none:
              return (
                <Form.Item
                  label={intl.formatMessage({
                    id: "virtualization.create.instance.config.general.hostname",
                    defaultMessage: "Hostname",
                  })}
                  name="hostname"
                  initialValue=""
                  preserve={false}
                >
                  <Input className="width-320" />
                </Form.Item>
              );
            case VmSpecType.preset:
              return (
                <Form.Item
                  name={["vmSpecPreset", "value"]}
                  label={intl.formatMessage({
                    id: "vm.spec",
                    defaultMessage: "VM Specifications",
                  })}
                  preserve={false}
                  required
                  rules={[isRequired(IIsRequiredType.select)]}
                  description={
                    guest === "Linux" ? (
                      <div className={styles.description}>
                        {intl.formatMessage({
                          id: "vm.spec.hostname.linux.description",
                          defaultMessage:
                            "For Linux VMs, if the hostname contains Chinese characters, this setting will not take effect.",
                        })}
                      </div>
                    ) : null
                  }
                >
                  <ModalSelect
                    title={intl.formatMessage({
                      id: "select.vm.spec",
                      defaultMessage: "Select VM Specification",
                    })}
                    onChange={() => {
                      form.setFieldsValue({
                        vmSpecPreset: { customConfig: null },
                      });
                    }}
                    customRender={({ value, onChange, onSelectModalShow }) => {
                      const vmSpec = value?.[0];
                      if (!vmSpec) {
                        return (
                          <Button
                            className={styles.addVmSpecBtn}
                            icon={<Icon type="plus" />}
                            variant="link"
                            onClick={onSelectModalShow}
                          >
                            {intl.formatMessage({
                              id: "add.vm.spec",
                              defaultMessage: "Add VM Specification",
                            })}
                          </Button>
                        );
                      }
                      return (
                        <div className={styles.vmSpecList}>
                          <div className={styles.vmSpecName}>
                            <Text>{vmSpec.name}</Text>
                          </div>
                          <div className={styles.vmSpecAction}>
                            <Icon
                              role="button"
                              onClick={() => {
                                setShowVmSpecModal(true);
                              }} type="edit"
                            />
                            <Icon
                              role="button"
                              onClick={() => {
                                onChange?.([]);
                                form.setFieldsValue({
                                  vmSpecPreset: { customConfig: null },
                                });
                              }} type="trash"
                            />
                          </div>
                        </div>
                      );
                    }}
                  >
                    <VmSpecList
                      view="select"
                      defaultQuery={{
                        conditions: [
                          { key: "platform", op: Op.eq, value: guest },
                        ],
                      }}
                    />
                  </ModalSelect>
                </Form.Item>
              );
            case VmSpecType.manual:
              return (
                <ConfigInfoForm
                  name="vmSpecManualConfig"
                  platform={guest}
                  showLinuxHostnameHint
                />
              );
            default:
              return null;
          }
        }}
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev.vmSpecPreset?.value !== curr.vmSpecPreset?.value ||
          prev.vmSpecPreset?.customConfig !== curr.vmSpecPreset?.customConfig
        }
      >
        {({ getFieldValue }) => {
          const originalValue = getFieldValue(["vmSpecPreset", "value"])?.[0];
          const originalCustomConfig = getFieldValue([
            "vmSpecPreset",
            "customConfig",
          ]);
          if (!originalValue) {
            return null;
          }
          return (
            <VmSpecModal
              visible={showVmSpecModal}
              setVisible={setShowVmSpecModal}
              originalValue={originalValue}
              customConfig={originalCustomConfig}
              onOk={(vmSpec, customConfig) => {
                form.setFieldsValue({ vmSpecPreset: { customConfig: null } });
                form.setFieldsValue({
                  vmSpecPreset: { value: [vmSpec], customConfig },
                });
              }}
            />
          );
        }}
      </Form.Item>
    </>
  );
}
