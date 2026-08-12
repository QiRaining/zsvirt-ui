import type { OperationApi } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import { useIntl } from "react-intl";

import { OperationApiStatus } from "../../components/operation-status";

import style from "../style.module.less";

interface IProps {
  operationApi: OperationApi;
  showApiDetail: (operationApi: OperationApi) => void;
}

export const CurrentApiListTile: FC<IProps> = ({
  operationApi,
  showApiDetail,
}) => {
  const intl = useIntl();
  return (
    <div className="flex">
      <div className="w-[50%]">
        <OperationApiStatus operationApi={operationApi} />
      </div>
      <div className="w-[50%]">
        <span
          className={style.api}
          onClick={() => {
            showApiDetail(operationApi);
          }}
        >
          {intl.formatMessage({ id: "check", defaultMessage: "View" })}
        </span>
      </div>
    </div>
  );
};
