import { Tooltip } from "@zstack/design";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useActionConfig } from "@zstack/zsphere-engine/src/log-collect";
import { LogCollectState } from "@zstack/zsphere-types";
import type { LogCollect } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { verifyDeleteAllLog } from "../action/validators";

export default () => {
  const intl = useIntl();
  return useActionConfig([
    {
      key: "collect.log",
      primary: true,
      autoInjectPreValidator: false,
      ActionWrapper: require("../action/create").default,
      extraRender: (params) => {
        const { selectedList = [], onClick } = params;
        const hasRunningTask = (selectedList as LogCollect[]).some(
          (item: LogCollect) => item.state === LogCollectState.RUNNING,
        );

        if (hasRunningTask) {
          return (
            <Tooltip
              title={intl.formatMessage({
                id: "log.collect.log.running",
                defaultMessage: "Log collection in progress. Try again after this collection is completed.",
              })}
            >
              <span>
                <Button
                  variant="primary"
                  disabled
                  icon={
                    <Icon
                      style={{ marginRight: 4, verticalAlign: "text-top" }} type="plus"
                    />
                  }
                >
                  <span>
                    {intl.formatMessage({
                      id: "log.collect.log",
                      defaultMessage: "Collect Log",
                    })}
                  </span>
                </Button>
              </span>
            </Tooltip>
          );
        }

        return (
          <Button
            variant="primary"
            onClick={() => onClick()}
            disabled={selectedList?.length >= 3}
            icon={
              <Icon
                style={{
                  marginRight: 4,
                  verticalAlign: "text-top",
                }} type="plus"
              />
            }
          >
            {intl.formatMessage({
              id: "log.collect.log",
              defaultMessage: "Collect Log",
            })}
          </Button>
        );
      },
    },
    {
      key: "delete.all.log",
      preValidators: [verifyDeleteAllLog],
      ActionWrapper: require("../action/delete").default,
    },
  ]);
};
