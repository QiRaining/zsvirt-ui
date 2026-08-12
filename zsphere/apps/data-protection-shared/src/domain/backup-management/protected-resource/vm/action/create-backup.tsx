import { gql } from "@apollo/client";
import { Input, RadioGroup } from "@zstack/design";
import { ModalSelect, Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import {
  IIsRequiredType,
  useAction,
  useValidator,
} from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import type { FormInstance } from "antd/lib/form";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import BackupStorageList from "../../../../backup-management/disaster-recovery-storage/list";
import RemoteBackupSwitch from "../components/RemoteBackupSwitch";

const { Item } = Form;

const createBackupData = gql`
  mutation createBackupData($input: CreateBackupInput!) {
    createBackupData(input: $input) {
      actionId
    }
  }
`;

const CreateBackupData: React.FC<IActionWrapperProps<IVM>> = ({
  source,
  selectedList,
  visible,
  setVisible,
}) => {
  const intl = useIntl();
  const { isRequired, isRequiredString, lengthRange } = useValidator(intl);
  const doAction = useAction();
  const [form] = Form.useForm();
  const formRef = React.createRef<FormInstance>();
  const [mode, setMode] = useState<string>("auto");

  const backupModeOptions = [
    {
      label: intl.formatMessage({
        id: "incremental.backup",
        defaultMessage: "Incremental Backup",
      }),
      value: "auto",
    },
    {
      label: intl.formatMessage({
        id: "full.backup",
        defaultMessage: "Full Backup",
      }),
      value: "full",
    },
  ];

  const defaultQueryForLocal: IQuery = useMemo(
    () => ({
      conditions: [
        {
          key: "type",
          op: Op.eq,
          value: "ImageStoreBackupStorage",
        },
        {
          key: "state",
          op: Op.eq,
          value: "Enabled",
        },
        {
          key: "status",
          op: Op.eq,
          value: "Connected",
        },
        {
          key: "availableCapacity",
          op: Op.gte,
          value: "1",
        },
        {
          key: "__systemTag__",
          op: Op.in,
          values: ["onlybackup", "allowbackup"],
        },
      ],
    }),
    [],
  );

  const currentVm =
    source?.__typename === "VmInstance" ? source : selectedList[0];

  const onOk = (values: any) => {
    const { name, backupStorage, remoteBackupStorage, syncRemote } = values;
    if (values.mode !== "full") {
      delete values.mode;
    }

    const payload = {
      name,
      volumeUuid: currentVm?.rootVolumeUuid,
      volumeUuidForTargetResourceUuid: currentVm?.rootVolumeUuid,
      isBackupVm: true,
      backupWithDataVolume: true,
      sync: !!syncRemote,
      backupStorageUuid: backupStorage ? backupStorage?.[0].uuid : "",
      remoteBackupStorageUuid: remoteBackupStorage
        ? remoteBackupStorage?.uuid
        : "",
      mode: values.mode,
    };

    doAction({
      mutation: createBackupData,
      payload,
      name: intl.formatMessage({
        id: "create.backup",
        defaultMessage: "Create Backup",
      }),
      total: 1,
      forceRunCallback: true,
      type: "BackupData",
    });
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) {
      form?.resetFields();
    }
  }, [form, visible]);

  const typeChange = (value: string) => {
    setMode(value);
  };

  const sharedDiskBackupWarning = useMemo(() => {
    return currentVm?.haveScsiLun ||
      currentVm?.attachedShareableVolumeUuidList.length > 0
      ? ({
          alertType: "warning",
          alertMessage: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "backup.data.form.current.vm.has.shared.disk",
                defaultMessage:
                  "Shared disks or RDM disks attached to this VM will not be included in the backup.",
              })}
            </ReactMarkdown>
          ),
        } as { alertType: string; alertMessage: React.ReactNode })
      : {};
  }, [
    currentVm?.attachedShareableVolumeUuidList?.length,
    currentVm?.haveScsiLun,
    intl,
  ]);

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "create.backup",
        defaultMessage: "Create Backup",
      })}
      closable={true}
      setVisible={setVisible}
      visible={visible}
      form={form}
      onOk={onOk}
      onCancel={() => setVisible(false)}
      resourceName={currentVm?.name}
      {...sharedDiskBackupWarning}
    >
      <Form
        form={form}
        name="image"
        ref={formRef}
        initialValues={{
          name: `backup-${currentVm?.uuid?.slice(0, 8)}`,
          mode: "auto",
          backupWithDataVolume: true,
          sync: false,
        }}
      >
        <Item
          label={intl.formatMessage({
            id: "localBackupData.name",
            defaultMessage: "Backup Name",
          })}
          name="name"
          rules={[isRequiredString(), lengthRange(1, 128)]}
        >
          <Input className="width-320" />
        </Item>
        <Item
          name="mode"
          label={intl.formatMessage({
            id: "backup.type",
            defaultMessage: "Backup Type",
          })}
        >
          <RadioGroup
            value={mode}
            onValueChange={typeChange}
            options={backupModeOptions}
          />
        </Item>
        <Item
          name="backupStorage"
          label={intl.formatMessage({
            id: "local.backup.storage",
            defaultMessage: "Local Backup Storage",
          })}
          rules={[isRequired(IIsRequiredType.select)]}
        >
          <ModalSelect
            className="width-320"
            title={intl.formatMessage({
              id: "backup.data.form.local.backup.storage.validator.required",
              defaultMessage: "Select Local Backup Storage",
            })}
            selectType="radio"
          >
            <BackupStorageList
              view="select"
              defaultQuery={defaultQueryForLocal}
            />
          </ModalSelect>
        </Item>
        <Form.Item noStyle>
          <RemoteBackupSwitch form={form} zoneUuid={currentVm?.zoneUuid} />
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default CreateBackupData;
