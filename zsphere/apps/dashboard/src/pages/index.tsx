import { Button } from "@zstack/design";
import { customRenderEmpty } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import classnames from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import CreateVmInstance from "zsv_resource/vm/create";
import { useShallow } from "zustand/react/shallow";

import { Header } from "../components/header";
import useDefaultConfig from "../constant/defaultWidget";
import type { SavedDataProps } from "../interface/saved-data-props";
import { useDashboardStore } from "../store/use-dashboard-store";
import GridLayout from "./grid-layout";

import style from "./style.module.less";

interface IProps {}

const Dashboard: React.FC<IProps> = () => {
  const intl = useIntl();

  const { getDefaultWidget } = useDefaultConfig();

  const ref = React.useRef(null);

  const [selectedZoneUuid] = useDashboardStore(
    useShallow((state) => [state.zoneUuid]),
  );
  const [showWizardSuccessModal, setShowWizardSuccessModal] = useState(false);
  const [showCreateVmModal, setShowCreateVmModal] = useState(false);
  useEffect(() => {
    const showWizardSuccessModal = sessionStorage.getItem(
      "showWizardSuccessModal",
    );
    if (showWizardSuccessModal) {
      setShowWizardSuccessModal(true);
      sessionStorage.removeItem("showWizardSuccessModal");
    }
  }, []);
  const defaultLayoutConfig = useMemo(() => {
    return getDefaultWidget() as SavedDataProps;
  }, [getDefaultWidget]);

  return (
    <div className={classnames([style.main, style.customizeMain])}>
      <div className={style.container} ref={ref}>
        <Header />
        <GridLayout data={defaultLayoutConfig} isEditable={false} />
        {defaultLayoutConfig?.widgets?.length === 0 && (
          <div className={style.empty}>
            {customRenderEmpty({
              type: "Table",
              description: intl.formatMessage({
                id: "noContentWidget",
                defaultMessage: "No Content Widget",
              }),
            })}
          </div>
        )}
      </div>
      <DialogBase
        title={intl.formatMessage({
          id: "wizard.success.modal.title",
          defaultMessage: "Manual Initialization Complete",
        })}
        visible={showWizardSuccessModal}
        setVisible={setShowWizardSuccessModal}
        footer={
          <>
            <Button
              variant="link"
              onClick={() => {
                setShowWizardSuccessModal(false);
              }}
            >
              {intl.formatMessage({
                id: "operation.cancel",
                defaultMessage: "Cancel",
              })}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowWizardSuccessModal(false);
                setShowCreateVmModal(true);
              }}
            >
              {intl.formatMessage({
                id: "auto.init.success.onOkText.with.network",
                defaultMessage: "New Virtual Machine",
              })}
            </Button>
          </>
        }
      >
        {intl.formatMessage({
          id: "wizard.success.modal.detail",
          defaultMessage:
            "You have completed the necessary resource creations for environment initialization. You may now start using the platform.",
        })}
      </DialogBase>
      {selectedZoneUuid && (
        <CreateVmInstance
          visible={showCreateVmModal}
          setVisible={setShowCreateVmModal}
          view="create"
          selectedList={[]}
          position="header"
          source={{ uuid: selectedZoneUuid, __typename: "Zone" }}
        />
      )}
    </div>
  );
};
export default Dashboard;
