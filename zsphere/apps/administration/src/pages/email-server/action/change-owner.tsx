import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  AccountVO,
  ChangeResourceOwnerPayload as IChangeResourceOwnerPayload,
  EmailServerSetting as IEmailServerSetting,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import { map as _map } from "lodash-es";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import { changeResourceOwner } from "../../../gql/email-server-setting.gql";
import List from "../../account-information/user/list";

const ChangeOwnerAction: React.FC<IActionWrapperProps<IEmailServerSetting>> = ({
  visible,
  refetch,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [value, setValue] = useState<AccountVO[]>([]);
  let checkValue: AccountVO[] = [];

  const resourceUuids = _map(selectedList, "uuid");

  const queryParams = {
    conditions: [{ key: "resourceUuids", values: resourceUuids, op: Op.in }],
  };

  const onOk = async () => {
    let accountUuids: string[] = [];
    if (_map(checkValue, "linkedAccountUuid").some((cv) => cv)) {
      accountUuids = _map(checkValue, "linkedAccountUuid");
    } else {
      accountUuids = _map(checkValue, "uuid");
    }
    const payload: IChangeResourceOwnerPayload[] = selectedList.map((item) => ({
      accountUuid: accountUuids.length === 1 ? accountUuids[0] : "",
      resourceUuid: item.uuid,
    }));

    doAction({
      mutation: changeResourceOwner,
      name: intl.formatMessage({
        id: "change.owner",
        defaultMessage: "Change Owner",
      }),
      payload,
      total: selectedList.length,
      type: "EmailServerSetting",
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "change.owner",
        defaultMessage: "Change Owner",
      })}
      selectType="radio"
      value={value}
      onChange={(value: AccountVO[]) => {
        setValue(value);
        checkValue = value;
      }}
      visible={visible}
      setVisible={setVisible}
      showSelect={false}
      onOk={onOk}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <List view="select" defaultQuery={queryParams} />
    </ModalSelect>
  );
};

export default ChangeOwnerAction;
