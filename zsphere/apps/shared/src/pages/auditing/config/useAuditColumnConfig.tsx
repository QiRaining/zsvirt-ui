import { useTime } from "@zstack/hooks";
import { Constant } from "@zstack/zsphere-components";
import { ConstantEnum, ConstantType } from "@zstack/zsphere-constant";
import type { IOption } from "@zstack/zsphere-engine/src/auditing/useColumnConfig";
import useColumnConfig from "@zstack/zsphere-engine/src/auditing/useColumnConfig";
import { mergeOptions } from "@zstack/zsphere-engine/utils";
import type { Audit as IAudit } from "@zstack/zsphere-types/graphql";
import { capitalize } from "lodash-es";
import { useIntl } from "react-intl";

import Detail from "../detail/detail-modal";
import useSecToTime from "../list/useSecToTime";

import style from "./style.module.less";

export default (view: string, options: IOption<IAudit> = []) => {
  const intl = useIntl();
  const { transferSecToTime } = useSecToTime();
  const { getServerTime } = useTime();

  return useColumnConfig<IAudit>(
    mergeOptions(
      [
        {
          key: "apiName",
          gqlKey: ["apiName"],
          render: (row) => <Detail row={row} view={view} />,
          exportToCSVRender: (row) => row.apiName,
        },
        {
          key: "duration",
          formatter: (row) => transferSecToTime(row.duration || 0),
          exportToCSVRender: (row) => transferSecToTime(row.duration || 0),
        },
        {
          key: "isError",
          render: (row) => {
            return row.isError ? (
              <Constant
                value={ConstantEnum.Failed}
                enumType={ConstantType.OperationLogState}
              />
            ) : (
              <Constant
                value={ConstantEnum.Success}
                enumType={ConstantType.OperationLogState}
              />
            );
          },
          filterOptions: {
            Success: "Success",
            Failed: "Failed",
          },
          filterEnumType: ConstantType.OperationLogState,
          exportToCSVRender: (row) =>
            row.isError
              ? intl.formatMessage({ id: "failed", defaultMessage: "Failed" })
              : intl.formatMessage({ id: "success", defaultMessage: "Succeeded" }),
        },
        {
          key: "operatorAccountName",
          gqlKey: ["operatorAccountName", "operator"],
          formatter: (row: IAudit) =>
            row.operatorAccountName ||
            `${row.operator} (${intl.formatMessage({ id: "deleted", defaultMessage: "Deleted" })})`,
          exportToCSVRender: (row: IAudit) =>
            row.operatorAccountName ||
            `${row.operator} (${intl.formatMessage({ id: "deleted", defaultMessage: "Deleted" })})`,
        },
        {
          key: "operatorAccountNameForLogin",
          gqlKey: ["operatorAccountName", "operator"],
          formatter: (row: IAudit) =>
            row.operatorAccountName || row.operator || "-",
          exportToCSVRender: (row: IAudit) =>
            row.operatorAccountName || row.operator || "-",
        },
        {
          key: "clientBrowser",
          gqlKey: ["clientBrowser"],
          formatter: (row: IAudit) => {
            return row.clientBrowser ? (
              capitalize(row.clientBrowser)
            ) : (
              <span className={style.noknown}>
                {intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" })}
              </span>
            );
          },
          exportToCSVRender: (row) =>
            row.clientBrowser
              ? capitalize(row.clientBrowser)
              : intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" }),
        },
        {
          key: "clientIp",
          formatter: (row: IAudit) =>
            row.clientIp || (
              <span className={style.noknown}>
                {intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" })}
              </span>
            ),
          exportToCSVRender: (row) =>
            row.clientIp ||
            intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" }),
        },
        {
          key: "resourceType",
          formatter: (row: IAudit) =>
            row.resourceType || (
              <span className={style.noknown}>
                {intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" })}
              </span>
            ),
          exportToCSVRender: (row) =>
            row.resourceType ||
            intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" }),
        },
        {
          key: "createTime",
          formatter: (row) =>
            getServerTime(row.createTime).format("YYYY-MM-DD HH:mm:ss"),
          exportToCSVRender: (row) =>
            getServerTime(row.createTime).format("YYYY-MM-DD HH:mm:ss"),
        },
        {
          key: "time",
          formatter: (row) =>
            getServerTime(row.time).format("YYYY-MM-DD HH:mm:ss"),
          exportToCSVRender: (row) =>
            getServerTime(row.time).format("YYYY-MM-DD HH:mm:ss"),
        },
      ],
      options,
    ),
  );
};
