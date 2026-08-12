import { renderType } from "@zstack/virtualization-resource/src/pages/backup-storage/components/common";
import { Form, InputDebounce } from "@zstack/zsphere-components";
import { TextArea } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "./style.module.less";

interface IProps {
  form: any;
  current?: IBackupStorage;
}

const { Item } = Form;

const BasicPart: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const { commonNameRules, longDescriptionRules } = useValidator(intl);
  const { type, zone } = current || {};

  return (
    <div className={style.card}>
      <div className={style.title}>
        <div className={style.rect} />
        <div className={style.text}>
          {intl.formatMessage({ id: "basic.info", defaultMessage: "Basic Info" })}
        </div>
      </div>
      <Item
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        name="name"
        rules={commonNameRules}
      >
        <InputDebounce className={style["width-320"]} />
      </Item>

      <Item
        name="description"
        label={intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        })}
        rules={longDescriptionRules}
      >
        <TextArea
          rows={3}
          isShowLimit
          maxLength={2000}
          limit={2000}
          className={style["width-320"]}
        />
      </Item>

      <Item
        name="type"
        label={intl.formatMessage({
          id: "backupStorage.type",
          defaultMessage: "Type",
        })}
        textFormItem
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "backupStorage.field.type.tooltip",
              defaultMessage: `### Type

- Standalone Image Storage: Store image files through image slices and support incremental storage.

- Distributed Image Storage: Store image files through distributed block storage.`,
            })}
          </ReactMarkdown>
        }
      >
        {renderType(type!, intl)}
      </Item>
      <Item
        label={intl.formatMessage({
          id: "data.center",
          defaultMessage: " Data Center",
        })}
      >
        {zone?.name}
      </Item>
    </div>
  );
};

export default React.memo(BasicPart);
