import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { Identity } from "@zstack/zsphere-types";
import { useCallback } from "react";

import { genResponsiveLayouts } from "../utils/gen-responsive-layouts";

//这份配置写不求行，很难懂
// layouts和widgets是分开的，layouts是布局，widgets是组件，w、h、x、y要看layouts里的，是真实的位置，widget里是具体的组件
const adminRoleList = [
  Identity.Admin,
  Identity.PlatformAdmin,
  Identity.PlatformUser,
];

const accountRoleList = ["AccountNormalUser", "NormalAccount"];

const useDefaultConfig = () => {
  const { currentUser } = usePlatformStore();
  const { currentIdentity } = currentUser;

  const getDefaultWidget = useCallback(() => {
    if (adminRoleList.includes(currentIdentity as Identity)) {
      const layouts = {
        lg: [
          {
            w: 2,
            h: 1,
            x: 0,
            y: 2,
            i: "001",
            moved: false,
            static: false,
          },
          {
            w: 2,
            h: 1,
            x: 2,
            y: 1,
            i: "002",
            moved: false,
            static: false,
          },
          {
            w: 2,
            h: 1,
            x: 0,
            y: 1,
            i: "003",
            moved: false,
            static: false,
          },
          {
            w: 2,
            h: 2,
            x: 2,
            y: 4,
            i: "004",
            moved: false,
            static: false,
          },
          {
            w: 2,
            h: 2,
            x: 0,
            y: 4,
            i: "005",
            moved: false,
            static: false,
          },
          {
            w: 2,
            h: 1,
            x: 4,
            y: 4,
            i: "006",
            moved: false,
            static: false,
          },
          {
            w: 2,
            h: 1,
            x: 4,
            y: 5,
            i: "007",
            moved: false,
            static: false,
          },
          {
            w: 2,
            h: 2,
            x: 4,
            y: 1,
            i: "008",
            moved: false,
            static: false,
          },
          {
            w: 2,
            h: 1,
            x: 2,
            y: 2,
            i: "009",
            moved: false,
            static: false,
          },

          {
            w: 2,
            h: 1,
            x: 2,
            y: 0,
            i: "011",
            moved: false,
            static: false,
          },
          {
            w: 2,
            h: 1,
            x: 4,
            y: 0,
            i: "012",
            moved: false,
            static: false,
          },

          {
            w: 2,
            h: 1,
            x: 0,
            y: 0,
            i: "015",
            moved: false,
            static: false,
          },

          // {
          //   w: 2,
          //   h: 1,
          //   x: 4,
          //   y: 3,
          //   i: '018',
          //   moved: false,
          //   static: false
          // },
        ],
      };
      const widgets = [
        {
          type: "usage-statistics",
          uuid: "001",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 1,
          },
          props: {
            type: "usage-statistics",
            statisticsResource: "primaryStorage",
            monitorItem: "actualUsedRate",
          },
        },
        {
          type: "usage-statistics",
          uuid: "002",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 1,
          },
          props: {
            type: "usage-statistics",
            statisticsResource: "memory",
            monitorItem: "actualUsedRate",
          },
        },
        {
          type: "usage-statistics",
          uuid: "003",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 1,
          },
          props: {
            type: "usage-statistics",
            statisticsResource: "cpu",
            monitorItem: "actualUsedRate",
          },
        },
        {
          type: "top-monitor",
          uuid: "004",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 1,
          },
          props: {
            type: "top-monitor",
            topResource: "vm-in",
            limit: 10,
            topMetricName: "OperatingSystemMemoryUsedPercent",
          },
        },
        {
          type: "top-monitor",
          uuid: "005",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 2,
          },
          props: {
            type: "top-monitor",
            topResource: "vm-in",
            limit: 10,
            topMetricName: "OperatingSystemCPUAverageUsedUtilization",
          },
        },
        {
          type: "top-monitor",
          uuid: "006",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 1,
          },
          props: {
            type: "top-monitor",
            topResource: "host",
            limit: 3,
            topMetricName: "MemoryUsedInPercent",
          },
        },
        {
          type: "top-monitor",
          uuid: "007",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 1,
          },
          props: {
            type: "top-monitor",
            topResource: "host",
            limit: 3,
            topMetricName: "CPUAverageUsedUtilization",
          },
        },
        {
          type: "alarm-info",
          uuid: "008",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 2,
          },
          props: {
            type: "alarm-info",
          },
        },
        {
          type: "usage-statistics",
          uuid: "009",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 1,
          },
          props: {
            type: "usage-statistics",
            statisticsResource: "backupStorage",
          },
        },

        {
          type: "state-monitor",
          uuid: "011",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 1,
          },
          props: {
            type: "state-monitor",
            resource: "host",
          },
        },
        {
          type: "user-info",
          uuid: "012",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 1,
          },
          props: {
            type: "user-info",
          },
        },
        {
          type: "state-monitor",
          uuid: "015",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 1,
          },
          props: {
            type: "state-monitor",
            resource: "vmInstance",
          },
        },
      ];

      return {
        layouts: genResponsiveLayouts(layouts.lg, "012"),
        widgets,
      };
    }

    if (accountRoleList.includes(currentIdentity as string)) {
      const layouts = {
        lg: [
          {
            w: 2,
            h: 2,
            x: 2,
            y: 1,
            i: "001",
            moved: false,
            static: false,
          },
          {
            w: 2,
            h: 1,
            x: 0,
            y: 2,
            i: "002",
            moved: false,
            static: false,
          },
          {
            w: 2,
            h: 1,
            x: 0,
            y: 1,
            i: "003",
            moved: false,
            static: false,
          },
          {
            w: 2,
            h: 2,
            x: 4,
            y: 3,
            i: "004",
            moved: false,
            static: false,
          },
          {
            w: 2,
            h: 2,
            x: 2,
            y: 3,
            i: "005",
            moved: false,
            static: false,
          },
          {
            w: 2,
            h: 2,
            x: 0,
            y: 3,
            i: "006",
            moved: false,
            static: false,
          },
          {
            w: 2,
            h: 1,
            x: 4,
            y: 0,
            i: "007",
            moved: false,
            static: false,
          },
          {
            w: 2,
            h: 2,
            x: 4,
            y: 1,
            i: "008",
            moved: false,
            static: false,
          },
          {
            w: 1,
            h: 1,
            x: 3,
            y: 0,
            i: "009",
            moved: false,
            static: false,
          },
          {
            w: 1,
            h: 1,
            x: 2,
            y: 0,
            i: "010",
            moved: false,
            static: false,
          },
          {
            w: 2,
            h: 1,
            x: 0,
            y: 0,
            i: "011",
            moved: false,
            static: false,
          },
        ],
      };
      const widgets = [
        {
          type: "top-monitor",
          uuid: "001",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 2,
          },
          props: {
            type: "quota-usage",
            quotaUsageType: "computing",
          },
        },
        {
          type: "top-monitor",
          uuid: "002",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 1,
          },
          props: {
            type: "top-monitor",
            topResource: "vm-in",
            limit: 3,
            topMetricName: "OperatingSystemMemoryUsedPercent",
          },
        },
        {
          type: "top-monitor",
          uuid: "003",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 1,
          },
          props: {
            type: "top-monitor",
            topResource: "vm-in",
            limit: 3,
            topMetricName: "OperatingSystemCPUAverageUsedUtilization",
          },
        },
        {
          type: "quota-usage",
          uuid: "004",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 2,
          },
          props: {
            type: "quota-usage",
            quotaUsageType: "other",
          },
        },
        {
          type: "quota-usage",
          uuid: "005",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 2,
          },
          props: {
            type: "quota-usage",
            quotaUsageType: "network",
          },
        },
        {
          type: "quota-usage",
          uuid: "006",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 2,
          },
          props: {
            type: "quota-usage",
            quotaUsageType: "storage",
          },
        },
        {
          type: "user-info",
          uuid: "007",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 1,
          },
          props: {
            type: "user-info",
          },
        },
        {
          type: "alarm-info",
          uuid: "008",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 2,
          },
          props: {
            type: "alarm-info",
          },
        },
        {
          type: "usage-statistics",
          uuid: "009",
          gridData: {
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
          props: {
            type: "usage-statistics",
            statisticsResource: "memory",
          },
        },
        {
          type: "usage-statistics",
          uuid: "010",
          gridData: {
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
          props: {
            type: "usage-statistics",
            statisticsResource: "cpu",
          },
        },
        {
          type: "state-monitor",
          uuid: "011",
          gridData: {
            x: 0,
            y: 0,
            w: 2,
            h: 1,
          },
          props: {
            type: "state-monitor",
            resource: "vmInstance",
          },
        },
      ];
      return {
        layouts: genResponsiveLayouts(layouts.lg, "007"),
        widgets,
      };
    }

    return {};
  }, [currentIdentity]);

  return {
    getDefaultWidget,
  };
};

export default useDefaultConfig;
