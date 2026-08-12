import { Icon } from "@zstack/icon";
import { ModalSelect, TableList } from "@zstack/zsphere-components";
import { useQueryConfig } from "@zstack/zsphere-engine/src/module-authorization-details";
import type { ModuleAuthorizationDetails as IModuleAuthorizationDetails } from "@zstack/zsphere-types/graphql";
import { Button, Tooltip } from "antd";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { moduleAuthorizationDetailsList } from "../../../../gql/module-authorization-details.gql";
import { useColumnConfig } from "./module-authorization-details-config/index";
import PointsDetailsModal from "./points-details-modal";

import style from "./style.module.less";

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  addonData?: any;
}

const ModuleAuthorizationDetailsModal: React.FC<IProps> = ({
  visible,
  setVisible,
}) => {
  const intl = useIntl();
  const [pointsDetailVisible, setPointsDetailVisible] = useState(false);
  const [selectedLicenseKey, setSelectedLicenseKey] = useState<string>("");
  const baseColumnConfig = useColumnConfig();
  const queryConfig = useQueryConfig();

  const columnConfig = useMemo(() => {
    if (!baseColumnConfig) {
      return baseColumnConfig;
    }

    const actionColumn = {
      title: intl.formatMessage({
        id: "action",
        defaultMessage: "Actions",
      }),
      i18nKey: "__action__",
      key: "__action__",
      width: 52,
      align: "center" as const,
      render: (_: unknown, record: IModuleAuthorizationDetails) => (
        <Tooltip
          title={intl.formatMessage({
            id: "points.details",
            defaultMessage: "Point Details",
          })}
        >
          <Icon
            type="file-text"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setSelectedLicenseKey(record?.key ?? "");
              setPointsDetailVisible(true);
            }}
          />
        </Tooltip>
      ),
    };

    return {
      ...baseColumnConfig,
      list: [...(baseColumnConfig.list || []), actionColumn],
      viewMap: {
        ...baseColumnConfig.viewMap,
        main: [...(baseColumnConfig.viewMap?.main || []), "__action__"],
      },
    };
  }, [baseColumnConfig, intl]);

  return (
    <>
      <ModalSelect
        width={800}
        visible={visible}
        setVisible={setVisible}
        showSelect={false}
        destroyOnClose
        title={intl.formatMessage({
          id: "module.authorization.details",
          defaultMessage: "Plus License Details",
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
          <TableList<IModuleAuthorizationDetails>
            view="main"
            columnConfig={columnConfig}
            queryConfig={queryConfig}
            toolbar={["refresh"]}
            rowSelection={false}
            gql={moduleAuthorizationDetailsList}
            type="ModuleAuthorizationDetails"
            resource="moduleAuthorizationDetails"
            rowKey="uuid"
          />
        </div>
      </ModalSelect>

      <PointsDetailsModal
        visible={pointsDetailVisible}
        setVisible={setPointsDetailVisible}
        licenseKey={selectedLicenseKey}
      />
    </>
  );
};

export default ModuleAuthorizationDetailsModal;
