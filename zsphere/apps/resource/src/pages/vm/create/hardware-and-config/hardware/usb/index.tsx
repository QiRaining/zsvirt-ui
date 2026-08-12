import { RadioGroup } from "@zstack/design";
import UsbDeviceList from "@zstack/virtualization-resource/src/pages/usb/list";
import { ModalSelect } from "@zstack/zsphere-components";
import { Form } from "@zstack/zsphere-components";
import { useValidator, IIsRequiredType } from "@zstack/zsphere-hooks";
import type { FormCreateType } from "@zstack/zsphere-types";
import { Op, UsbDeviceQueryType } from "@zstack/zsphere-types";
import type { UsbDevice } from "@zstack/zsphere-types/graphql";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  index: number;
  zoneUuid: string;
  isEdit?: boolean;
  originValue?: UsbDevice;
  source?: any;
}

const { Item } = Form;

const USBCard: React.FC<IProps> = ({
  form,
  index,
  zoneUuid,
  originValue,
  source,
}) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);

  useEffect(() => {
    if (!originValue) {
      form.setFieldsValue({
        [`usbDiviceType-${index}`]: "PassThrough",
      });
    }
  }, [originValue]);

  return (
    <div className={styles.content}>
      {originValue ? (
        <Item
          name={`usbDiviceType-${index}`}
          label={intl.formatMessage({
            id: "attach.type",
            defaultMessage: "Attach Mode",
          })}
        >
          {originValue.attachType === "PassThrough"
            ? intl.formatMessage({
                id: "virtualization.create.instance.hardware.usb.type.passThrough",
                defaultMessage: "Passthrough",
              })
            : intl.formatMessage({
                id: "virtualization.create.instance.hardware.usb.type.transpond",
                defaultMessage: "Forward",
              })}
        </Item>
      ) : (
        <Item
          name={`usbDiviceType-${index}`}
          label={intl.formatMessage({
            id: "attach.type",
            defaultMessage: "Attach Mode",
          })}
        >
          <RadioGroup
            options={[
              {
                value: "PassThrough",
                label: intl.formatMessage({
                  id: "virtualization.create.instance.hardware.usb.type.passThrough",
                  defaultMessage: "Passthrough",
                }),
              },
              {
                value: "Redirect",
                label: intl.formatMessage({
                  id: "virtualization.create.instance.hardware.usb.type.transpond",
                  defaultMessage: "Forward",
                }),
              },
            ]}
          />
        </Item>
      )}
      <Item
        noStyle
        shouldUpdate={(pre, cur) => {
          return (
            pre[`usbDiviceType-${index}`] !== cur[`usbDiviceType-${index}`] ||
            pre.runPath !== cur.runPath
          );
        }}
      >
        {() => {
          const runPath = form.getFieldValue("runPath");
          const usbAttachType = form.getFieldValue(`usbDiviceType-${index}`);
          const extraConditions = [
            { key: "attachType", op: Op.eq, value: usbAttachType },
          ];

          const runPathType = runPath?.[0]?.__typename ?? "";

          if (usbAttachType === "Redirect") {
            extraConditions.push({
              key: "zoneUuid",
              op: Op.eq,
              value: zoneUuid,
            });
            if (runPathType === "HostVO") {
              extraConditions.push({
                key: "hostUuid",
                op: Op.ne,
                value: runPath?.[0]?.uuid,
              });
            }
          }

          if (usbAttachType === "PassThrough" && runPathType === "HostVO") {
            extraConditions.push({
              key: "hostUuid",
              op: Op.eq,
              value: runPath?.[0]?.uuid,
            });
          }

          //for edit

          if (source?.__typename === "VmInstance") {
            extraConditions.push({
              key: "hostUuid",
              op: Op.eq,
              value: source?.host?.uuid,
            });
          }

          return (
            <Item
              required
              name={`usbDivice-${index}`}
              label={intl.formatMessage({
                id: "usb.device",
                defaultMessage: "USB Device",
              })}
              rules={[
                isRequired(
                  IIsRequiredType.select,
                  intl.formatMessage({
                    id: "usb.device",
                    defaultMessage: "USB Device",
                  }),
                ),
              ]}
            >
              <ModalSelect
                className={styles.width200}
                title={intl.formatMessage({
                  id: "virtualization.create.instance.hardware.usb.type.usb.modal.title",
                  defaultMessage: "Select USB Device",
                })}
              >
                <UsbDeviceList
                  view="select"
                  defaultQuery={{
                    type:
                      usbAttachType === "Redirect"
                        ? UsbDeviceQueryType.ZSVAttachableRedirectUsb
                        : UsbDeviceQueryType.ZSVAttachablePassThroughUsb,
                    extraConditions: [...extraConditions],
                  }}
                />
              </ModalSelect>
            </Item>
          );
        }}
      </Item>
    </div>
  );
};

export default React.memo(USBCard);
