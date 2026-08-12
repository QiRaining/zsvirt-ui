import { useQuery, gql } from "@apollo/client";
import { useMemo } from "react";
import { useIntl } from "react-intl";

const getUSBKeyStatus = gql`
  query getUSBKeyStatus {
    getUSBKeyStatus {
      managementNodeUuid
      status
      keyId
    }
  }
`;

// 使用单个循环替代多次 filter，优化 JavaScript 性能 (js-combine-iterations)
const countStatuses = (usbInfo: any[]) => {
  let ReadyNum = 0;
  let MissingNum = 0;
  let FaultNum = 0;

  for (const item of usbInfo) {
    if (item.status === "Ready") {
      ReadyNum++;
    } else if (item.status === "Missing") {
      MissingNum++;
    } else if (item.status === "Fault") {
      FaultNum++;
    }
  }

  return { ReadyNum, MissingNum, FaultNum };
};

export function useUSBKeyStatusAlertText() {
  const intl = useIntl();

  const { data } = useQuery(getUSBKeyStatus, {
    fetchPolicy: "no-cache",
  });

  const usbInfo = data?.getUSBKeyStatus ?? [];

  // 使用单一循环替代多次 filter，优化性能
  const { ReadyNum, MissingNum, FaultNum } = useMemo(() => {
    return countStatuses(usbInfo);
  }, [usbInfo]);

  const getUkeyStatus = useMemo(() => {
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
  }, [ReadyNum, MissingNum, FaultNum]);

  const checkUSBKeyStatusFaultAlert = useMemo(() => {
    if (getUkeyStatus === "Fault") {
      return intl.formatMessage({
        id: "global.alert.usbKeyStatus.fault",
        defaultMessage: `The USB key status is fault because you might have multiple USB keys plugged in. Please check and remove the extra USB keys.`,
      });
    }
    return null;
  }, [getUkeyStatus, intl]);

  const checkUSBKeyStatusAbnormalAlert = useMemo(() => {
    if (getUkeyStatus === "Abnormal") {
      return intl.formatMessage({
        id: "global.alert.usbKeyStatus.abnormal",
        defaultMessage: `The USB key status is abnormal because you might have multiple USB keys plugged in. Please check and remove the extra USB keys.`,
      });
    }
    return null;
  }, [getUkeyStatus, intl]);

  return {
    checkUSBKeyStatusFaultAlert,
    checkUSBKeyStatusAbnormalAlert,
  };
}
