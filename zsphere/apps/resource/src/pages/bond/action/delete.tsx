import { gql } from "@apollo/client";
import { DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Bond as IBond } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const DeleteBond: React.FC<
  IActionWrapperProps<IBond> & { actionRefetch: () => any }
> = ({
  visible,
  selectedList,
  setVisible,
  setSelectedList,
  refetch,
  actionRefetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const needValidate = useSensitiveJudge();

  const deleteBond = gql`
    mutation deleteBond($input: DeleteBondInput!) {
      deleteBond(input: $input) {
        actionId
      }
    }
  `;

  const onOk = async () => {
    doAction({
      mutation: deleteBond,
      payload: selectedList.map((it) => ({ uuid: it.uuid })),
      name: intl.formatMessage({
        id: "deleteBond",
        defaultMessage: "Delete Bond",
      }),
      total: selectedList.length,
      onFinish: () => {
        refetch?.();
        actionRefetch?.();
      },
    });
    setVisible(false);
    setSelectedList?.([]);
  };

  return (
    <DialogP0Smart
      title={intl.formatMessage({
        id: "bond.modal.title.confirm.delete.bond",
        defaultMessage: "Delete Bond?",
      })}
      bannerMessage={intl.formatMessage({
        id: "bond.modal.delete.bond.alert.danger",
        defaultMessage:
          "Deleting a bond will release its physical ports and disrupt network connectivity. Proceed with caution.",
      })}
      resourceType={intl.formatMessage({
        id: "bond",
        defaultMessage: "Bond",
      })}
      resourceNames={
        selectedList?.map((r) => r.name ?? r.bondingName ?? r.uuid) || []
      }
      visible={visible}
      setVisible={setVisible}
      confirmText={intl.formatMessage({
        id: "delete",
        defaultMessage: "Delete",
      })}
      onConfirm={onOk}
      needValidate={needValidate}
    />
  );
};

export default DeleteBond;
