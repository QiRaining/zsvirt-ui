import { gql } from "@apollo/client";
import { Button, DialogFooter } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Steps, Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Encrypt } from "@zstack/zsphere-utils";
import { usePersistFn } from "ahooks";
import type { FC } from "react";
import { useState, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import { createZSVBackupStorage } from "../../../../../gql/disaster-recovery-storage.gql";
import { ScanResultModal } from "../scan-backup-data";
import AdvancedConfig from "./advanced-config";
import BasicConfig from "./basic-config";
import BackupStorageCreateContext from "./context";
import DiskConfig, { BackupWay } from "./disk-config";
import { getInitialValues } from "./utils";

import styles from "../style.module.less";

const testHostConnection = gql`
  mutation testConnection($input: TestConnectionInput!) {
    testConnection(input: $input) {
      actionId
    }
  }
`;

const CreateBackupStorage: FC<IActionWrapperProps<any>> = ({
  visible,
  setVisible,
  source: _source = {},
  refetch,
}) => {
  const intl = useIntl();
  const [source, setSource] = useState<any>({});
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [scanResult, setScanResult] = useState<any>();
  const [form] = Form.useForm();
  const doAction = useAction();
  const dedicatedCreate: boolean = ["localCreate", "remoteCreate"].includes(
    source?.createWay,
  );

  const initialValues = getInitialValues(source);

  useEffect(() => {
    if (_source) {
      setSource({ ..._source, currentStep });
    }
    if (!visible) {
      setCurrentStep(0);
      form.resetFields();
    }
  }, [_source, currentStep, visible]);

  const title = useMemo(() => {
    return source?.createWay === "remoteCreate"
      ? intl.formatMessage({
          id: "add.remote.backupStorage.title",
          defaultMessage: "Add Remote Backup Storage",
        })
      : intl.formatMessage({
          id: "add.local.backupStorage.title",
          defaultMessage: "Add Local Backup Storage",
        });
  }, [intl, source]);

  const handleSubmit = usePersistFn(async () => {
    await form.validateFields();

    const values = await form.getFieldsValue();

    const {
      name,
      description,
      scanBackupData,
      backupNetwork,
      backupStorage,
      host,
      url,
      hostname,
      username,
      sshPort,
      password,
      zoneUuid,
      freeDisk,
      backupWay,
    } = values;

    const payload = {
      name,
      description,
      addMethod: source?.createWay,
      zoneUuid: zoneUuid || source?.selectedZone?.uuid,
      imageStoreUuid: backupStorage ? backupStorage?.[0]?.uuid : "",
      url: backupStorage ? backupStorage?.[0]?.url : url,
      scanBackup: scanBackupData,
      cidr: backupNetwork || undefined,
      password,
      username: host ? host[0]?.username : username,
      sshPort: host ? Number(host[0]?.sshPort) : Number(sshPort),
      hostname: host ? host[0]?.managementIp : hostname,
      blockDevicePath: freeDisk && freeDisk?.[0]?.name,
      formatDisk: backupWay === BackupWay.FreeDisk,
    };

    doAction({
      mutation: createZSVBackupStorage,
      payload,
      name: intl.formatMessage({
        id: "add.backup.storage",
        defaultMessage: "Add Backup Storage",
      }),
      total: 1,
      type: "ZSVBackupStorage",
      onFinish: (result) => {
        setVisible(false);
        form.resetFields();
        refetch?.();

        if (result.success && scanBackupData) {
          const resultData = result.inventory?.scanResult?.results;
          setScanResult(resultData);
          setResultModalVisible(true);
        }
      },
      onProgress: () => {},
    });

    setVisible(false);
  });

  const footer = (
    <DialogFooter className="gap-2">
      <Button
        variant="subtle"
        onClick={() => {
          setVisible(false);
        }}
      >
        {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
      </Button>
      {dedicatedCreate && currentStep > 0 && (
        <Button
          variant="secondary"
          icon={<Icon type="arrow-ios-left" />}
          onClick={() => setCurrentStep((value) => value - 1)}
        >
          {intl.formatMessage({ id: "previous", defaultMessage: "Back" })}
        </Button>
      )}
      {dedicatedCreate && currentStep < 1 ? (
        <Button
          variant="primary"
          loading={loading}
          disabled={loading}
          icon={<Icon type="arrow-ios-right" />}
          onClick={async () => {
            form.setFieldsValue({ testConnError: "" });
            await form.validateFields([
              "name",
              "zone",
              "hostname",
              "sshPort",
              "username",
              "password",
            ]);
            setLoading(true);
            const { hostname, sshPort, username, password } =
              form.getFieldsValue([
                "password",
                "hostname",
                "sshPort",
                "username",
              ]);
            const payload = {
              hostName: hostname,
              sshPort: Number(sshPort),
              username,
              password: Encrypt(password),
            };
            doAction({
              mutation: testHostConnection,
              payload,
              name: intl.formatMessage({
                id: "test.connection",
                defaultMessage: "Test Connection",
              }),
              total: 1,
              onFinish: (result) => {
                setLoading(false);
                if (result?.inventory?.success) {
                  setCurrentStep((value) => value + 1);
                } else {
                  form.setFieldsValue({
                    testConnError: intl.formatMessage({
                      id: "add.backup.storage.error.connection.fail",
                      defaultMessage: "Connection Failed. Check your configurations.",
                    }),
                  });
                }
              },
            });
          }}
        >
          {intl.formatMessage({ id: "next", defaultMessage: "Next" })}
          <Icon type="arrow-ios-right" />
        </Button>
      ) : (
        <Button variant="primary" onClick={handleSubmit}>
          {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
        </Button>
      )}
    </DialogFooter>
  );

  const handleValuesChange = (changedValues: any, values: any) => {
    if (
      values.testConnError &&
      ("password" in changedValues ||
        "hostname" in changedValues ||
        "sshPort" in changedValues ||
        "username" in changedValues)
    ) {
      form.setFieldsValue({ testConnError: "" });
    }
  };

  return (
    <>
      <DialogForm
        form={form}
        title={title}
        visible={visible}
        setVisible={setVisible}
        widthClassName="w-150"
        className={styles.createBackupStorage}
        bodyClassName="p-0"
        footer={footer}
      >
        <BackupStorageCreateContext.Provider value={{ source, setSource }}>
          {dedicatedCreate && (
            <div className={styles.stepsWrapper}>
              <Steps direction="horizontal" current={currentStep}>
                <Steps.Step
                  title={intl.formatMessage({
                    id: "basic.config",
                    defaultMessage: "Basic Configuration",
                  })}
                />
                <Steps.Step
                  title={intl.formatMessage({
                    id: "disk.config",
                    defaultMessage: "Disk Configuration",
                  })}
                />
              </Steps>
            </div>
          )}
          <Form
            form={form}
            initialValues={initialValues}
            onValuesChange={handleValuesChange}
          >
            <div className={styles.formWrapper}>
              <div style={{ display: currentStep === 0 ? "block" : "none" }}>
                <BasicConfig />
                <AdvancedConfig />
              </div>
              {dedicatedCreate && currentStep === 1 && (
                <div>
                  <DiskConfig form={form} />
                </div>
              )}
            </div>
          </Form>
        </BackupStorageCreateContext.Provider>
      </DialogForm>
      <ScanResultModal
        value={scanResult}
        visible={resultModalVisible}
        setVisible={setResultModalVisible}
      />
    </>
  );
};

export default CreateBackupStorage;
