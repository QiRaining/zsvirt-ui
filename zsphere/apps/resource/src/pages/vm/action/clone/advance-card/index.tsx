import { Icon } from "@zstack/icon";
import { ZSVFormTabs } from "@zstack/zsphere-design-biz";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { useIntl } from "react-intl";

import type { CloneVmValues } from "../schema";
import type { CloneTypeEnum } from "../utils";
import Config from "./config";
import Hardware from "./hardware";

interface AdvanceCardProps {
  form: UseFormReturn<CloneVmValues>;
  visible?: boolean;
  sourceVm?: IVM;
  currentCloneType: CloneTypeEnum;
}

const AdvanceCard: React.FC<AdvanceCardProps> = ({
  form,
  visible,
  sourceVm,
  currentCloneType,
}) => {
  const intl = useIntl();
  const values = useWatch({ control: form.control });
  const hardwareHasError =
    Object.entries(values ?? {}).some(
      ([key, value]) =>
        key.startsWith("l3NetworkUuids-") &&
        (!Array.isArray(value) || value.length === 0),
    ) ||
    Object.keys(form.formState.errors).some((key) =>
      /^(l3NetworkUuids|storePath|allocationType|ipv4|ipv6|netmask|prefixLen|gateway4|gateway6|outboundBandwidth|inboundBandwidth)-/.test(
        key,
      ),
    );

  return (
    <div className="pb-3">
      <ZSVFormTabs
        contentClassName="!p-0"
        contentId="clone-vm-advance-tab"
        defaultValue="hardware"
        forceMount
        tabs={[
          {
            key: "hardware",
            title: intl.formatMessage({
              id: "virtualization.hardware.info",
              defaultMessage: "Hardware Info",
            }),
            titleAlarm: hardwareHasError ? (
              <Icon className="text-danger-500 ml-1 block" type="alert-triangle-fill" />
            ) : null,
            content: (
              <Hardware
                form={form}
                visible={visible}
                sourceVm={sourceVm}
                currentCloneType={currentCloneType}
              />
            ),
          },
          {
            key: "config",
            title: intl.formatMessage({
              id: "virtualization.advance.setting",
              defaultMessage: "Advanced Settings",
            }),
            content: <Config form={form} sourceVm={sourceVm} />,
          },
        ]}
      />
    </div>
  );
};

export default React.memo(AdvanceCard);
