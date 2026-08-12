import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { BackupData, BackupDatabase } from "@zstack/zsphere-types/graphql";
import React from "react";

import RecoverDbConfirmModal from "../../components/RecoverDbConfirmModal";
import type { RecoverDatabaseStatus } from "../../components/RecoverDbConsoleModal";
import RecoverDbConsoleModal from "../../components/RecoverDbConsoleModal";

// 处理 wizard 情况
interface IWizardProps {
  onCancel?: () => void;
  getParams?: (password: string) => object;
}

const Action: React.FC<
  IActionWrapperProps<BackupData | BackupDatabase> & IWizardProps
> = (props) => {
  const [consoleVis, setConsoleVis] = React.useState(false);
  const [consoleStatus, setConsoleStatus] =
    React.useState<RecoverDatabaseStatus>();

  const newProps = {
    consoleVis,
    setConsoleVis,
    consoleStatus,
    setConsoleStatus,
    ...props,
  };

  return (
    <>
      {consoleVis && <RecoverDbConsoleModal {...newProps} />}
      <RecoverDbConfirmModal {...newProps} />
    </>
  );
};

export default Action;
