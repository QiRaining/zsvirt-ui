import { PortGroupVlanMode } from "@zstack/zsphere-types";
import { useIntl } from "react-intl";

export const usePortGroupVlanMode = () => {
  const intl = useIntl();

  const portGroupVlanModeMap = new Map<PortGroupVlanMode, string>([
    [
      PortGroupVlanMode.NONE,
      intl.formatMessage({ id: "none", defaultMessage: "None" }),
    ],
    [
      PortGroupVlanMode.ACCESS,
      intl.formatMessage({
        id: "portGroupVlanMode.ACCESS",
        defaultMessage: "Standard VLAN",
      }),
    ],
    // [
    //   PortGroupVlanMode.TRUNK,
    //   intl.formatMessage({ id: 'portGroupVlanMode.TRUNK', defaultMessage: '手动指定' })
    // ],
    // [
    //   PortGroupVlanMode.PVLAN,
    //   intl.formatMessage({ id: 'portGroupVlanMode.PVLAN', defaultMessage: '手动指定' })
    // ]
  ]);

  const portGroupVlanModeList = [...portGroupVlanModeMap.entries()].map(
    ([key, label]) => ({
      key,
      label,
    }),
  );

  return { portGroupVlanModeMap, portGroupVlanModeList };
};

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
