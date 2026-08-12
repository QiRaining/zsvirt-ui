import { gql, useQuery } from "@apollo/client";
import { Icon } from "@zstack/icon";
import ModalZSV from "@zstack/virtualization-resource/src/pages/vm/create/components/modal-zsv";
import { CreateInstanceContext } from "@zstack/virtualization-resource/src/pages/vm/create/context";
import { getZoneUuidBySource } from "@zstack/virtualization-resource/src/pages/vm/create/hooks/get-zoneuuid";
import { Form } from "@zstack/zsphere-components";
import { ZSVForm } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { ActionTaskState } from "@zstack/zsphere-types";
import { formatStorageToObj } from "@zstack/zsphere-utils";
import { cloneDeep, keys } from "lodash-es";
import React, { useCallback, useMemo, useContext, useEffect } from "react";
import { useIntl } from "react-intl";

import HardwareInfo from "./advance-card/hardware";
import BackupInfoCard from "./backup-info";
import BasicCard from "./basic-card";
import { transformParams } from "./hooks";

import styles from "./style.module.less";

const instanceBasicInfo = gql`
  query instanceBasicInfo(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: VmQueryType
    $extraConditions: [Condition!] = []
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    vmInstanceList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      list {
        uuid
        name
        architecture
        crashStrategy
        cpuNum
        memorySize
        description
        clusterUuid
        rootVolumeUuid
        platform
        guestOsType
        defaultL3NetworkUuid
        imageUuid
        lastHostUuid
        hostUuid
        backupStatus
        backupTaskStatus
        reservedMemorySize
        defaultL3Network {
          name
          uuid
          ipVersion
          networkType
        }
        host {
          uuid
          name
          state
          status
          managementIp
          cpuNum
          clusterUuid
        }
        systemTag {
          cpuCores
          cpuSockets
          haStickStragedy
          sshkey
          bootOrder
          bootOrderOnce
          consolePassword
          vmConsoleMode
          vmPriority
          GuestTools
          bootMode
          RDPEnable
          usbRedirect
          qemuga
          antiSpoofing
          VDIMonitorNumber
          userdata
          clockTrack
          timeTrack
          vmDriver
          hostname
          tpmEnabled
          qxlMemory {
            ram
            vram
            vgamem
          }
        }
        vmHa {
          haLevel
        }
        zoneUuid
        group {
          groupName
          uuid
        }
      }
    }
  }
`;

const zsvCreateVmFromBackupData = gql`
  mutation zsvCreateVmFromBackupData($input: ZSVCreateVmFromBackupDataInput!) {
    zsvCreateVmFromBackupData(input: $input) {
      actionId
    }
  }
`;

const BackupCreateInstance: React.FC<IActionWrapperProps<any>> = ({
  visible,
  source,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();
  const realSource =
    selectedList.length !== 0 ? selectedList[0] : (source as any);

  const { data } = useQuery(instanceBasicInfo, {
    fetchPolicy: "no-cache",
    variables: {
      conditions: [{ key: "uuid", value: realSource?.vmInstance?.uuid ?? "" }],
    },
  });

  const { setRealSource } = useContext(CreateInstanceContext);

  const zoneUuid = useMemo(() => {
    return getZoneUuidBySource(realSource);
  }, [realSource]);

  useEffect(() => {
    setRealSource?.((pre: any) => ({
      ...pre,
      zoneUuid,
      realSource,
    }));
  }, [realSource, zoneUuid, setRealSource, data]);

  useEffect(() => {
    if (visible) {
      // 优先使用备份数据 (realSource) 中保存的原虚拟机规格，
      // 因为原虚拟机可能已被删除，此时 instanceBasicInfo 查询会返回空。
      // 仅在备份数据缺少对应字段时，才退回使用查询到的 VmInstance 数据。
      // 修复 ZSV-11961: 基于备份新建虚拟机没有带入原虚拟机计算规格
      const liveVm = data?.vmInstanceList?.list?.[0];
      const platform =
        realSource?.vmInstance?.platform ??
        realSource?.platform ??
        liveVm?.platform;
      const guestOsType =
        realSource?.vmInstance?.guestOsType ?? liveVm?.guestOsType;
      const totalCoreNum = realSource?.cpuNum ?? liveVm?.cpuNum;
      const memorySize = realSource?.memorySize ?? liveVm?.memorySize;
      const host = liveVm?.host;

      const config: any = {};

      if (platform !== undefined && platform !== null) {
        config.guest = platform;
      }
      if (guestOsType !== undefined && guestOsType !== null) {
        config.os = guestOsType;
      }
      if (host) {
        config.runPath = [host];
      }
      if (totalCoreNum !== undefined && totalCoreNum !== null) {
        config.totalCoreNum = totalCoreNum;
        config["nicMultiQueueNum-0"] = totalCoreNum; //与cpu-totalCoreNum保持一致
      }
      if (memorySize !== undefined && memorySize !== null) {
        config.memorySize = formatStorageToObj(memorySize);
      }

      if (keys(config).length > 0) {
        form.setFields(
          keys(config).map((key: string) => ({
            name: key,
            value: config[key],
          })),
        );
      }
    } else {
      form.resetFields();
    }
  }, [form, visible, data, realSource]);

  // 只处理默认
  const initValues = useMemo(() => {
    const basicPart = {
      backupDataName: realSource?.name, //备份数据名称
      name: realSource?.name, //默认vm名称
      count: 1,
      description: "",
      strategy: true,
    };

    const cpuPart = {
      totalCoreNum: 4,
    };

    const memoryPart = {
      memorySize: { number: 8, unit: "GB" },
    };

    const nicPart = {
      "nicType-0": "virtio",
      "netCardState-0": true,
    };

    const result = {
      ...basicPart,
      ...cpuPart,
      ...memoryPart,
      ...nicPart,
    };

    return result;
  }, [realSource]);

  const submitHandle = useCallback(
    async (values: any) => {
      const params = cloneDeep(values);
      const createInstancePayload = transformParams(
        params,
        zoneUuid,
        realSource,
      );

      // console.log('createInstancePayload', createInstancePayload)

      try {
        doAction({
          mutation: zsvCreateVmFromBackupData,
          payload: createInstancePayload,
          type: "VmInstance",
          total: 1,
          name: intl.formatMessage({
            id: "create.vm.from.zsv.backup.data",
            defaultMessage: "Create Virtual Machine Based on Backup Data",
          }),
          onFinish: (result) => {
            const actionRespSubject = window.g_action_subscribe;
            actionRespSubject.next({
              data: {
                type: "VmInstance",
                listenerType: "createInstance",
                state:
                  result.success === result.total
                    ? ActionTaskState.success
                    : ActionTaskState.fail,
              },
              type: "finish",
            });
          },
        });
      } catch (e) {
        console.log("error", e);
      }

      setVisible(false);
    },
    [doAction, intl],
  );

  return (
    <CreateInstanceContext.Provider
      value={{
        zoneUuid,
        realSource,
      }}
    >
      <ModalZSV
        title={intl.formatMessage({
          id: "backup.instance.modal.title.create",
          defaultMessage: "New Virtual Machine from Backup",
        })}
        className={styles["create-vm-modal"]}
        form={form}
        width={800}
        visible={visible}
        setVisible={setVisible}
        onOk={submitHandle}
        destroyOnClose
        controlledVisible
        onCancel={() => setVisible(false)}
        getContainer={document.body}
      >
        <Form form={form} className={styles.form} initialValues={initValues}>
          <BackupInfoCard form={form} source={realSource} />
          <BasicCard form={form} source={realSource} />
          <ZSVForm.Card
            className={styles["hardware-card"]}
            indented={false}
            title={
              <div className={styles.title}>
                {intl.formatMessage({
                  id: "virtualization.hardware.info",
                  defaultMessage: "Hardware Info",
                })}
                <Form.Item noStyle shouldUpdate>
                  {({ getFieldsError }) => {
                    return (
                      getFieldsError().find(
                        (t) =>
                          !!t.errors.length &&
                          !/(^name|^ipv(4|6)-)/.test(t.name[0].toString()),
                      ) && (
                        <Icon
                          color="danger"
                          colorNumber={500}
                          type="alert-triangle-fill"
                          size={18}
                        />
                      )
                    );
                  }}
                </Form.Item>
              </div>
            }
          >
            <div className={styles["virtual-hardware"]}>
              <HardwareInfo form={form} visible={visible} />
            </div>
          </ZSVForm.Card>
        </Form>
      </ModalZSV>
    </CreateInstanceContext.Provider>
  );
};

export default BackupCreateInstance;
