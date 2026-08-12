import { Text } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

// Style constants
const MARGIN_BOTTOM_20_STYLE = { marginBottom: 20 } as const;

interface IProps {
  form: any;
  source?: any;
}

const BackupInfo: React.FC<IProps> = ({ source }) => {
  const intl = useIntl();

  return (
    <div className={style.card}>
      <div className={style.title}>
        <div className={style.rect} />
        <div className={style.text}>
          {intl.formatMessage({
            id: "backup.info",
            defaultMessage: "Backup Info",
          })}
        </div>
      </div>
      <Form.Item
        label={intl.formatMessage({
          id: "backup.data",
          defaultMessage: "Backup Data",
        })}
        name="backupDataName"
        style={MARGIN_BOTTOM_20_STYLE}
      >
        <Text>{source?.name}</Text>
      </Form.Item>
    </div>
  );
};

export default React.memo(BackupInfo);
