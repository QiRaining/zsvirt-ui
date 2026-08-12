import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { map } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { revokeResourceSharing } from "../../../../gql/shared.gql";

interface IProps extends IActionWrapperProps<any> {
  resourceUuid: string;
  totalSummary: number;
}

const Revoke: React.FC<IProps> = ({
  refetch,
  visible,
  setVisible,
  selectedList = [],
  resourceUuid,
  setSelectedList,
  totalSummary,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const showAlert = useMemo<boolean>(() => {
    return totalSummary === selectedList.length;
  }, [selectedList.length, totalSummary]);

  const accountUuids: string[] = map(selectedList, "uuid");

  const onOk = () => {
    doAction({
      mutation: revokeResourceSharing,
      payload: {
        resourceUuids: [resourceUuid],
        accountUuids,
        toPublic: false,
      },
      name: intl.formatMessage({ id: "revoke", defaultMessage: "Recall" }),
      type: "Owner",
      total: 1,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
    setVisible(false);
  };

  return (
    <DialogP3
      onConfirm={onOk}
      title={intl.formatMessage(
        {
          id: "owner.modal.title.confirm.revoke",
          defaultMessage: "Revoke from {name}?",
        },
        {
          name: intl.formatMessage({ id: "account", defaultMessage: "Account" }),
        },
      )}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      resourceType={intl.formatMessage({
        id: "account",
        defaultMessage: "Account",
      })}
      visible={visible}
      setVisible={setVisible}
      bannerMessage={
        showAlert
          ? intl.formatMessage({
              id: "owner.modal.revoke.alert",
              defaultMessage:
                'You have selected all objects to which the resources are shared. Revoking the resources from all these objects will set Sharing Mode to Not Share.',
            })
          : undefined
      }
    />
  );
};

export default Revoke;
