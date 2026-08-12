import { gql } from "@apollo/client";
import { Alert, Button, Checkbox } from "@zstack/design";
import { DialogBase, DialogSelectedResource } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmInstance } from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const recoverVmInstance = gql`
  mutation ($input: RecoverVmInstanceInput!) {
    recoverVmInstance(input: $input) {
      actionId
    }
  }
`;

const RecoverAction: React.FC<IActionWrapperProps<VmInstance>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [checked, setChecked] = useState(false);

  const onOk = (startVm: boolean) => {
    doAction({
      mutation: recoverVmInstance,
      payload: selectedList.map((item) => {
        return {
          uuid: item.uuid,
          startVm,
        };
      }),
      name: intl.formatMessage({
        id: "recover.vm",
        defaultMessage: "Recover Virtual Machine",
      }),
      type: "VmInstance",
      total: selectedList.length,
      onFinish: () => {
        setSelectedList?.([]);
        setVisible?.(false);
      },
    });
  };

  return (
    <DialogBase
      setVisible={setVisible}
      visible={visible}
      title={intl.formatMessage({
        id: "vm.modal.title.confirm.recover.vm",
        defaultMessage: "Recover Virtual Machine?",
      })}
      footer={
        <>
          <Button variant="subtle" onClick={() => setVisible(false)}>
            {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onOk(checked);
              setVisible(false);
            }}
          >
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        </>
      }
    >
      <Alert variant="info" className="mb-4">
        <ReactMarkdown>
          {intl.formatMessage({
            id: "vm.action.recover.alert.info",
            defaultMessage: `1. After a virtual machine is recovered, it goes back to the previous group it belongs to.

2. If the previous group is deleted, the recovered virtual machine goes to the default group.`,
          })}
        </ReactMarkdown>
      </Alert>
      <DialogSelectedResource
        names={selectedList.map((item) => item.name ?? item.uuid)}
      />
      <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-sm">
        <Checkbox
          checked={checked}
          onCheckedChange={(v) => setChecked(v === true)}
        />
        {intl.formatMessage({
          id: "start.vm.after.recover",
          defaultMessage: "Boot virtual machines immediately after its recovery",
        })}
      </label>
    </DialogBase>
  );
};

export default RecoverAction;
