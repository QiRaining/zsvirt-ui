import { gql } from "@apollo/client";
import { Icon } from "@zstack/icon";
import { GuestTools } from "@zstack/virtualization-resource/src/pages/vm/components/configuration-info";
import RestartConfirmModal from "@zstack/virtualization-resource/src/pages/vm/components/restart-confirm-modal";
import { useResourceConfigQuery } from "@zstack/virtualization-resource/src/pages/vm/hooks/use-resource-config-query";
import { Form, ZSVForm } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { formatResourceName, formatStorageToObj } from "@zstack/zsphere-utils";
import type { FormInstance } from "antd/es/form";
import _ from "lodash-es";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import BasicCard from "../../create/basic-config";
import ModalZSV from "../../create/components/modal-zsv";
import ConfigProvider from "./config-context";
import HardwareInfo from "./hardware";
import { useTransformPayload } from "./hooks";

import style from "./style.module.less";

const editVmInstanceConfig = gql`
  mutation editVmInstanceConfig($input: EditVmInstanceConfigInput!) {
    editVmInstanceConfig(input: $input) {
      actionId
    }
  }
`;

const volumeQosProps = [
  "turnOnQoS",
  "bandwidthMode",
  "totalBandwidth",
  "writeBandwidth",
  "readBandwidth",
  "iopsMode",
  "iopsTotal",
  "readBandwidth",
  "iopsRead",
  "iopsWrite",
  "diskCreateType",
  "diskImage",
  "createDisk",
  "diskType",
];

const volumeProps = [
  "diskUuid",
  "diskCreateType",
  "diskSize",
  ...volumeQosProps,
  "allocationType",
  "cacheMode",
  "storePath",
  "aio",
  "busType",
  "diskSharable",
  "removedisk",
  "RDM",
  "volumeStoragePool",
];

const nicProps = [
  "nicUuid",
  "netCardState",
  "l3NetworkUuids",
  "nicType",
  "customMac",
  "ipv4",
  "ipv6",
  "netmask",
  "prefixLen",
  "gateway4",
  "gateway6",
  "appointIpv4",
  "appointIpv6",
  "netCardQosEnabled",
  "outboundBandwidth",
  "inboundBandwidth",
  "removenetcard",
  "nicMultiQueueNum",
  "dnsAllocationType",
  "dnsAllocationType4",
  "dnsAllocationType6",
  "dnsList",
  "dnsList4",
  "dnsList6",
  "securityGroup",
  "ingressPolicy",
  "egressPolicy",
  "nicDevice",
];

interface ICommon {
  name: string; // 名称
  description?: string; // 简介
  count: number; // 数量
  totalCoreNum?: number; // 数量
  memorySize?: { number: number; unit: string }; //自定义数据云盘规格大小
  diskSize?: { number: number; unit: string }; //自定义磁盘容量规格大小
  diskCreateType?: "new" | "image"; //自定义数据云盘规格大小
}

export const initialBasicValues: ICommon = {
  name: "",
  count: 1,
  totalCoreNum: undefined,
  description: "",
  memorySize: { number: 1, unit: "GB" },
};

const EditInstance: React.FC<IActionWrapperProps<IVM>> = ({
  // refetch,
  visible,
  setVisible,
  selectedList = [],
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();

  const {
    updateKey2Payload,
    payload,
    volumeTransform,
    nicTransform,
    cdromTransform,
    usbTransform,
    gpuTransform,
    pcieTransform,
    tpmTransform,
    _getNeedRebootKey,
    confirmList,
    changeKeys,
    resetConfig,
    getDisabledConfig,
  } = useTransformPayload(selectedList?.[0], visible);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [guestToolModalVisible, setGuestToolModalVisible] = useState(false);

  const context = useMemo(() => {
    return { setEditModalVisible: setVisible, setGuestToolModalVisible };
  }, [setVisible]);

  const [originConfig, setOriginConfig] = useState<any>();

  const formRef = React.createRef<FormInstance>();

  const [resourceConfig] = useResourceConfigQuery(
    selectedList?.[0]?.uuid,
    ["vm", "kvm", "pciDevice"],
    [
      "nicMultiQueueNum",
      "vm.cpu.hypervisor.feature",
      "vm.cpu.quota",
      "numa",
      "emulateHyperV",
      "migrate.autoConverge",
      "hotPlugEnabled",
      "hotPlugMemory",
      "vmPortOff",
      "bootMenuSplashTimeout",
      "spiceStreamingMode",
      "soundType",
      "videoType",
      "vmMachineType",
    ],
    visible,
  );

  useEffect(() => {
    if (visible && selectedList?.[0] && _.keys(resourceConfig)?.length) {
      const {
        name,
        vmGroup = [], //调度组
        group, //虚拟机分组
        guestOsType,
        systemTag,
        vmHa,
        cpuNum: totalCoreNum,
        memorySize,
        cpuModeInfo,
        platform,
        _architecture,
        host,
        vnuma,
        //primaryStorage
      } = selectedList?.[0] ?? {};

      const {
        vmMachineType,
        vmCpuPinningList, // cpu绑定
        vmPriority, // CPU资源优先级,内存资源优先级
      } = systemTag!;
      // ZSV-7867: ha 字段从 vmHa.haLevel 读取
      const ha = vmHa?.haLevel;

      const config: any = {
        name,
        group,
        vmGroup,
        ha: ha === "NeverStop",
        guest: platform,
        os: guestOsType,
        runPath: host ? [host] : [],
        totalCoreNum,
        sockedNum: systemTag?.cpuCores
          ? parseInt(systemTag.cpuCores, 10)
          : totalCoreNum,
        CPUMode: cpuModeInfo?.value ?? "None",
        cpuResourceLevel:
          ["High", "CpuHigh"].indexOf(vmPriority!) > -1 ? "CpuHigh" : "Normal",
        cpuQuota:
          Number(resourceConfig?.["vm.cpu.quota"]?.value) / 10000 || undefined,
        vnumaEnabled: vnuma,
        cpuBindListByVCpu: vmCpuPinningList?.map((cv) => ({
          vCPU: cv.vCPU,
          pCPUList: cv.pCPU?.split(","),
        })),
        hotPlug: resourceConfig?.numa?.value === "true",
        cpuHideKVMMark:
          resourceConfig?.["vm.cpu.hypervisor.feature"]?.value === "true",
        // 内存
        memoryResourceLevel:
          ["MemoryHigh", "High"].indexOf(vmPriority!) > -1 ? "High" : "Normal",
        memorySize: formatStorageToObj(memorySize!),
        memHotPlug: resourceConfig?.numa?.value === "true",
        totalGPUMemory: systemTag?.qxlMemory?.vram
          ? systemTag?.qxlMemory?.vram / 1024
          : 16,
        gpuType: resourceConfig?.videoType?.value,
        soundCard: resourceConfig?.soundType?.value,
        //其他硬件
        motherboardType:
          //
          vmMachineType ?? "i440fx",
      };

      setOriginConfig({
        ...originConfig,
        ...config,
      });
      form.setFields(
        _.keys(config).map((key: string) => ({
          name: key,
          value: config[key],
        })),
      );
    } else if (!visible) {
      setOriginConfig(undefined);
      form.resetFields();
      resetConfig();
    }
  }, [visible, selectedList, resourceConfig]);

  const disableCondigProps = useMemo(() => {
    return getDisabledConfig(selectedList?.[0], resourceConfig);
  }, [selectedList, resourceConfig]);

  const transformPayload = (value: any) => {
    const volumeValues = _.pickBy(
      value,
      (_value, key) => volumeProps.indexOf(key.split("-")[0]) > -1,
    );
    const originVolumeValues = _.pickBy(
      originConfig,
      (_value, key) => volumeProps.indexOf(key.split("-")[0]) > -1,
    );
    volumeTransform(volumeValues, originVolumeValues, selectedList?.[0]);

    const nicValues = _.pickBy(
      value,
      (_value, key) => nicProps.indexOf(key.split("-")[0]) > -1,
    );
    const originNicValues = _.pickBy(
      originConfig,
      (_value, key) => nicProps.indexOf(key.split("-")[0]) > -1,
    );
    nicTransform(nicValues, originNicValues, selectedList?.[0], value.guest);

    const cdromProps = [
      "cdRomList",
      "removecdrom",
      "cdRomListUuid",
      "cdRomName",
    ];
    const cdromValues = _.pickBy(
      value,
      (_value, key) => cdromProps.indexOf(key.split("-")[0]) > -1,
    );
    const originCdromValues = _.pickBy(
      originConfig,
      (_value, key) => cdromProps.indexOf(key.split("-")[0]) > -1,
    );
    cdromTransform(cdromValues, originCdromValues, selectedList?.[0]?.uuid);

    const usbProps = [
      "usbDiviceType",
      "usbDivice",
      "usbDiviceUuid",
      "removeusb",
    ];
    const usbValues = _.pickBy(
      value,
      (_value, key) => usbProps.indexOf(key.split("-")[0]) > -1,
    );
    const originUsbValues = _.pickBy(
      originConfig,
      (_value, key) => usbProps.indexOf(key.split("-")[0]) > -1,
    );
    usbTransform(usbValues, originUsbValues, selectedList?.[0]?.uuid);

    const gpuProps = [
      "gpuDeviceType",
      "gpuDevice",
      "vgpuDevice",
      "gpuDeviceUuid",
      "removegpu",
    ];
    const gpuValues = _.pickBy(
      value,
      (_value, key) => gpuProps.indexOf(key.split("-")[0]) > -1,
    );
    const originGpuValues = _.pickBy(
      originConfig,
      (_value, key) => gpuProps.indexOf(key.split("-")[0]) > -1,
    );
    gpuTransform(gpuValues, originGpuValues, selectedList?.[0]?.uuid);

    const pcieProps = ["pcieDevice", "pcieDeviceUuid", "removepcie"];
    const pcieValues = _.pickBy(
      value,
      (_value, key) => pcieProps.indexOf(key.split("-")[0]) > -1,
    );
    const originPcieValues = _.pickBy(
      originConfig,
      (_value, key) => pcieProps.indexOf(key.split("-")[0]) > -1,
    );
    pcieTransform(pcieValues, originPcieValues, selectedList?.[0]?.uuid);

    tpmTransform(value, originConfig, selectedList?.[0]?.uuid);

    const vmPriorityValues = _.pick(value, [
      "cpuResourceLevel",
      "memoryResourceLevel",
    ]);

    if (
      !_.isEqual(originConfig.cpuResourceLevel, value.cpuResourceLevel) ||
      !_.isEqual(originConfig.memoryResourceLevel, value.memoryResourceLevel)
    ) {
      updateKey2Payload.vmPriority(vmPriorityValues, originConfig.vmPriority);
    }

    _.keys(originConfig).map((key: string) => {
      if (
        !_.isUndefined(value[key]) &&
        !_.isEqual(originConfig[key], value[key])
      ) {
        updateKey2Payload?.[key]?.(value[key], selectedList?.[0]?.uuid, value);
      }
    });
  };

  const submitHandle = useCallback(
    async (e: any) => {
      transformPayload(e);
      if (_.keys(payload).length === 1) {
        return setVisible(false);
      }

      onOk(payload);
    },
    [doAction, originConfig],
  );

  const onOk = (values: any, neeeReboot: boolean = false) => {
    try {
      const _payload = {
        ...values,
        neeeReboot,
      };

      doAction({
        mutation: editVmInstanceConfig,
        payload: _payload,
        name: intl.formatMessage({
          id: "instance.modal.title.edit.config",
          defaultMessage: "Modify Configuration",
        }),
        total: 1,
        type: "VmInstance",
      });
    } catch (e) {
      console.log("修改配置", e);
    }
    setConfirmVisible(false);
    setVisible(false);
  };

  const current = selectedList?.[0] || {};
  const initialValues = useMemo(() => {
    const { platform, guestOsType, group } = current;
    const groupValue = group?.uuid && group?.uuid !== "" ? group?.uuid : "-2";
    return {
      ...initialBasicValues,
      guest: platform,
      os: guestOsType,
      group: groupValue,
    };
  }, [current]);

  return (
    <>
      <ConfigProvider {...disableCondigProps}>
        <ModalZSV
          title={intl.formatMessage({
            id: "instance.modal.title.edit.config",
            defaultMessage: "Modify Configuration",
          })}
          form={form}
          width={800}
          visible={visible}
          controlledVisible
          needResetFields={false}
          setVisible={setVisible}
          className={style["create-modal"]}
          onOk={submitHandle}
          destroyOnClose
          onCancel={() => setVisible(false)}
          getContainer={document.body}
          resourceName={formatResourceName(selectedList, intl)}
          context={context}
        >
          <Form
            form={form}
            ref={formRef}
            className={style.form}
            initialValues={initialValues}
          >
            <BasicCard form={form} source={selectedList[0]} isEdit={true} />
            <ZSVForm.Card
              indented={false}
              title={
                <div className={style.title}>
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
              <div className={style["virtual-hardware"]}>
                <HardwareInfo
                  setOriginConfig={setOriginConfig}
                  form={form}
                  source={selectedList?.[0]}
                />
              </div>
            </ZSVForm.Card>
          </Form>
        </ModalZSV>
      </ConfigProvider>
      <RestartConfirmModal
        visible={confirmVisible}
        setVisible={(val) => {
          setConfirmVisible(val);
        }}
        resetConfig={resetConfig}
        list={confirmList}
        type="table"
        alertMessage={intl.formatMessage(
          {
            id: "edit.vm.rebot.config.alert",
            defaultMessage:
              "Updated {allChangeKeysNum} settings. The following {needRebootKeysNum} settings require a reboot of the virtual machine to take effect...",
          },
          {
            allChangeKeysNum: changeKeys.length,
            needRebotKeysNum: _.sumBy(
              confirmList,
              (item) => (item.value as string[])?.length,
            ),
          },
        )}
        onOk={(needRebot) => onOk(payload, needRebot)}
      />
      <GuestTools
        detail={current}
        visible={guestToolModalVisible}
        setVisible={setGuestToolModalVisible}
      />
    </>
  );
};

export default EditInstance;
