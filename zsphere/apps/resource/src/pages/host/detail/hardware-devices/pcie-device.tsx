import { RadioGroup } from "@zstack/design";
import PciDeviceList from "@zstack/virtualization-resource/src/pages/pci-device/list";
import { useAuth } from "@zstack/zsphere-components";
import { Alert } from "@zstack/zsphere-design-biz";
import { PciDevicePassThroughState } from "@zstack/zsphere-types";
import type { HostVO } from "@zstack/zsphere-types/graphql";
import React, { useState, useMemo } from "react";
import { useIntl } from "react-intl";

import HostEditConfig from "../../action/edit-config";

const ALERT_STYLE = { marginBottom: 12 } as const;
const RADIO_GROUP_STYLE = { marginBottom: 12 } as const;

export interface IProps {
  current: HostVO;
  total: number;
  passthroughCount: number;
  refetchHost: () => void;
}

export default function PcieDevice({
  current,
  total,
  passthroughCount,
  refetchHost,
}: IProps) {
  const intl = useIntl();
  const [tab, setTab] = useState("passthrough");
  const { hasAuth } = useAuth();
  const [visible, setVisible] = useState(false);
  const selectedList = useMemo(() => [current], [current]);

  let alertMessage: React.ReactNode = "";
  let guideAction: { text: React.ReactNode; onClick?: () => void } | undefined;
  if (current.hostIommu?.state !== "Enabled") {
    alertMessage = (
      <>
        {intl.formatMessage({
          id: "pci.device.iommu.disabled.alert",
          defaultMessage: "To use device passhthrough, enable IOMMU first. ",
        })}
      </>
    );
    if (
      hasAuth({
        authKey: "edit.config",
        resource: "host",
        type: "action",
      })
    ) {
      guideAction = {
        text: intl.formatMessage({
          id: "pcie.device.alert.guide.enable.iommu",
          defaultMessage: "Enable IOMMU",
        }),
        onClick: () => setVisible(true),
      };
    }
  } else if (current.hostIommu?.status !== "Active") {
    alertMessage = intl.formatMessage({
      id: "pci.device.iommu.inactive.alert",
      defaultMessage:
        "IOMMU is enabled but not available for device passthrough. Check the kernel's IOMMU settings.",
    });
  }

  return (
    <>
      {alertMessage ? (
        <Alert
          variant="warning"
          closable
          style={ALERT_STYLE}
          guideAction={guideAction}
        >
          {alertMessage}
        </Alert>
      ) : null}
      <RadioGroup
        style={RADIO_GROUP_STYLE}
        value={tab}
        onValueChange={(value) => {
          setTab(value);
        }}
        variant="outline"
        options={[
          {
            value: "passthrough",
            label: intl.formatMessage(
              {
                id: "passthrough.pcie.device",
                defaultMessage: "Passthrough PCIe Devices ({count})",
              },
              { count: passthroughCount },
            ),
          },
          {
            value: "all",
            label: intl.formatMessage(
              {
                id: "all.pcie.device",
                defaultMessage: "All PCIe Devices ({count})",
              },
              { count: total },
            ),
          },
        ]}
      />
      {tab === "passthrough" ? (
        <PciDeviceList
          key="main.passthrough"
          view="main.passthrough"
          defaultQuery={{
            conditions: [
              {
                key: "hostUuid",
                value: current.uuid,
              },
              {
                key: "passThroughState",
                value: PciDevicePassThroughState.Enabled,
              },
            ],
            type: "pci",
          }}
          source={current}
        />
      ) : (
        <PciDeviceList
          key="main"
          view="main"
          defaultQuery={{
            conditions: [
              {
                key: "hostUuid",
                value: current.uuid,
              },
            ],
            type: "pci",
          }}
          source={current}
        />
      )}
      <HostEditConfig
        view="sub.pcie.device.alert"
        position="header"
        selectedList={selectedList}
        setVisible={setVisible}
        visible={visible}
        refetch={refetchHost}
      />
    </>
  );
}
