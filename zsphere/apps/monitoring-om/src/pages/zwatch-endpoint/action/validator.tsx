import { gql } from "@apollo/client";
import {
  ZWatchAlarmQueryType as IZWatchAlarmQueryType,
  EndPointType as IEndPointType,
  Op,
} from "@zstack/zsphere-types";
import type { EndPoint as IEndPoint } from "@zstack/zsphere-types/graphql";

import { supportedTestConnectEndPointType } from "../components";

const { apolloClient } = window.g_main;

// 单选
export const verifySingleSelect = (selectedList: IEndPoint[]): boolean => {
  return selectedList.length === 1;
};

// 单选
export const verifyMultiSelect = (selectedList: IEndPoint[]): boolean => {
  return selectedList.length >= 1;
};

// 编辑
export const verifyEdit = (current: IEndPoint) => {
  return current?.type !== "SYSTEM_HTTP";
};

// 启用
export const verifyStart = (current: IEndPoint) => {
  return ["Disabled"].includes(current?.state || "");
};

// 停用
export const verifyStop = (current: IEndPoint) => {
  return ["Enabled"].includes(current?.state || "");
};

// 删除
export const verifyDelete = (selectedList: IEndPoint[]): boolean => {
  if (selectedList?.length > 0) {
    const uuids = selectedList.filter(
      ({ type }) => type === IEndPointType.SYSTEM_HTTP,
    );
    return !uuids.length;
  }
  return false;
};

// 移除报警器
export const verifyRemoveAlarm = async (current: IEndPoint) => {
  const topicUuid = current?.topic?.uuid;
  if (!topicUuid) {
    return false;
  }
  // 判断topic关联的资源
  const resourceAlarmResp = await apolloClient.query({
    query: gql`
      query zwatchAlarmList(
        $conditions: [Condition!]
        $type: ZWatchAlarmQueryType
      ) {
        zwatchAlarmList(conditions: $conditions, type: $type) {
          list {
            uuid
            name
          }
        }
      }
    `,
    variables: {
      type: IZWatchAlarmQueryType.Resource,
      conditions: [
        {
          key: "actions.actionUuid",
          op: Op.eq,
          value: topicUuid,
        },
      ],
    },
  });
  const eventAlarmResp = await apolloClient.query({
    query: gql`
      query zwatchAlarmList(
        $conditions: [Condition!]
        $type: ZWatchAlarmQueryType
      ) {
        zwatchAlarmList(conditions: $conditions, type: $type) {
          list {
            uuid
            name
          }
        }
      }
    `,
    variables: {
      type: IZWatchAlarmQueryType.Event,
      conditions: [
        {
          key: "actions.actionUuid",
          op: Op.eq,
          value: topicUuid,
        },
      ],
    },
  });
  const thirdPartyAlarmResp = await apolloClient.query({
    query: gql`
      query zwatchAlarmList(
        $conditions: [Condition!]
        $type: ZWatchAlarmQueryType
      ) {
        zwatchAlarmList(conditions: $conditions, type: $type) {
          list {
            uuid
            name
          }
        }
      }
    `,
    variables: {
      type: IZWatchAlarmQueryType.Thirdparty,
      conditions: [
        {
          key: "actions.actionUuid",
          op: Op.eq,
          value: topicUuid,
        },
      ],
    },
  });
  const resourceAlarmList =
    resourceAlarmResp?.data?.zwatchAlarmList?.list || [];
  const eventAlarmList = eventAlarmResp?.data?.zwatchAlarmList?.list || [];
  const thirdPartyAlarmList =
    thirdPartyAlarmResp?.data?.zwatchAlarmList?.list || [];
  const zwatchAlarmList = resourceAlarmList.concat(
    eventAlarmList.concat(thirdPartyAlarmList),
  );
  if (!zwatchAlarmList || zwatchAlarmList?.length === 0) {
    return false;
  }
  if (zwatchAlarmList?.length === 1) {
    const isSystemTopic = ["e7d6f5e23bb74e99a2777126078b551c"].includes(
      topicUuid,
    );
    if (isSystemTopic) {
      return true;
    }
    const systemAlarmList = [
      "65e8f1a4892231b692cc7a881581f3da", // License Expired Alarm
      "5d3bb9d271a349b283893317f531f723", // ZStack Host Root Disk Used Capacity Alarm
      "b632652cc16044cdb6b4f516ed93a118", // ZStack Data Directory Capacity Alarm
      "66dfdee6fd314aac96ca3779774ad977", // ZStack Primary Storage Available Capacity Alarm
      "ded02f9786444c6296e9bc3efb8eb484", // ZStack Primary Storage Physical Available Capacity Alarm
      "44e6f054a59a451fb1b535accff64fc2", // ZStack Backup Storage Available Capacity Alarm
      "d59397479d2548d7abfe4ad31a575390", // VRouter Disconnected
      "98f9c802604e4852bd84716f66cf4f73", // Backup Storage Disconnected
      "8eca1096feb34419913087d2b281ecec", // Management Node Left
      "5e75230bd2ea4f47abf6ff92fa816a20", // Primary Storage Disconnected
      "55365763fed244c39b4642bef6c5daf9", // Backup storage connection event Alarm
      "f56795b8c34b452f84bcf25cb89bded2", // Primary storage connection event Alarm
      "10d9c4e69fc2456bb8c6c6d456bb5038", // Management node join event Alarm
      "98h262f95c1987fg2ba1be4a3562765f", // Cdp task failed event alarm
      "14a991d4d7d54a66b14e398ffc510bd6", // Sending Sms Failure Event Alarm
      "39d2b6689efa4e4a96c239716cb6f3ea", // VRouter connected event alarm
      "4a3cb114b10d41e19545ab693222c134", // Host disconnect event alarm
      "1a7a3eb433904df89f5c42a1fa4e0716", // Host connected event alarm
      "e47db726090c47de84521bebc640cfc2", // Volume (100GB and above) Fragmentation Level (Total Number of Extents) Alarm
      "bf7359930ee444d286fb88d2e51acf51", // Host XFS File System Fragmentation Level in Percent Alarm
      "065f9609dce141bb952c80f729f58af4", // Database fencer IP not reachable event Alarm
      "712c3dec6aa94ed2b3bcd32192c22f69", // Database synchronization event Alarm
    ];
    const isSystemAlarm = systemAlarmList.some((item) =>
      zwatchAlarmList.some((uuid: string) => item === uuid),
    );
    if (isSystemAlarm) {
      return false;
    }
  }
  return true;
};

// 测试短信
export const verifyTestMessage = (current: IEndPoint) => {
  return current?.type === "AliyunSms";
};

// 测试是否能发送测试信息
export const verifySendTestMessage = (current: IEndPoint) => {
  return supportedTestConnectEndPointType.includes(
    current?.type as IEndPointType,
  );
};
