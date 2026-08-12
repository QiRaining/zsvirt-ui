import { gql } from "@apollo/client";
import List from "@zstack/virtualization-resource/src/pages/backup-storage/list";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  BackupStorage as IBackupStorage,
  ZWatchAlarmVO as IZWatchAlarmVO,
} from "@zstack/zsphere-types/graphql";
import { uniq as _uniq } from "lodash-es";
import React, { useState } from "react";
import { useIntl } from "react-intl";

const AttachAction: React.FC<IActionWrapperProps<IZWatchAlarmVO>> = ({
  source,
  visible,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const [value, onChange] = useState<IBackupStorage[]>([]);

  const updateAlarmLabel = gql`
    mutation updateAlarmLabel($input: UpdateAlarmLabelInput!) {
      updateAlarmLabel(input: $input) {
        actionId
      }
    }
  `;

  const labels = source?.labels;
  const key = labels?.[0]?.key;
  const labelUuid = labels[0].uuid;
  const oldValue = labels[0].value;

  const queryParams = {
    conditions: [
      {
        key: "__systemTag__",
        op: Op.notIn,
        values: ["remote", "onlybackup", "aliyun", "remotebackup"],
      },
      { key: "uuid", op: Op.notIn, values: oldValue?.split("|") },
    ],
  };

  const onOk = (v: IBackupStorage[]) => {
    const selectedUuids = v?.map((cv) => cv?.uuid);
    const _value = _uniq(oldValue.split("|").concat(selectedUuids)).join("|");
    const payload = {
      uuid: labelUuid,
      key,
      value: _value,
      operator: "Regex",
    };
    doAction({
      mutation: updateAlarmLabel,
      payload,
      name: intl.formatMessage({
        id: "add.resource",
        defaultMessage: "Add Resource",
      }),
      total: 1,
      onProgress: () => {},
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "select.backupStorage",
        defaultMessage: "Select Image Storage",
      })}
      value={value}
      onChange={onChange}
      visible={visible}
      setVisible={setVisible}
      showSelect={false}
      selectType="checkbox"
      onOk={onOk}
      resourceName={source?.name}
    >
      <List view="select" defaultQuery={queryParams} />
    </ModalSelect>
  );
};

export default AttachAction;
