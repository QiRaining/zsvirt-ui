import { gql } from "@apollo/client";
import List from "@zstack/virtualization-resource/src/pages/host/list";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  Host as IHost,
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

  const [value, onChange] = useState<IHost[]>([]);

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
      { key: "hypervisorType", op: Op.ne, value: "ESX" },
      { key: "uuid", op: Op.notIn, values: oldValue?.split("|") },
    ],
  };

  const onOk = (v: IHost[]) => {
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
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "host.drawer.title.confirm.select.host",
        defaultMessage: "Select Host",
      })}
      value={value}
      onChange={onChange}
      visible={visible}
      setVisible={setVisible}
      showSelect={false}
      selectType="checkbox"
      onOk={onOk}
    >
      <List view="select" defaultQuery={queryParams} />
    </ModalSelect>
  );
};

export default AttachAction;
