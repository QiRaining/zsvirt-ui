import { Button } from "@zstack/design";
// import { useWizardStore } from '@zstack/virtualization-wizard/src/layouts/wizard-container/wizard-container';
import { Icon } from "@zstack/icon";
import { useSetTab } from "@zstack/zsphere-components";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import type { TabContentProps } from "../types";

import style from "../style.module.less";

const TabContent: React.FC<TabContentProps> = ({ currentTab, intl }) => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  // TODO zsv migration
  // const reset = useWizardStore((state) => state.reset);
  const handleConfirmRef = useRef<(value: boolean) => void>();
  const { setTab } = useSetTab();

  let url: string;
  if (currentTab === "operation-log") {
    url = "/virtualization-monitoring-om/operation-log";
  } else {
    url = "/virtualization-monitoring-om/alarm-message";
  }

  let alarmMessageTab = "";
  if (currentTab === "storageAlarmMessage") {
    alarmMessageTab = "storageAlarmMessage";
  } else if (currentTab === "alarm-message") {
    alarmMessageTab = "platformAlarmMessage";
  }

  return (
    <div>
      <span className={style["more-task-prefix"]}>
        {intl.formatMessage({
          id: "alarm.message.only.show.50.items",
          defaultMessage: "Show only the last 50 entries.",
        })}
      </span>
      <Button
        style={{ padding: 0 }}
        variant="link"
        onClick={async () => {
          if (location.pathname.startsWith("/virtualization-wizard")) {
            const result = await new Promise<boolean>((resolve) => {
              handleConfirmRef.current = resolve;
              setVisible(true);
            });
            handleConfirmRef.current = undefined;
            if (!result) {
              return;
            }
            // TODO zsv migration
            // reset();
          }
          if (alarmMessageTab) {
            // @ts-expect-error
            window.needClearTab = false;
            setTab("main-tab", alarmMessageTab, "/alarm-message");
          }
          navigate({ pathname: url, search: location.search || "" } as any);
        }}
        className={style["more-task"]}
      >
        {intl.formatMessage({ id: "see.more", defaultMessage: "More" })}
        <Icon size={16} type="external-link" />
      </Button>
      <DialogWeak
        visible={visible}
        setVisible={setVisible}
        type="warning"
        title={intl.formatMessage({
          id: "wizard.quit.confirm",
          defaultMessage: "Exit Manual Initialization?",
        })}
        description={intl.formatMessage({
          id: "wizard.quit.modal.confirm.detail",
          defaultMessage:
            "Exiting will cancel all resource creation. If the platform has no resources, you can restart initialization using the wizard later.",
        })}
        onConfirm={() => handleConfirmRef.current?.(true)}
        onCancel={() => handleConfirmRef.current?.(false)}
      />
    </div>
  );
};

export default TabContent;
