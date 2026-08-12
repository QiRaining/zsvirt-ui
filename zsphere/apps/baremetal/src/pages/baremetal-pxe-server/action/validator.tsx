import type { BaremetalPxeServer as IBaremetalPxeServer } from "@zstack/zsphere-types/graphql";

// verifySingle
const verifySingle = async (selectedList: IBaremetalPxeServer[]) => {
  return selectedList.length === 1;
};
// verifySelect
const verifySelect = async (selectedList: IBaremetalPxeServer[]) => {
  return selectedList.length > 0;
};
// 启动
const verifyStart = async (current: IBaremetalPxeServer) => {
  return current?.state !== "Enabled";
};

// 停止
const verifyStop = async (current: IBaremetalPxeServer) => {
  return current.state !== V2VConversionHostState.Disabled;
};

const verifyClusterAttachPxeserver = async (current: IBaremetalPxeServer) => {
  return (
    !current?.attachedClusterUuids || current?.attachedClusterUuids?.length <= 0
  );
};

export {
  verifySingle,
  verifyStart,
  verifyStop,
  verifySelect,
  verifyClusterAttachPxeserver,
};
