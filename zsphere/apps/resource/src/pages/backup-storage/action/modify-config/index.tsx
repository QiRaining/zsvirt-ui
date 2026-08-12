import { gql, useLazyQuery } from "@apollo/client";
import { resourceConfigList } from "@zstack/virtualization-resource/src/gql/resource-config.gql";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { BackupStorageType, Op } from "@zstack/zsphere-types";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import {
  bus,
  formatResourceName,
  formatStorageToObj,
  getModifedValues,
  parseNumber,
} from "@zstack/zsphere-utils";
import type { FormInstance } from "antd/es/form";
import { assign, cloneDeep, pick } from "lodash-es";
import React, { useCallback, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import AdvanceSettings from "./advance-config";
import BasicCard from "./basic-config";
import ConfigCard from "./config-info";

const updateImageStoreBackupStorage = gql`
  mutation updateImageStoreBackupStorage(
    $input: UpdateImageStoreBackupStorageInput!
  ) {
    updateImageStoreBackupStorage(input: $input) {
      actionId
    }
  }
`;

const updateCephBackupStorage = gql`
  mutation updateCephBackupStorage($input: UpdateCephBackupStorageInput!) {
    updateCephBackupStorage(input: $input) {
      actionId
    }
  }
`;
const CreatBackupStorage: React.FC<
  Omit<IActionWrapperProps<IBackupStorage>, "view" | "position">
> = ({ refetch, visible, setVisible, selectedList = [] }) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const current = selectedList?.[0];
  const formRef = React.createRef<FormInstance>();

  // 查询高级设置
  const [getResourceConfigList, { data: _data }] = useLazyQuery(
    resourceConfigList,
    {
      variables: {
        conditions: [
          {
            key: "categoryList",
            values: ["backupStorage", "imagestore"],
            op: Op.in,
          },
          {
            key: "nameList",
            values: [
              "reservedCapacity",
              "blob.upload.concurrency",
              "blob.download.concurrency",
            ],
            op: Op.in,
          },
          {
            key: "resourceUuid",
            value: current?.uuid,
            op: Op.eq,
          },
        ],
      },
      errorPolicy: "ignore",
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        const _configList = data?.resourceConfigList?.list;
        let reservedCapacity = _configList
          ?.find(
            (it: any) =>
              it?.category === "backupStorage" &&
              it.name === "reservedCapacity",
          )
          ?.value?.toString();
        const blobUploadConcurrency = _configList?.find(
          (it: any) =>
            it?.category === "imagestore" &&
            it.name === "blob.upload.concurrency",
        )?.value;
        const blobDownloadConcurrency = _configList?.find(
          (it: any) =>
            it?.category === "imagestore" &&
            it.name === "blob.download.concurrency",
        )?.value;
        if (reservedCapacity?.split(/[^0-9]/)?.length === 1) {
          reservedCapacity = formatStorageToObj(Number(reservedCapacity));
        } else {
          const reservedCapacityNumber = reservedCapacity?.replace(
            /[^0-9]/gi,
            "",
          );
          const reservedCapacityUnit = reservedCapacity?.split(
            reservedCapacityNumber,
          )?.[1];
          reservedCapacity = {
            number: Number(reservedCapacityNumber),
            unit: reservedCapacityUnit?.toLocaleUpperCase(),
          };
        }
        form.setFieldsValue({
          reservedCapacity,
          blobUploadConcurrency,
          blobDownloadConcurrency,
        });
        assign(initialBasicValues, {
          reservedCapacity,
          blobUploadConcurrency,
          blobDownloadConcurrency,
        });
      },
    },
  );
  // 初始赋值
  const initialBasicValues = useMemo(() => {
    const _value = {
      zoneUuid: "",
      name: "",
      description: "",
      type: BackupStorageType.ImageStoreBackupStorage,
      hostname: "",
      url: "",
      importImages: false,
      sshPort: 22,
      username: "root",
      sshPassword: "",
      poolName: "",
      mons: [] as any,
      dataNetwork: "",
      syncImageNetwork: "",
      systemTags: [],
      reservedCapacity: { number: 1, unit: "GB" },
      blobUploadConcurrency: "",
      blobDownloadConcurrency: "",
    };

    if (current) {
      _value.name = current?.name || "";
      _value.description = current?.description || "";
      _value.type =
        (current?.type as BackupStorageType) ||
        BackupStorageType.ImageStoreBackupStorage;
      _value.hostname = current?.hostname || "";
      _value.url = current?.url || "";
      _value.sshPort = current?.sshPort || 22;
      _value.username = current?.username || "root";
      _value.poolName = current?.poolName || "";
      _value.mons =
        current?.mons?.map((mon) => {
          const {
            sshPassword = "",
            sshUsername = "",
            sshPort,
            hostname = "",
          } = mon;
          return { sshPassword, sshUsername, sshPort, hostname };
        }) || [];
      _value.dataNetwork = current?.dataNetwork || "";
      _value.syncImageNetwork = current?.syncImageNetwork || "";
    }
    return _value;
  }, [current]);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(initialBasicValues);
      getResourceConfigList();
    }
  }, [visible, initialBasicValues]);

  const submitHandle = useCallback(
    async (e: any) => {
      const params = cloneDeep(e);
      let payload;
      const systemTags = [];
      switch (params.type) {
        case BackupStorageType.ImageStoreBackupStorage:
          payload = pick(params, [
            "name",
            "description",
            "hostname",
            "sshPort",
            "username",
            "systemTags",
            "blobUploadConcurrency",
            "blobDownloadConcurrency",
          ]);
          payload.sshPort = Number(params.sshPort);
          if (params?.syncImageNetwork) {
            systemTags.push(`sync::network::cidr::${params.syncImageNetwork}`);
          }
          break;
        case BackupStorageType.Ceph:
          payload = pick(params, [
            "name",
            "description",
            "systemTags",
            "blobUploadConcurrency",
            "blobDownloadConcurrency",
          ]);
          break;
        default:
          payload = params;
          break;
      }
      if (params?.dataNetwork) {
        systemTags.push(
          `backupStorage::data::network::cidr::${params.dataNetwork}`,
        );
      }

      // 高级设置
      if (params?.reservedCapacity) {
        const { number = 1, unit = "GB" } = params?.reservedCapacity ?? {};
        const newReservedCapacityBytes = parseNumber(number, unit?.trim());
        if (newReservedCapacityBytes !== current?.reservedCapacity) {
          payload.reservedCapacity = newReservedCapacityBytes?.toString();
        }
      }
      if (params?.blobUploadConcurrency) {
        payload.blobUploadConcurrency = String(params?.blobUploadConcurrency);
      }
      if (params?.blobDownloadConcurrency) {
        payload.blobDownloadConcurrency = String(
          params?.blobDownloadConcurrency,
        );
      }
      payload.uuid = current?.uuid;

      const preMons = current?.mons?.map((it) =>
        pick(it, [
          "hostname",
          "sshPort",
          "sshUsername",
          "sshPassword",
          "monUuid",
        ]),
      );

      let fn: any;
      let finalPayload: any;

      if (params?.type === "Ceph") {
        fn = updateCephBackupStorage;
        const currentPayload = getModifedValues(initialBasicValues, {
          ...payload,
          systemTags,
          preSystemTags: current?.systemTag || [],
        });

        const changeKeys = Object.keys(currentPayload).filter(
          (key) => !["uuid", "preSystemTags"].includes(key),
        );
        if (changeKeys.length === 0) {
          return;
        }

        const mons =
          params?.mons && params.mons.length > 0
            ? params.mons
            : preMons?.map((mon) =>
                pick(mon, [
                  "hostname",
                  "sshPort",
                  "sshUsername",
                  "sshPassword",
                ]),
              ) || [];

        finalPayload = {
          ...currentPayload,
          mons,
          preMons,
        };
      } else {
        fn = updateImageStoreBackupStorage;
        finalPayload = getModifedValues(initialBasicValues, {
          ...payload,
          systemTags,
          preSystemTags: current?.systemTag || [],
        });

        const changeKeys = Object.keys(finalPayload).filter(
          (key) => !["uuid", "preSystemTags"].includes(key),
        );
        if (changeKeys.length === 0) {
          return;
        }
      }

      doAction({
        mutation: fn,
        payload: finalPayload,
        name: intl.formatMessage({
          id: "backupStorage.modify.config",
          defaultMessage: "Modify Configuration",
        }),
        total: 1,
        type: "BackupStorage",
        onFinish: () => {
          refetch?.();
          if (params?.type === "Ceph") {
            bus.emit("action:refetch:CephMon");
          }
        },
      });
    },
    [current, doAction, intl, refetch, initialBasicValues, form],
  );

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "backupStorage.modify.config",
        defaultMessage: "Modify Configuration",
      })}
      form={form}
      widthClassName="w-150"
      visible={visible}
      setVisible={setVisible}
      onOk={submitHandle}
      onCancel={() => setVisible(false)}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form form={form} ref={formRef} initialValues={initialBasicValues}>
        <BasicCard form={form} current={current} />
        <ConfigCard form={form} current={current} />
        <AdvanceSettings form={form} current={current} />
      </Form>
    </DialogForm>
  );
};

export default CreatBackupStorage;
