import { useActionConfig } from "@zstack/zsphere-engine/src/physical-nic";
import type { Bond, PhysicalNic } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  verifyGenerateSriov,
  verifyUngenerateSriov,
  verifyEditIPv4Address,
  verifySetPhysicalNetworkType,
  verifyAddNic,
  verifyWithoutVsiwth,
  verifyZSVRemoveNic,
  verifyNicVsiwth,
  verifyConfigSriov,
} from "../action/validator";

export default ({ source }: { source?: Bond }) => {
  const intl = useIntl();

  return useActionConfig<PhysicalNic>([
    {
      key: "cluster.phynic.sriov.generate",
      validators: [verifyGenerateSriov],
      ActionWrapper: require("../action/sriov-generate-modal").default,
      description: (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "physicalNic.action.sriov.generate.tooltip",
            defaultMessage: `### SR-IOV

1. Make sure that physical NICs support Single Root I/O Virtualization (SR-IOV).

2. Make sure that Intel VT-d or AMD IOMMU is enabled in the BIOS of the host whose physical NICs are to be virtualized.

3. Make sure that IOMMU of the host added to the platform is in Available status.

4. If the L2 network associated with the cluster uses the Smart NIC network acceleration mode, the maximum number of virtual NICs we recommend you virtualize a smart NIC is 32. `,
          })}
        </ReactMarkdown>
      ),
    },
    {
      key: "cluster.phynic.sriov.ungenerate",
      validators: [verifyUngenerateSriov],
      ActionWrapper: require("../action/sriov-ungenerate-modal").default,
    },
    {
      key: "host.phynic.sriov.generate",
      validators: [verifyGenerateSriov],
      ActionWrapper: require("../action/sriov-generate-modal").default,
      description: (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "physicalNic.action.sriov.generate.tooltip",
            defaultMessage: `### SR-IOV

1. Make sure that physical NICs support Single Root I/O Virtualization (SR-IOV).

2. Make sure that Intel VT-d or AMD IOMMU is enabled in the BIOS of the host whose physical NICs are to be virtualized.

3. Make sure that IOMMU of the host added to the platform is in Available status.

4. If the L2 network associated with the cluster uses the Smart NIC network acceleration mode, the maximum number of virtual NICs we recommend you virtualize a smart NIC is 32. `,
          })}
        </ReactMarkdown>
      ),
    },
    {
      key: "host.phynic.sriov.ungenerate",
      validators: [verifyUngenerateSriov],
      ActionWrapper: require("../action/sriov-ungenerate-modal").default,
    },
    {
      key: "edit.ip.address",
      validators: [verifyEditIPv4Address],
      ActionWrapper: require("../action/edit-ipv4-address").default,
      tooltipPlacement: "left",
      tooltip: intl.formatMessage({
        id: "physicalNic.action.edit.ipAddress.tooltip",
        defaultMessage:
          "Cannot modify the IP address because the NIC has been added to a bond or used as a management network IP.",
      }),
    },
    {
      key: "edit.physicalNic",
      name: intl.formatMessage({
        id: "edit.name.and.description",
        defaultMessage: "Edit Name and Description",
      }),
      ActionWrapper: require("../action/edit").default,
    },
    {
      key: "modify.lldpMode",
      ActionWrapper: require("../action/batche-lldp-mode").default,
    },
    {
      key: "batche.modify.lldpMode",
      ActionWrapper: require("../action/batche-lldp-mode").default,
    },
    {
      key: "set.physicalNetwork.type",
      validators: [verifySetPhysicalNetworkType],
      ActionWrapper: require("../action/set-physicalNetwork-type").default,
      description: (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "physicalNetwork.action.modify.physicalNetworkType.description",
            defaultMessage: "description",
          })}
        </ReactMarkdown>
      ),
    },
    {
      key: "add.physical.nic",
      autoInjectPreValidator: false,
      preValidators: [verifyAddNic, verifyNicVsiwth],
      tooltip: intl.formatMessage({
        id: "bond.action.with.vswitch.disabled.tooltip.in.bond.list",
        defaultMessage:
          "This aggregated port has been linked to the upstream link, please go to the \\\"Distributed Switch > Upstream Link\\\" page to modify the configuration.",
      }),
      ActionWrapper:
        require("@zstack/virtualization-resource/src/pages/bond/action/add-physical-nic")
          .default,
      defaultShowTooltip: true,
    },
    {
      key: "remove.physical.nic",
      validators: [verifyZSVRemoveNic, verifyWithoutVsiwth],
      tooltip: intl.formatMessage({
        id: "bond.action.with.vswitch.disabled.tooltip.in.bond.list",
        defaultMessage:
          "This aggregated port has been linked to the upstream link, please go to the \\\"Distributed Switch > Upstream Link\\\" page to modify the configuration.",
      }),
      ActionWrapper:
        require("@zstack/virtualization-resource/src/pages/bond/action/remove-physical-nic")
          .default,
      defaultShowTooltip: !!source?.vSwitch,
    },
    {
      key: "config.sriov",
      validators: [verifyConfigSriov],
      tooltip: (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "physicalNic.action.config.sriov.tooltip",
            defaultMessage: `Cannot configure SR-IOV, possibly due to:

1. The IOMMU status on the host where this physical NIC resides is unavailable.
2. This physical NIC does not support configuring SR-IOV.`,
          })}
        </ReactMarkdown>
      ),
      description: (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "physicalNic.action.config.sriov.description",
            defaultMessage: `### Configure SR-IOV

1. Make sure that physical NICs support Single Root I/O Virtualization (SR-IOV).
2. Make sure that Intel VT-d or AMD IOMMU is enabled in the BIOS of the host whose physical NICs are to be virtualized.
3. Make sure the host IOMMU is in Available status.`,
          })}
        </ReactMarkdown>
      ),
      ActionWrapper: require("../action/config-sriov").default,
    },
  ]);
};
