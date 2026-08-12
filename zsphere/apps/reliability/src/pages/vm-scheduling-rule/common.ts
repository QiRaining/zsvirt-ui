import { Op } from "@zstack/zsphere-types";
import qs from "qs";

export const getZoneUuidFromLocation = () => {
  let zoneUuid =
    qs.parse(window.location.search, { ignoreQueryPrefix: true })?.zoneUuid ??
    ("" as any);
  if (zoneUuid === "-1") {
    zoneUuid = undefined;
  }
  return { zoneUuid };
};

export const getZoneUuidConditionFromLocation = () => {
  const zoneUuid =
    qs.parse(window.location.search, { ignoreQueryPrefix: true })?.zoneUuid ??
    ("" as any);

  const condition =
    zoneUuid === "-1"
      ? {
          key: "zoneUuid",
          op: Op.ne,
          value: "null",
        }
      : {
          key: "zoneUuid",
          op: Op.eq,
          value: zoneUuid,
        };
  return { zoneUuidCondition: condition };
};

// export const renderTable = ({ zoneUuid, resourceType }: { zoneUuid: string | undefined, resourceType: 'VmGroup' | 'HostGroup' }) => {
//   const toolbar: ITableListProps<string>['toolbar'] = useMemo(() => {
//     if (zoneUuid) {
//       return ['refresh', 'operation', 'search']
//     }
//     return ['refresh', 'search']
//   }, [zoneUuid])

//   const renderAction = useCallback<Required<ITableListProps<string>>['renderAction']>(
//     ({ node }) =>
//       zoneUuid ? node : <span>-</span>,
//     [zoneUuid]
//   )
//   return { toolbar, renderAction }
// }
