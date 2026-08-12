import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PrimaryStorageVO as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const enablePrimaryStorageList = gql`
  mutation enablePrimaryStorageList($input: EnablePrimaryStorageInput!) {
    enablePrimaryStorageList(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IPrimaryStorage>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const onOk = () => {
    const payload = selectedList.map((item: IPrimaryStorage) => {
      return { uuid: item?.uuid };
    });
    doAction({
      mutation: enablePrimaryStorageList,
      payload,
      name: intl.formatMessage({
        id: "enable.primaryStorage",
        defaultMessage: "Enable Data Storage",
      }),
      total: selectedList.length,
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "primaryStorage.modal.title.confirm.enable.primaryStorage",
        defaultMessage: "Enable Data Storage?",
      })}
      resourceType={intl.formatMessage({
        id: "primaryStorage",
        defaultMessage: "Data Storage",
      })}
      resourceNames={selectedList.map((r) => r.name ?? r.uuid)}
      onConfirm={onOk}
    />
  );
};

export default Action;
