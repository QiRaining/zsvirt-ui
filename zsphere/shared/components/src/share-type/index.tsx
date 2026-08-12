import { ShareType as IShareType } from "@zstack/zsphere-types";
import _ from "lodash-es";
import { useMemo } from "react";
import { useIntl } from "react-intl";

export const useShareTypeMap = () => {
  const intl = useIntl();
  return {
    Public: (
      <span>
        {intl.formatMessage({ id: "globalShared", defaultMessage: "Share Globally" })}
      </span>
    ),
    Group: (
      <span>
        {intl.formatMessage({
          id: "share.type.group",
          defaultMessage: "Share With Users/User Groups",
        })}
      </span>
    ),
    None: (
      <span>
        {intl.formatMessage({ id: "no.share", defaultMessage: "Not Share" })}
      </span>
    ),
  };
};

export const useShareTypeFilters = (view = "main") => {
  const map = useShareTypeMap();

  return useMemo(() => {
    const newMap = view.includes("sub.shared.resource")
      ? _.omit(map, ["None"])
      : map;

    return Object.entries(newMap).map(([key, value]) => ({
      text: value,
      value: key,
    }));
  }, [map, view]);
};

export const verifyCancelShare = (current: any) => {
  return current.shareType === IShareType.Group;
};

export interface IProps {
  type: IShareType;
}

export default function ShareType({ type }: IProps) {
  const iconMap = useShareTypeMap();

  const map = iconMap;
  return map[type] || null;
}
