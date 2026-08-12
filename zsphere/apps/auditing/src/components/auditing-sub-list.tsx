import type { IQuery } from "@zstack/zsphere-types";
import type { Audit as IAudit } from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";

import getUseColumnConfig from "../config/useColumnConfig";
import Detail from "../detail/detail-modal";
import AuditList from "../list/list";

interface IProps {
  defaultQuery?: IQuery;
}

const AuditingSubList: React.FC<IProps> = ({ defaultQuery }) => {
  const view = "sub";
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
        view={view}
        defaultQuery={defaultQuery}
        isZsv={true}
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

export default React.memo(AuditingSubList);
