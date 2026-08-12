import { ModalSelect, TableList } from "@zstack/zsphere-components";
import { useQueryConfig } from "@zstack/zsphere-engine/src/points-details";
import type { PointsDetails as IPointsDetails } from "@zstack/zsphere-types/graphql";
import { Button } from "antd";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { pointsDetailsList } from "../../../../gql/points-details.gql";
import { useColumnConfig } from "./points-details-config/index";

import style from "./style.module.less";

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  licenseKey?: string;
}

const PointsDetailsModal: React.FC<IProps> = ({
  visible,
  setVisible,
  licenseKey,
}) => {
  const intl = useIntl();
  const columnConfig = useColumnConfig();
  const queryConfig = useQueryConfig();

  const defaultQuery = useMemo(() => {
    return licenseKey ? { licenseKey } : {};
  }, [licenseKey]);

  return (
    <ModalSelect
      width={800}
      showSelect={false}
      destroyOnClose
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "points.details",
        defaultMessage: "Point Details",
      })}
      onCancel={() => setVisible(false)}
      renderFooter={() => {
        return (
          <Button type="primary" onClick={() => setVisible(false)}>
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        );
      }}
    >
      <div className={style["modal-table"]}>
        <TableList<IPointsDetails>
          view="main"
          columnConfig={columnConfig}
          queryConfig={queryConfig}
          toolbar={["refresh"]}
          rowSelection={false}
          gql={pointsDetailsList}
          type="PointsDetails"
          resource="pointsDetails"
          rowKey="uuid"
          defaultQuery={defaultQuery}
        />
      </div>
    </ModalSelect>
  );
};

export default PointsDetailsModal;
