import type { ShareType as IType } from "@zstack/zsphere-types/graphql";
import { omit } from "lodash-es";
import type { FC } from "react";
import { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  type: IType;
}

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

export const useShareTypeFilters = (view: string = "main") => {
  const map = useShareTypeMap();

  return useMemo(() => {
    const newMap = view.includes("sub.shared.resource")
      ? omit(map, ["None"])
      : map;

    return Object.entries(newMap).map(([key, value]) => ({
      text: value,
      value: key,
    }));
  }, [map, view]);
};

const ShareType: FC<IProps> = ({ type }) => {
  const iconMap = useShareTypeMap();

  const map = iconMap;
  return map[type] || null;
};

export default ShareType;
