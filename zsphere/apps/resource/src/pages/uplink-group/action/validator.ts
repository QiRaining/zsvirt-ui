import type { UplinkGroup } from "@zstack/zsphere-types/graphql";

export const verifyVSwitchIsNotDefault = (_current: UplinkGroup, source: any) =>
  !source?.isDefault;

export const verifyIsBond = (current: UplinkGroup, _source: any) =>
  !!current.bondingUuid;

export const verifyIsSingleInterface = (
  current?: UplinkGroup,
  _source?: any,
) => {
  return !current?.interfaceUuid && (current?.bond?.slaves?.length || 0) > 1;
};
