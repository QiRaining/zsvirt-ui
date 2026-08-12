import { Icon } from "@zstack/icon";
import { useResourceConfigQuery } from "@zstack/virtualization-resource/src/pages/vm/hooks/use-resource-config-query";
import { Form, ZSVForm } from "@zstack/zsphere-components";
import { CpuArchitecture } from "@zstack/zsphere-types";
import _ from "lodash-es";
import React, { useRef, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import { fieldsNeedsValidateInBasic } from "../basic-card";
import AdvanceConfig, { fieldsNeedsValidateInConfig } from "./config";
import HardwareInfo from "./hardware";

import styles from "./style.module.less";

// Static style constants
const STYLE_DISPLAY_FLEX_CENTER = {
  display: "flex",
  alignItems: "center",
} as const;
const STYLE_DANGER_DISPLAY_BLOCK = {
  display: "block",
  color: "var(--danger-500)",
} as const;

interface IProps {
  form: any;
  visible?: boolean;
  template: any;
}

const { Item } = Form;

const notValidatefields = [
  ...fieldsNeedsValidateInBasic,
  ...fieldsNeedsValidateInConfig,
];

const AlertIcon: React.FC<IAlertProps> = ({ form }) => {
  const [visible, setVisible] = useState(true);
  const isValidatingRef = useRef(false);

  const formForValidate = _.cloneDeep(form);

  useEffect(() => {
    const getData = async () => {
      if (isValidatingRef.current) {
        return;
      }
      isValidatingRef.current = true;

      //异步校验可能会一直触发，这里的校验先把特殊的给过滤掉，比如：网卡-IP地址

      const formFields = Object.keys(form.getFieldsValue());

      const fieldsNeedsValidate = formFields.filter(
        (t) => !t.match(/^ipv(4|6)-/) && !_.includes(notValidatefields, t),
      );

      const submitting = form.getFieldValue("_submitting");
      if (submitting) {
        await submitting;
      }

      await form
        .validateFields(fieldsNeedsValidate)
        .then(() => {
          setVisible(false);
        })
        .catch((errorInfo: any) => {
          const visibleFlag =
            errorInfo.errorFields.filter(
              (t: any) => !_.includes(notValidatefields, t.name?.[0]),
            )?.length !== 0;

          setVisible(visibleFlag);
        })
        .finally(() => {
          isValidatingRef.current = false;
        });
    };
    getData();
  }, [formForValidate]);

  if (!visible) {
    return null;
  }

  return <Icon style={STYLE_DANGER_DISPLAY_BLOCK} type="alert-triangle-fill" />;
};

const AdvancePart: React.FC<IProps> = ({ form, visible, template }) => {
  const intl = useIntl();

  const [resourceConfig] = useResourceConfigQuery(
    template?.[0]?.uuid,
    ["vm", "kvm", "pciDevice"],
    [
      "nicMultiQueueNum",
      "vm.cpu.hypervisor.feature",
      "vm.cpu.quota",
      "numa",
      "emulateHyperV",
      "migrate.autoConverge",
      "hotPlugEnabled",
      "hotPlugMemory",
      "vmPortOff",
      "bootMenuSplashTimeout",
      "spiceStreamingMode",
      "soundType",
      "videoType",
    ],
    visible,
  );

  useEffect(() => {
    if (visible && _.keys(resourceConfig)?.length) {
      const fieldsAboutConfig = {
        hotPlug: resourceConfig?.numa?.value === "true",
        cpuHideKVMMark:
          resourceConfig?.["vm.cpu.hypervisor.feature"]?.value === "true",
        memHotPlug: resourceConfig?.numa?.value === "true",
        gpuType: resourceConfig?.videoType?.value,
        cpuQuota: Number(resourceConfig?.["vm.cpu.quota"]?.value) / 10000,
        soundCard: resourceConfig?.soundType?.value,
      };

      const otherDeviceItem = {
        motherboardType:
          template?.[0]?.systemTag?.vmMachineType ??
          (template?.[0]?.architecture === CpuArchitecture.aarch64
            ? "q35"
            : "i440fx"),
      };

      form.setFieldsValue({ ...fieldsAboutConfig, ...otherDeviceItem });
    }
  }, [form, resourceConfig, visible]);

  return (
    <Item noStyle shouldUpdate={(prev, curr) => prev !== curr}>
      {() => {
        return (
          <div className={styles.card}>
            <ZSVForm.Tabs
              tabs={[
                {
                  key: "hardware",
                  title: intl.formatMessage({
                    id: "virtualization.hardware.info",
                    defaultMessage: "Hardware Info",
                  }),
                  titleAlarm: <AlertIcon form={form} />,
                  content: (
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, curr) =>
                        prev.vmTemplate?.[0]?.uuid !==
                        curr.vmTemplate?.[0]?.uuid
                      }
                    >
                      {({ getFieldValue }) => {
                        return (
                          <HardwareInfo
                            form={form}
                            visible={visible}
                            vmTemplate={getFieldValue("vmTemplate")}
                          />
                        );
                      }}
                    </Form.Item>
                  ),
                },
                {
                  key: "config",
                  title: (
                    <div style={STYLE_DISPLAY_FLEX_CENTER}>
                      <div>
                        {intl.formatMessage({
                          id: "virtualization.advance.setting",
                          defaultMessage: "Advanced Settings",
                        })}
                      </div>
                      <Item noStyle shouldUpdate>
                        {({ getFieldsError }) => {
                          const errors = getFieldsError().filter(
                            (item) =>
                              item.name.length &&
                              item.errors.length &&
                              fieldsNeedsValidateInConfig.includes(
                                item.name[0].toString(),
                              ),
                          );
                          return errors.length ? (
                            <Icon
                              style={{
                                display: "block",
                                marginLeft: 4,
                                color: "var(--danger-500)",
                              }} type="alert-triangle-fill"
                            />
                          ) : null;
                        }}
                      </Item>
                    </div>
                  ),
                  content: <AdvanceConfig form={form} />,
                },
              ]}
            />
          </div>
        );
      }}
    </Item>
  );
};

export default React.memo(AdvancePart);
