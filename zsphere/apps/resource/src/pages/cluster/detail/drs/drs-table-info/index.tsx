import { RadioGroup } from "@zstack/design";
import { Op } from "@zstack/zsphere-types";
import type { DRS as IDRS } from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import MigrationActivityList from "zsv_shared/migration-activity/list";

import AdviceList from "./advice-list";

import style from "../style.module.less";

interface IProps {
  detail: Partial<IDRS>;
}

const radioGroupStyle = { marginBottom: 12 } as const;

const DrsTableInfo: React.FC<IProps> = ({ detail }) => {
  const intl = useIntl();
  const { uuid, lastAdviceGroupUuid } = detail;
  const [selectedView, setSelectedView] = useState<
    "migrationAdvice" | "migrationActivity"
  >("migrationAdvice");

  return (
    <div className={style.tabContainer}>
      <RadioGroup
        style={radioGroupStyle}
        onValueChange={(value) =>
          setSelectedView(value as "migrationAdvice" | "migrationActivity")
        }
        value={selectedView}
        variant="outline"
        options={[
          {
            value: "migrationAdvice",
            label: intl.formatMessage({
              id: "drs.tableInfo.advice",
              defaultMessage: "DRS Recommendations",
            }),
          },
          {
            value: "migrationActivity",
            label: intl.formatMessage({
              id: "drs.tableInfo.migration",
              defaultMessage: "DRS History",
            }),
          },
        ]}
      />

      {selectedView === "migrationAdvice" && (
        <AdviceList
          view="main"
          defaultQuery={{
            conditions: [
              {
                key: "drsUuid",
                op: Op.eq,
                value: uuid,
              },
              {
                key: "lastAdviceGroupUuid",
                op: Op.eq,
                value: lastAdviceGroupUuid,
              },
            ],
          }}
        />
      )}
      {selectedView === "migrationActivity" && (
        <MigrationActivityList
          view="sub.cluster"
          defaultQuery={{
            conditions: [
              {
                key: "drsUuid",
                op: Op.eq,
                value: uuid,
              },
            ],
          }}
        />
      )}
    </div>
  );
};

export default DrsTableInfo;
