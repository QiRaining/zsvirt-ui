import { PortGroupVlanMode } from "@zstack/zsphere-types";

export const getPortGroupVlanMode = ({
  vlan,
  vlanMode,
}: {
  vlan?: string | number;
  vlanMode?: PortGroupVlanMode;
}) => {
  if (String(vlan) === "0" || vlanMode === PortGroupVlanMode.NONE) {
    return PortGroupVlanMode.ACCESS;
  }

  return vlanMode;
};
