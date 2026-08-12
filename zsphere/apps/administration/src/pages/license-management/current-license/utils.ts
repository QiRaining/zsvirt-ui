import type { USBData } from "./types";

export const formatUkeyStatus = (usbData: USBData[]) => {
  const ReadyNum = usbData?.filter((t: any) => t.status === "Ready").length;
  const MissingNum = usbData?.filter((t: any) => t.status === "Missing").length;
  const FaultNum = usbData?.filter((t: any) => t.status === "Fault").length;

  if (ReadyNum === 1 && FaultNum === 0) {
    return "Ready";
  }

  if (ReadyNum > 1 || (ReadyNum >= 1 && FaultNum >= 1)) {
    return "Abnormal";
  }

  if (MissingNum >= 1 && ReadyNum === 0 && FaultNum === 0) {
    return "Missing";
  }

  if (FaultNum >= 1 && ReadyNum === 0) {
    return "Fault";
  }

  return "Ready";
};
