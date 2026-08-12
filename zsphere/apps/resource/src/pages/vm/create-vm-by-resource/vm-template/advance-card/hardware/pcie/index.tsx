import PciDeviceList from "@zstack/virtualization-resource/src/pages/pci-device/list";
import { Form } from "@zstack/zsphere-components";
import { ModalSelect } from "@zstack/zsphere-components";
import { IIsRequiredType, useValidator } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import { formatConditions } from "@zstack/zsphere-utils";
import type { FormInstance } from "antd";
import * as _ from "lodash-es";
import { keys } from "lodash-es";
import { useEffect } from "react";
import { useIntl } from "react-intl";

export interface IProps {
  index: number;
  form: FormInstance;
  originValue?: any;
  source?: any;
  isEdit?: boolean;
}

const gpuTypeList = [
  "GPU_Video_Controller",
  "GPU_3D_Controller",
  "GPU_Audio_Controller",
  "GPU_USB_Controller",
  "GPU_Serial_Controller",
];

export default function PcieCard({
  index,
  form,
  source,
  originValue,
  isEdit = false,
}: IProps) {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);

  useEffect(() => {
    if (!originValue) {
      form.setFields([
        {
          name: `pcieDevice-${index}`,
          value: [],
        },
      ]);
    }
  }, [originValue]);

  return (
    <div>
      <Form.Item
        noStyle
        shouldUpdate={(pre, cur) => {
          const curKeys = keys(cur).filter(
            (key) =>
              key.indexOf("pcieDevice") > -1 &&
              key.split("-")[1] !== index.toString(),
          );
          return (
            pre.runPath !== cur.runPath ||
            curKeys.some((key) => pre[key] !== cur[key])
          );
        }}
      >
        {() => {
          const values = form.getFieldsValue();

          const selectedUuids = keys(values)
            .filter(
              (key) =>
                key.indexOf("pcieDevice-") === 0 &&
                values[key]?.length &&
                key.split("pcieDevice-")?.[1] !== index.toString(),
            )
            .map((key) => values[key]?.[0]?.uuid);

          let defaultQuery: any;
          if (!isEdit) {
            defaultQuery = {
              conditions: [
                { key: "uuid", op: Op.notIn, values: selectedUuids },
                { key: "type", op: Op.notIn, values: gpuTypeList },
              ],
              type: "candidateForCreatingVm",
              extraConditions: [
                ...formatConditions({
                  hostUuid:
                    values.runPath?.[0]?.__typename === "HostVO"
                      ? values.runPath?.[0]?.uuid
                      : undefined,
                  clusterUuids:
                    source?.__typename === "Cluster" ? [source.uuid] : [],
                }),
              ],
            };
          } else {
            defaultQuery = {
              type: "candidateForAttachToVm",
              extraConditions: [
                { key: "vmInstanceUuid", op: Op.eq, value: source?.uuid },
              ],
              conditions: [
                { key: "uuid", op: Op.notIn, values: selectedUuids },
                { key: "type", op: Op.notIn, values: gpuTypeList },
              ],
            };
          }

          return (
            <Form.Item
              required
              name={`pcieDevice-${index}`}
              label={intl.formatMessage({
                id: "pcie.device",
                defaultMessage: "PCIe Device",
              })}
              rules={[
                isRequired(
                  IIsRequiredType.select,
                  intl.formatMessage({
                    id: "pcie.device",
                    defaultMessage: "PCIe Device",
                  }),
                ),
              ]}
            >
              <ModalSelect
                style={STYLE_WIDTH_200}
                title={intl.formatMessage({
                  id: "virtualization.create.instance.hardware.pcie.modal.title",
                  defaultMessage: "Select PCIe Device",
                })}
                transformKey={(value) => {
                  const pcieName = value?.name;
                  if (!pcieName) {
                    return null;
                  }
                  return pcieName.split("_").slice(1, -1).join("_");
                }}
              >
                <PciDeviceList view="select" defaultQuery={defaultQuery} />
              </ModalSelect>
            </Form.Item>
          );
        }}
      </Form.Item>
    </div>
  );
}
