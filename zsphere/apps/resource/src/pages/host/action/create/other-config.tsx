import { ZSVForm, Switch } from "@zstack/zsphere-components";
import { Form } from "@zstack/zsphere-components";
import type { FC } from "react";
import React, { useContext } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import FormContext from "./context";

const { Card } = ZSVForm;
const { Item } = Form;

const BasicConfig: FC = () => {
  const intl = useIntl();
  const { eptVisible } = useContext(FormContext);

  return (
    <Card
      title={intl.formatMessage({
        id: "other.config",
        defaultMessage: "Other Settings",
      })}
    >
      <Item
        name="iommu"
        label={intl.formatMessage({
          id: "scan.hostIommuSetting",
          defaultMessage: "Scan Host IOMMU Setting",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "host.field.iommu.tooltip",
              defaultMessage: `### Scan Host IOMMU Setting
1. To use the GPU device passthrough, vGPU virtualization, SR-IOV, or smart NIC features, enable this option.
2. This feature scans all physical NICs that can be virtualized and all available GPU devices of the host.
3. If you enable IOMMU in the kernel, you need to restart the host and make sure that Intel VT-d or AMD IOMMU is enabled in the host BIOS. This ensures that the IOMMU setting takes effect in the kernel.`,
            })}
          </ReactMarkdown>
        }
        valuePropName="checked"
      >
        <Switch />
      </Item>
      {eptVisible && (
        <Item
          name="ept"
          label={intl.formatMessage({
            id: "intelEptHardwareAssist",
            defaultMessage: "Intel EPT Hardware Assist",
          })}
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "host.field.intelEptHardwareAssist.tooltip",
                defaultMessage: `### Intel EPT Hardware Assist

1. Enabling Extended Page Tables (EPT) Hardware Assist for Intel CPU can effectively improve the CPU performance.
2. If the CPU model of the server is too old so that you cannot create a virtual machine or cannot open the console of a virtual machine, you can disable this feature.
3. Disabling Intel EPT Hardware Assist will lower VM performance.`,
              })}
            </ReactMarkdown>
          }
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Item>
      )}
    </Card>
  );
};

export default BasicConfig;
