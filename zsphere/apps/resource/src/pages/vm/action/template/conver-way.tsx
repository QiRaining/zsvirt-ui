import { gql } from "@apollo/client";
import { Button } from "@zstack/design";
import { DialogP3, DialogWeak } from "@zstack/zsphere-design-biz";
import type { IActionResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  StartVmInstancePayload,
  VmInstance,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

const vmConverToTemplate = gql`
  mutation coverVmToTemplate($input: VMConverToTemplateInput!) {
    coverVmToTemplate(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<VmInstance>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();

  const onOk = () => {
    const payload: StartVmInstancePayload[] = selectedList.map((item) => {
      return { uuid: item.uuid };
    });

    doAction({
      mutation: vmConverToTemplate,
      payload,
      name: intl.formatMessage({
        id: "instance.conver.to.template",
        defaultMessage: "Convert Virtual Machine to Template",
      }),
      total: selectedList.length,
      type: "VmInstance",
      //   middleState: {
      //     type: 'VmInstance',
      //     field: 'state',
      //     data: { state: VmInstanceState.Starting },
      //     uuids: selectedList.map(item => item.uuid)
      //   },
      onFinish: (result: IActionResult) => {
        if (result?.inventory?.uuid) {
          navigate({
            pathname: "/virtualization-resource/vm-template/detail",
            search: `?uuid=${result.inventory.uuid}&leftnav=virtualization.template.vm&navView=template`,
          });
        }
        setSelectedList?.([]);
      },
    });
  };

  const hasBackupJob = selectedList.find((item) => !!item.backupJob);
  const hasSnapshotJob = selectedList.find(
    (item) => !!item.snapshotSchedulerJob?.length,
  );

  if (hasBackupJob || hasSnapshotJob) {
    return (
      <DialogWeak
        visible={visible}
        setVisible={setVisible}
        type="warning"
        title={String(
          intl.formatMessage({
            id: "cannot.convert.to.template",
            defaultMessage: "Cannot Convert to Template",
          }),
        )}
        onConfirm={() => {}}
        description={
          hasBackupJob && hasSnapshotJob
            ? intl.formatMessage({
                id: "cannot.convert.to.template.description.multiple",
                defaultMessage:
                  "The virtual machine has been associated with a backup plan and snapshot policy. Disassociate them and try again.",
              })
            : intl.formatMessage(
                {
                  id: "cannot.convert.to.template.description",
                  defaultMessage:
                    "The virtual machine has been associated with a {jobName}. Disassociate the backup plan and try again.",
                },
                {
                  jobName: hasBackupJob
                    ? intl.formatMessage({
                        id: "backup.policy",
                        defaultMessage: "Backup Plan",
                      })
                    : intl.formatMessage({
                        id: "snapshot.strategy",
                        defaultMessage: "Snapshot Policy",
                      }),
                },
              )
        }
        footer={
          <Button variant="primary" onClick={() => setVisible(false)}>
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        }
      />
    );
  }

  return (
    <DialogP3
      setVisible={setVisible}
      visible={visible}
      title={intl.formatMessage({
        id: "vm.modal.title.confirm.conver.to.vm.template",
        defaultMessage: "Convert to Template?",
      })}
      resourceType={intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={() => {
        onOk();
      }}
    />
  );
};

export default Action;
