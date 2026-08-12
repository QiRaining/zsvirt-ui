import { gql } from "@apollo/client";
import { DialogP0, DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  CbdMds as ICbdMds,
  DeleteCbdMdsPayload as IDeleteCbdMdsPayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

const deleteCbdMds = gql`
  mutation deleteCbdMds($input: DeleteCbdMdsInput!) {
    deleteCbdMds(input: $input) {
      actionId
    }
  }
`;

const DeleteModal: React.FC<IActionWrapperProps<ICbdMds>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const needValidate = useSensitiveJudge();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const onOk = async () => {
    const payload: IDeleteCbdMdsPayload = {
      uuid,
      mdsAddrs: selectedList?.map((item) => {
        return item.addr;
      }) as string[],
    };

    doAction({
      mutation: deleteCbdMds,
      payload,
      name: intl.formatMessage({
        id: "delete.monitoringNode",
        defaultMessage: "Delete Monitoring Node",
      }),
      total: 1,
      onFinish: () => {
        setSelectedList?.([]);
        refetch?.();
      },
    });
  };

  const commonProps = {
    visible,
    setVisible,
    title: intl.formatMessage({
      id: "monitoringNode.modal.title.confirm.delete.cbdMds",
      defaultMessage: "Delete Mds Node?",
    }),
    bannerMessage: intl.formatMessage({
      id: "monitoringNode.modal.delete.monitoringNode.alert.warning",
      defaultMessage: "This operation may cause image storage disconnected. Proceed with caution.",
    }),
    resourceNames:
      selectedList
        ?.map((mons) => mons.addr ?? mons.name)
        .filter((name): name is string => !!name) || [],
  };

  if (needValidate) {
    return (
      <DialogP0Smart
        {...commonProps}
        onConfirm={() => {
          onOk();
        }}
        needValidate={needValidate}
      />
    );
  }

  return (
    <DialogP0
      {...commonProps}
      onConfirm={() => {
        onOk();
      }}
      guide={{
        confirmWord: "Delete",
      }}
    />
  );
};

export default DeleteModal;
