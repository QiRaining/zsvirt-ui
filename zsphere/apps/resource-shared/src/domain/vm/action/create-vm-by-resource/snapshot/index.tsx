import { gql, useQuery } from "@apollo/client";
import { Icon } from "@zstack/icon";
import { Form } from "@zstack/zsphere-components";
import { ZSVForm } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { formatStorageToObj } from "@zstack/zsphere-utils";
import * as _ from "lodash-es";
import React, { useCallback, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import ModalZSV from "../bussiness-components/modal-form";
import { CreateInstanceContext } from "../context";
import { getZoneUuidBySource } from "../utils";
import HardwareInfo from "./advance-card/hardware";
import BasicCard from "./basic-card";
import { transformParams } from "./hooks";
import SnapshotInfoCard from "./snapshot-info";

import styles from "./style.module.less";

const createVMFromZSVSnapshot = gql`
  mutation createVMFromZSVSnapshot($input: CreateVMFromZSVSnapshotInput!) {
    createVMFromZSVSnapshot(input: $input) {
      actionId
    }
  }
`;

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
          vmMachineType
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

const SnapshotCreateInstance: React.FC<IActionWrapperProps<any>> = ({
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
  const vmUuid =
    realSource?.group?.vmInstanceUuid ?? realSource?.vmInstanceUuid;
  const { data } = useQuery(instanceBasicInfo, {
    skip: !vmUuid || !visible,
    fetchPolicy: "no-cache",
    variables: {
      conditions: [{ key: "uuid", value: vmUuid ?? "" }],
    },
    errorPolicy: "all",
  });

  const { setRealSource } = React.useContext(CreateInstanceContext);

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

  const initializedRef = React.useRef(false);

  useEffect(() => {
    if (
      visible &&
      data?.vmInstanceList?.list?.length > 0 &&
      !initializedRef.current
    ) {
      const {
        platform,
        guestOsType,
        cpuNum: totalCoreNum,
        memorySize,
        host,
        systemTag,
      } = data?.vmInstanceList?.list?.[0] ?? {};

      const basicPart = {
        guest: platform,
        os: guestOsType,
        runPath: host ? [host] : [],
      };

      const cpuPart = {
        totalCoreNum,
      };

      const memoryPart = {
        memorySize: formatStorageToObj(memorySize!),
      };

      const nicPart = {
        "nicMultiQueueNum-0": totalCoreNum, //与cpu-totalCoreNum保持一致
      };

      const config: any = {
        ...basicPart,
        ...cpuPart,
        ...memoryPart,
        ...nicPart,
        motherboardType: systemTag?.vmMachineType ?? "i440fx",
      };

      form.setFields(
        _.keys(config).map((key: string) => ({
          name: key,
          value: config[key],
        })),
      );
      initializedRef.current = true;
    } else if (!visible) {
      form.resetFields();
      initializedRef.current = false;
    }
  }, [form, visible, data]);

  // 只处理默认
  const initValues = useMemo(() => {
    const basicPart = {
      snapshotName: realSource?.group?.name ?? realSource?.name, //快照名称
      name: realSource?.group?.name ?? realSource?.name, //默认vm名称
      count: 1,
      description: "",
      strategy: true,
    };

    const nicPart = {
      "nicType-0": "virtio",
      "netCardState-0": true,
    };

    const otherPart = {
      motherboardType: "i440fx",
    };

    const result = {
      ...basicPart,
      ...nicPart,
      ...otherPart,
    };

    return result;
  }, [realSource]);

  const submitHandle = useCallback(
    async (values: any) => {
      const params = _.cloneDeep(values);
      const createInstancePayload = transformParams(
        params,
        zoneUuid,
        realSource,
      );

      try {
        doAction({
          mutation: createVMFromZSVSnapshot,
          payload: createInstancePayload,
          type: "VmInstance",
          total: 1,
          name: intl.formatMessage({
            id: "create.vm.from.zsv.snapshot",
            defaultMessage: "Create a virtual machine based on a snapshot.",
          }),
        });
      } catch (e) {
        console.log("error", e);
      }

      setVisible(false);
    },
    [doAction, intl, zoneUuid, realSource, setVisible],
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
          id: "snapshot.create.vm.modal.title",
          defaultMessage: "New Virtual Machine from Snapshot",
        })}
        className={styles["create-vm-modal"]}
        form={form}
        width={800}
        visible={visible}
        setVisible={setVisible}
        onOk={submitHandle}
        controlledVisible
        onCancel={() => setVisible(false)}
      >
        <Form form={form} className={styles.form} initialValues={initValues}>
          <SnapshotInfoCard form={form} source={realSource} />
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

export default SnapshotCreateInstance;
