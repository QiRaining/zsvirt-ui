import { Button } from "@zstack/design";
import { useActionConfig } from "@zstack/zsphere-engine/src/scheduler-job-history";
import React from "react";
import { useIntl } from "react-intl";

export default (setSelectedList: Function, setDetailVisible: Function) => {
  const intl = useIntl();

  const onClick = (selectedList: any) => {
    setDetailVisible(true);
    setSelectedList(selectedList);
  };

  return useActionConfig([
    {
      key: "backup.job.history.detail",
      autoInjectPreValidator: false,
      extraRender: (params) => {
        return (
          <Button variant="link" onClick={() => onClick(params.selectedList)}>
            {intl.formatMessage({
              id: "check.backup.job.history.detail",
              defaultMessage: "View Details",
            })}
          </Button>
        );
      },
    },
  ]);
};
