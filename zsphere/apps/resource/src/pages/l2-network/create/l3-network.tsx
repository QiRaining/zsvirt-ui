import { Checkbox } from "@zstack/design";
import IpConfig from "@zstack/virtualization-resource/src/pages/l3-network/create/ip-config";
import VlanConfig from "@zstack/virtualization-resource/src/pages/l3-network/create/vlan-config";
import { Form } from "@zstack/zsphere-components";
import { InputDebounce } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import React from "react";
import { useIntl } from "react-intl";

const FormCheckbox = React.forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }
>(({ checked, onChange, label, ...rest }, ref) => {
  const id = React.useId();
  return (
    <div className="flex items-center">
      <Checkbox
        ref={ref}
        id={id}
        checked={checked}
        onCheckedChange={(val) => onChange?.(val === true)}
        {...rest}
      />
      {label && (
        <label
          htmlFor={id}
          className="cursor-pointer pl-2 text-sm !text-neutral-700"
        >
          {label}
        </label>
      )}
    </div>
  );
});

export default function L3Network() {
  const intl = useIntl();
  const { commonNameRules } = useValidator(intl);
  const createL3 = Form.useWatch("createL3Network");

  return (
    <>
      <Form.Item
        label={intl.formatMessage({
          id: "virtualization.l3.network",
          defaultMessage: "Distributed Port Group",
        })}
        name="createL3Network"
        valuePropName="checked"
      >
        <FormCheckbox
          label={intl.formatMessage({
            id: "virtualization.create.l3network",
            defaultMessage: "New Distributed Port Group",
          })}
        />
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          id: "name",
          defaultMessage: "Name",
        })}
        name="l3networkName"
        rules={createL3 ? commonNameRules : []}
        hidden={!createL3}
      >
        <InputDebounce className="width-320" />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prev, current) =>
          prev.createL3Network !== current.createL3Network ||
          prev.dhcpService !== current.dhcpService ||
          prev.ipVersion !== current.ipVersion
        }
      >
        {({ getFieldValue }) => {
          return (
            getFieldValue("createL3Network") && (
              <>
                <VlanConfig
                  vlanRules={[
                    () => ({
                      validator(rule, values) {
                        if ((values >= 1 && values <= 4094) || !values) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          Error(
                            intl.formatMessage({
                              id: "L2Network.vlan.validator.invalid",
                              defaultMessage: "Invalid VLAN ID.",
                            }),
                          ),
                        );
                      },
                    }),
                  ]}
                />

                <IpConfig />
              </>
            )
          );
        }}
      </Form.Item>
    </>
  );
}
