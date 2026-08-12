import { Text } from "@zstack/design";
import { ConstantType } from "@zstack/zsphere-constant";
import useColumnConfig from "@zstack/zsphere-engine/src/guest-os/useColumnConfig";
import { Illustration } from "@zstack/zsphere-illustration";
import { CpuMemHotAdd } from "@zstack/zsphere-types";
import type { GuestOsCpuMemHotAddInfo } from "@zstack/zsphere-types/graphql";
import {
  getGuestIcon,
  useGetGuestNameEnum,
} from "zsv_resource_shared/image/utils";

// Style constants
const FILTER_ITEM_STYLE = {
  display: "inline-flex",
  alignItems: "center",
} as const;
const SPAN_MARGIN_LEFT_STYLE = { marginLeft: 4 } as const;
const RENDER_STYLE = {
  display: "flex",
  alignItems: "center",
} as const;

export default () => {
  const guestNameEnum = useGetGuestNameEnum();
  return useColumnConfig<GuestOsCpuMemHotAddInfo>([
    {
      key: "guestOsType",
      filters: guestNameEnum.map((it) => {
        return {
          text: (
            <span style={FILTER_ITEM_STYLE}>
              <Illustration type={it.icon} size={16} />
              <span style={SPAN_MARGIN_LEFT_STYLE}>{it.value}</span>
            </span>
          ),
          value: it.value,
        };
      }),
      render: ({ guestOsType }) => {
        const icon = getGuestIcon(guestOsType, guestNameEnum)?.icon;
        if (icon) {
          return (
            <div style={RENDER_STYLE}>
              <Illustration type={icon} size={16} />
              <span style={SPAN_MARGIN_LEFT_STYLE}>{guestOsType}</span>
            </div>
          );
        }
        return <Text>{guestOsType}</Text>;
      },
    },
    {
      key: "cpuMemHotAdd",
      filterEnumType: ConstantType.CpuMemHotAdd,
      filterOptions: CpuMemHotAdd,
    },
  ]);
};
