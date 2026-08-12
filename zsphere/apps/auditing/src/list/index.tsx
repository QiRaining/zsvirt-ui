import type { IListProps } from "@zstack/zsphere-types";
import type { Audit as IAudit } from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";

import getUseColumnConfig from "../config/useColumnConfig";
import Detail from "../detail/detail-modal";
import AuditList from "./list";

const List: React.FC<IListProps<IAudit>> = (props) => {
  const [view, setView] = useState(props.view);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<IAudit>();
  const useColumnConfig = getUseColumnConfig({
    view,
    onApiNameClick: (row) => {
      setCurrent(row);
      setVisible(true);
    },
  });
  return (
    <>
      <AuditList
        {...props}
        key={view}
        isZsv
        view={view}
        onViewChange={setView}
        useColumnConfig={useColumnConfig}
      />
      <Detail
        visible={visible}
        setVisible={setVisible}
        row={current}
        view={view}
      />
    </>
  );
};

export default React.memo(List);
