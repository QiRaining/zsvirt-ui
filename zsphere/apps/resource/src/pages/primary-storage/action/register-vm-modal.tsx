import { gql, useApolloClient } from "@apollo/client";
import ConfigFileList from "@zstack/virtualization-resource/src/pages/config-file/list";
import Group from "@zstack/virtualization-resource/src/pages/vm/create/basic-config/group";
import { Form, ModalSelect } from "@zstack/zsphere-components";
import { DialogForm, DialogWeak } from "@zstack/zsphere-design-biz";
import { useValidator, useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import { Op, ResourceQueryType } from "@zstack/zsphere-types";
import type {
  PrimaryStorageVO as IPrimaryStorage,
  ConfigFile as IConfigFile,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import { Input } from "antd";
import * as _ from "lodash-es";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import RunLocationSelect from "../components/run-location-select";

import styles from "./style.module.less";

const REGISTER_VM_INSTANCE = gql`
  mutation RegisterVmInstance($input: RegisterVmInstanceInput!) {
    registerVmInstance(input: $input) {
      actionId
    }
  }
`;

const CHECK_VM_INSTANCE_EXISTS = gql`
  query checkVmInstanceExists($vmInstanceUuid: String!) {
    checkVmInstanceExists(vmInstanceUuid: $vmInstanceUuid)
  }
`;

const RegisterVmModal: React.FC<IActionWrapperProps<IPrimaryStorage>> = ({
  visible,
  setVisible,
  selectedList = [],
  refetch,
  setSelectedList,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();
  const apolloClient = useApolloClient();
  const { commonNameRules, validatorUniqName } = useValidator(intl);
  const [selectedConfigFile, setSelectedConfigFile] =
    useState<IConfigFile | null>(null);

  const [selectedRunLocation, setSelectedRunLocation] = useState<any[]>([]);
  const [lockedHostUuid, setLockedHostUuid] = useState<string>("");
  const [duplicateWarningVisible, setDuplicateWarningVisible] = useState(false);
  const [groupKey, setGroupKey] = useState(0);
  const primaryStorage = selectedList?.[0];

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedConfigFile(null);
      setSelectedRunLocation([]);
      setLockedHostUuid("");
      setGroupKey((prev) => prev + 1);
    }
  }, [visible, form]);

  const handleBeforeOnOk = useCallback(
    async (selectedList: any[]) => {
      const file = selectedList?.[0];
      if (!file?.uuid) {
        return;
      }

      const { data } = await apolloClient.query({
        query: CHECK_VM_INSTANCE_EXISTS,
        variables: { vmInstanceUuid: file?.uuid },
        fetchPolicy: "network-only",
      });

      if (data?.checkVmInstanceExists) {
        setDuplicateWarningVisible(true);
        throw new Error("duplicate");
      }
    },
    [apolloClient],
  );

  const handleSelectConfigFile = useCallback(
    (selectedList: any[]) => {
      if (selectedList?.[0]) {
        const file = selectedList[0];
        const { uuid, name, path } = file;
        const configFileObj: IConfigFile = {
          uuid,
          name,
          path,
        };
        setSelectedConfigFile(configFileObj);
        form.setFieldsValue({
          configFile: [configFileObj],
          vmName: configFileObj.name,
        });
        // 本地存储场景下锁定运行位置
        if (primaryStorage?.type === "LocalStorage" && file.hostUuid) {
          setLockedHostUuid(file.hostUuid);
        } else {
          setLockedHostUuid("");
        }

        Promise.resolve().then(() => {
          form.validateFields(["vmName"]);
        });
      }
    },
    [form, primaryStorage?.type],
  );

  const configFileDefaultQuery = useMemo<IQuery>(
    () => ({
      conditions: primaryStorage?.uuid
        ? [{ key: "PrimaryStorageUuid", op: Op.eq, value: primaryStorage.uuid }]
        : [],
    }),
    [primaryStorage?.uuid],
  );

  const onOk = async () => {
    const primaryStorageUuid = primaryStorage?.uuid;
    const runLocation = selectedRunLocation?.[0];

    if (!selectedConfigFile || !primaryStorageUuid || !runLocation) {
      return;
    }

    const metadataPath = selectedConfigFile.path;
    const name = form.getFieldValue("vmName");

    const groupField = form.getFieldValue("group");
    const group = groupField?.value ?? groupField ?? "-2";
    let clusterUuid: string = "";
    let hostUuid: string | undefined;
    if (
      runLocation?.attr?.__typename === "Cluster" ||
      runLocation?.__typename === "Cluster"
    ) {
      clusterUuid = runLocation?.uuid || runLocation?.attr?.uuid;
    } else if (runLocation?.__typename === "HostVO") {
      hostUuid = runLocation?.uuid;
      clusterUuid =
        runLocation?.cluster?.uuid || runLocation?.attr?.cluster?.uuid;
    }
    const payload = {
      metadataPath,
      primaryStorageUuid,
      name,
      group,
      zoneUuid: primaryStorage?.zoneUuid,
      clusterUuid,
      ...(hostUuid ? { hostUuid } : {}),
      forceVersionMismatch: false,
    };
    doAction({
      mutation: REGISTER_VM_INSTANCE,
      payload,
      name: intl.formatMessage({
        id: "primaryStorage.registerVm.title",
        defaultMessage: "Register VM",
      }),
      total: 1,
      type: "VmInstance",
      onFinish: () => {
        setVisible(false);
        setSelectedList?.([]);
        refetch?.();
      },
    });
  };

  const validateRunLocation = useCallback(async () => {
    const selected = selectedRunLocation?.[0];

    if (!selected) {
      return;
    }

    if (selected?.type !== "cluster") {
      return;
    }

    const hasConnectedHost = selected?.attr?.hasConnectedHost;

    if (!hasConnectedHost) {
      throw intl.formatMessage({
        id: "primaryStorage.registerVm.runLocation.noHostAccess",
        defaultMessage: "No host has access to the data storage where the configuration file is located.",
      });
    }

    return;
  }, [intl, selectedRunLocation]);

  return (
    <>
      <DialogForm
        form={form}
        visible={visible}
        setVisible={setVisible}
        onOk={onOk}
        title={intl.formatMessage({
          id: "primaryStorage.registerVm.title",
          defaultMessage: "Register VM",
        })}
        resourceName={formatResourceName(selectedList, intl)}
        zIndex={1000}
      >
        <Form form={form}>
          <Form.Item
            name="configFile"
            label={intl.formatMessage({
              id: "primaryStorage.registerVm.configFile",
              defaultMessage: "Configuration File",
            })}
            required
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "primaryStorage.registerVm.configFile.required",
                  defaultMessage: "Select a configuration file.",
                }),
              },
            ]}
          >
            <ModalSelect
              title={intl.formatMessage({
                id: "primaryStorage.registerVm.selectConfigFile.title",
                defaultMessage: "Select Configuration File",
              })}
              modalWidth={800}
              style={{ width: 320 }}
              selectType="radio"
              transformKey="name"
              beforeOnOk={handleBeforeOnOk}
              onChange={handleSelectConfigFile}
              value={selectedConfigFile ? [selectedConfigFile] : []}
            >
              <ConfigFileList
                source={primaryStorage}
                view="select"
                defaultQuery={configFileDefaultQuery}
              />
            </ModalSelect>
          </Form.Item>

          <Form.Item
            name="vmName"
            label={intl.formatMessage({
              id: "primaryStorage.registerVm.vmName",
              defaultMessage: "VM Name",
            })}
            required
            rules={[
              ...commonNameRules,
              validatorUniqName(
                ResourceQueryType.VmInstance,
                undefined,
                intl.formatMessage({
                  id: "instance.field.name.validator.duplicate",
                  defaultMessage: "This name is already in use. Enter a different name.",
                }),
                true,
              ),
            ]}
          >
            <Input className={styles["width-320"]} />
          </Form.Item>

          <Group
            key={groupKey}
            form={form}
            zoneUuid={primaryStorage?.zoneUuid}
            width={320}
          />

          <Form.Item
            name="runLocation"
            label={intl.formatMessage({
              id: "primaryStorage.registerVm.runLocation",
              defaultMessage: "Location",
            })}
            required
            rules={[{ validator: () => validateRunLocation() }]}
          >
            <RunLocationSelect
              value={selectedRunLocation}
              onChange={setSelectedRunLocation}
              source={primaryStorage}
              lockedHostUuid={lockedHostUuid}
            />
          </Form.Item>
        </Form>
      </DialogForm>
      <DialogWeak
        visible={duplicateWarningVisible}
        setVisible={setDuplicateWarningVisible}
        onConfirm={() => setDuplicateWarningVisible(false)}
        title={intl.formatMessage({
          id: "primaryStorage.registerVm.duplicate.title",
          defaultMessage: "Cannot Register VM",
        })}
        description={intl.formatMessage({
          id: "primaryStorage.registerVm.duplicate.content",
          defaultMessage: "The selected configuration file corresponds to an existing virtual machine. Duplicate registration is not allowed. Select a different configuration file and try again.",
        })}
        zIndex={10001}
      />
    </>
  );
};

export default RegisterVmModal;
