import { gql, useQuery } from "@apollo/client";
import { DialogP0 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmInstance } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import style from "../style.module.less";

const expungeVmInstance = gql`
  mutation ($input: ExpungeVmInstanceInput!) {
    expungeVmInstance(input: $input) {
      actionId
    }
  }
`;

const deleteVmInstance = gql`
  mutation deleteVmInstance($input: DeleteVmInstanceInput!) {
    deleteVmInstance(input: $input) {
      actionId
    }
  }
`;

const GLOBAL_CONFIG = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
      uuid
    }
  }
`;

const ExpungeAction: React.FC<IActionWrapperProps<VmInstance>> = ({
  visible,
  setVisible,
  selectedList,
  view,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const { data: deletionPolicyData, loading: deletionPolicyLoading } = useQuery(
    GLOBAL_CONFIG,
    {
      variables: {
        category: "vm",
        name: "deletionPolicy",
      },
    },
  );

  const isDelay = useMemo(() => {
    if (deletionPolicyLoading) {
      return true;
    }
    return deletionPolicyData?.globalConfig?.value !== "Direct";
  }, [deletionPolicyData, deletionPolicyLoading]);

  const isDelayOrRecyle = useMemo(
    () => isDelay || view === "sub.virtualization.zone.recyle",
    [isDelay, view],
  );

  const onOk = () => {
    doAction({
      mutation: isDelayOrRecyle ? expungeVmInstance : deleteVmInstance,
      payload: selectedList.map((item) => {
        return {
          uuid: item.uuid,
          deleteVolume: isDelayOrRecyle ? undefined : false,
        };
      }),
      name: intl.formatMessage({
        id: "expunge.vm",
        defaultMessage: "Expunge Virtual Machine",
      }),
      total: selectedList.length,
      type: "VmInstance",
    });

    //setSelectedList?.([])
    setVisible?.(false);
  };

  return (
    <DialogP0
      bannerMessage={
        <span>
          {isDelayOrRecyle
            ? intl.formatMessage(
                {
                  id: "delete.vm.alert.message.alert.danger.expunge.action",
                  defaultMessage:
                    "Performing this operation will cause the virtual machine to be {warningText}. Proceed with caution.",
                },
                {
                  warningText: (
                    <span className={style.warningText}>
                      {intl.formatMessage({
                        id: "delete.vm.alert.message.alert.danger.expunge.action.warningText",
                        defaultMessage: "expunged and cannot be recovered",
                      })}
                    </span>
                  ),
                },
              )
            : intl.formatMessage(
                {
                  id: "expunge.vm.alert.message.alert.danger",
                  defaultMessage:
                    "After being completely deleted, the virtual machine will be {warningText}. Please exercise extreme caution when operating...",
                },
                {
                  warningText: (
                    <span className={style.warningText}>
                      {intl.formatMessage({
                        id: "delete.vm.alert.message.alert.danger.expunge.action.warningText",
                        defaultMessage: "expunged and cannot be recovered",
                      })}
                    </span>
                  ),
                },
              )}
        </span>
      }
      setVisible={setVisible}
      visible={visible}
      title={intl.formatMessage({
        id: "vm.modal.title.confirm.expunge.vm",
        defaultMessage: "Expunge Virtual Machine?",
      })}
      resourceType={intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={() => {
        onOk();
      }}
      guide={intl.formatMessage({ id: "delete", defaultMessage: "Delete" })}
    />
  );
};

export default ExpungeAction;
