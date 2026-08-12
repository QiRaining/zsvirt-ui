import { Link } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

import style from "../style.module.less";

export const Footer: React.FC<{
  dataSource?: Array<any>;
  selectedList?: Array<any>;
  setSelectedList?: (items: Array<any>) => void;
  refetch?: () => void;
  loading?: boolean;
  total?: number;
}> = ({ loading, total }) => {
  const intl = useIntl();

  if (loading || !total || total <= 50) {
    return null;
  }
  return (
    <div className={style.moreBtn}>
      {intl.formatMessage({
        id: "alarm.message.only.show.50.items",
        defaultMessage: "Show only the last 50 entries.",
      })}
      ，
      <Link to="/virtualization-monitoring-om/operation-log">
        {intl.formatMessage({ id: "see.all", defaultMessage: "View All" })}
      </Link>
    </div>
  );
};
