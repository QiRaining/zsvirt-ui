import type { ISelectOption } from "@zstack/zsphere-components";
import { State } from "@zstack/zsphere-components";
import { LogCollectState } from "@zstack/zsphere-types";
import React from "react";
import type { IntlShape } from "react-intl";

const getTypeOptins = (intl: IntlShape) => {
  return [
    {
      label: intl.formatMessage({
        id: "operationLog",
        defaultMessage: "Operation Log",
      }),
      value: "operation",
    },
    {
      label: intl.formatMessage({ id: "auditLog", defaultMessage: "Event Log" }),
      value: "audit",
    },
    {
      label: intl.formatMessage({
        id: "mnLog",
        defaultMessage: "Management Node Log",
      }),
      value: "mn",
    },
    {
      label: intl.formatMessage({
        id: "hostLog",
        defaultMessage: "Compute Node Log",
      }),
      value: "host",
    },
    {
      label: intl.formatMessage({
        id: "psLog",
        defaultMessage: "Data Storage Log",
      }),
      value: "ps",
    },
    {
      label: intl.formatMessage({
        id: "bsLog",
        defaultMessage: "Image Storage Log",
      }),
      value: "bs",
    },
    {
      label: intl.formatMessage({ id: "dbLog", defaultMessage: "Database Log" }),
      value: "mn_db",
    },
  ] as ISelectOption[];
};

const getTimeOptions = (intl: IntlShape) => {
  return [
    {
      label: intl.formatMessage({
        id: "nearly.1.day",
        defaultMessage: "Recent 1 Day",
      }),
      value: "1d",
    },
    {
      label: intl.formatMessage({
        id: "nearly.2.day",
        defaultMessage: "Recent 2 Days",
      }),
      value: "2d",
    },
    {
      label: intl.formatMessage({
        id: "nearly.3.day",
        defaultMessage: "Recent 3 Days",
      }),
      value: "3d",
    },
    {
      label: intl.formatMessage({
        id: "nearly.4.day",
        defaultMessage: "Recent 4 Days",
      }),
      value: "4d",
    },
    {
      label: intl.formatMessage({
        id: "nearly.5.day",
        defaultMessage: "Recent 5 Days",
      }),
      value: "5d",
    },
    {
      label: intl.formatMessage({
        id: "custom.time",
        defaultMessage: "Custom",
      }),
      value: "custom",
    },
  ] as ISelectOption[];
};

const timeMap = new Map([
  ["1h", { amount: 1, unit: "h" }],
  ["4h", { amount: 4, unit: "h" }],
  ["8h", { amount: 8, unit: "h" }],
  ["1d", { amount: 1, unit: "d" }],
  ["2d", { amount: 2, unit: "d" }],
  ["3d", { amount: 3, unit: "d" }],
  ["4d", { amount: 4, unit: "d" }],
  ["5d", { amount: 5, unit: "d" }],
]);

const getStateMap = (intl: IntlShape) => {
  return new Map([
    [
      LogCollectState.SUCCESS,
      <State
        type="success"
        key={LogCollectState.SUCCESS}
        name={intl.formatMessage({
          id: "collect.success",
          defaultMessage: "Succeeded",
        })}
      />,
    ],
    [
      LogCollectState.RUNNING,
      <div>
        <State
          key={LogCollectState.RUNNING}
          type="progress"
          name={intl.formatMessage({
            id: "collecting",
            defaultMessage: "Collecting",
          })}
        />
      </div>,
    ],
    [
      LogCollectState.FAILED,
      <State
        key={LogCollectState.FAILED}
        type="error"
        name={intl.formatMessage({
          id: "collect.failed",
          defaultMessage: "Failed",
        })}
      />,
    ],
  ]);
};

const getTypeMap = (intl: IntlShape) => {
  return new Map([
    ["mn", intl.formatMessage({ id: "mnLog", defaultMessage: "Management Node Log" })],
    [
      "host",
      intl.formatMessage({ id: "hostLog", defaultMessage: "Compute Node Log" }),
    ],
    ["bs", intl.formatMessage({ id: "bsLog", defaultMessage: "Image Storage Log" })],
    ["ps", intl.formatMessage({ id: "psLog", defaultMessage: "Data Storage Log" })],
    [
      "mn_db",
      intl.formatMessage({ id: "dbLog", defaultMessage: "Database Log" }),
    ],
    [
      "operation",
      intl.formatMessage({ id: "operationLog", defaultMessage: "Operation Log" }),
    ],
    [
      "audit",
      intl.formatMessage({ id: "auditLog", defaultMessage: "Event Log" }),
    ],
  ]);
};

export { getTypeOptins, getTimeOptions, getStateMap, getTypeMap, timeMap };
