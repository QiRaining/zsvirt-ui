import { gql } from "@apollo/client";
import BasicCard from "@zstack/virtualization-resource/src/pages/vm/create-vm-by-resource/vm-template/basic-card";
import ModalZSV from "@zstack/virtualization-resource/src/pages/vm/create/components/modal-zsv";
import { useResourceConfigQuery } from "@zstack/virtualization-resource/src/pages/vm/hooks/use-resource-config-query";
import { ZSVForm } from "@zstack/zsphere-components";
import { Form } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  VmTemplate as IVMTemplate,
} from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import { useTransformPayload } from "./hook/use-transform-payload";
import { getOriginConfigForEditingTemplate } from "./utils/get-origin-config";
import { initialValues, nicProps, volumeProps } from "./utils/index";

import style from "./style.module.less";

const { Item } = Form;

const editVmTemplateConfig = gql`
  mutation updateVmTemplate($input: UpdateVmTemplateInput!) {
    updateVmTemplate(input: $input) {
      actionId
    }
  }
`;

const EditTemplateConfig: React.FC<IActionWrapperProps<IVMTemplate>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();

  const [originConfig, setOriginConfig] = useState<any>();

  //转换Key的部分
  const {
    vmData,
    updateKey2Payload,
    payload,
    volumeTransform,
    nicTransform,
    cdromTransform,
    usbTransform,
    gpuTransform,
    _getNeedRebootKey,
    _confirmList,
    _changeKeys,
    _resetConfig,
    _getDisabledConfig,
  } = useTransformPayload(selectedList?.[0]?.uuid, visible);

  // const [confirmVisible, setConfirmVisible] = useState(false)

  //高级配置部分
  const [resourceConfig] = useResourceConfigQuery(
    selectedList?.[0]?.uuid,
    ["vm", "kvm", "pciDevice"],
    [
      "nicMultiQueueNum",
      "vm.cpu.hypervisor.feature",
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
    ],
    visible,
  );

  useEffect(() => {
    //设置回显值
    if (visible && _.keys(resourceConfig)?.length) {
      const config = getOriginConfigForEditingTemplate(vmData, resourceConfig);

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
    }
  }, [visible, resourceConfig, vmData]);

  // const disableCondigProps = useMemo(() => {
  //   return getDisabledConfig(vmData, resourceConfig)
  // }, [vmData, resourceConfig])

  const transformPayload = (value: any) => {
    const volumeValues = _.pickBy(
      value,
      (_value, key) => volumeProps.indexOf(key.split("-")[0]) > -1,
    );
    const originVolumeValues = _.pickBy(
      originConfig,
      (_value, key) => volumeProps.indexOf(key.split("-")[0]) > -1,
    );
    volumeTransform(volumeValues, originVolumeValues, vmData);

    const nicValues = _.pickBy(
      value,
      (_value, key) => nicProps.indexOf(key.split("-")[0]) > -1,
    );
    const originNicValues = _.pickBy(
      originConfig,
      (_value, key) => nicProps.indexOf(key.split("-")[0]) > -1,
    );
    nicTransform(nicValues, originNicValues, vmData);

    const cdromProps = ["cdRomList", "removecdrom", "cdRomListUuid"];
    const cdromValues = _.pickBy(
      value,
      (_value, key) => cdromProps.indexOf(key.split("-")[0]) > -1,
    );
    const originCdromValues = _.pickBy(
      originConfig,
      (_value, key) => cdromProps.indexOf(key.split("-")[0]) > -1,
    );
    cdromTransform(cdromValues, originCdromValues, vmData?.uuid);

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

  const onOk = (values: any, neeeReboot: boolean = false) => {
    try {
      const _payload = {
        ...values,
        neeeReboot,
      };
      doAction({
        mutation: editVmTemplateConfig,
        payload: _payload,
        name: intl.formatMessage({
          id: "instance.modal.title.edit.config",
          defaultMessage: "Modify Configuration",
        }),
        total: 1,
        onFinish: () => {
          form.resetFields();
          //resetConfig()
        },
        type: "VmInstance",
      });
    } catch (e) {
      console.log("修改配置", e);
    }
    // setConfirmVisible(false)
    setVisible(false);
  };

  const submitHandle = useCallback(
    async (e: any) => {
      transformPayload(e);
      if (_.keys(payload).length === 1) {
        return setVisible(false);
      }
      onOk(payload);
    },
    [payload],
  );

  const initValues = useMemo(() => {
    const instance = vmData as IVM;
    const { platform, guestOsType, group } = instance;
    const groupValue = group?.uuid && group?.uuid !== "" ? group?.uuid : "-2";
    return {
      ...initialValues,
      guest: platform,
      os: guestOsType,
      group: groupValue,
    };
  }, [selectedList, vmData]);

  return (
    <ModalZSV
      title={intl.formatMessage({
        id: "instance.modal.title.edit.template.config",
        defaultMessage: "Edit VM Template",
      })}
      className={style["create-vm-modal"]} //先改云主机，后续若全局，直接改组件
      form={form}
      width={800}
      visible={visible}
      setVisible={setVisible}
      onOk={submitHandle}
      destroyOnClose
      onCancel={() => setVisible(false)}
      getContainer={document.body}
    >
      <Form form={form} className={style.form} initialValues={initValues}>
        <ZSVForm.Card
          title={intl.formatMessage({
            id: "instance.modal.create.instance.by.template.card.title",
            defaultMessage: "Virtual Machine Template",
          })}
        >
          <Item
            name="vmTemplate"
            label={intl.formatMessage({
              id: "vmTemplate",
              defaultMessage: "Virtual Machine Template",
            })}
          >
            {selectedList?.[0]?.name}
          </Item>
        </ZSVForm.Card>
        <BasicCard form={form} source={selectedList?.[0] as IVMTemplate} />
        {/* <HardwareInfo setOriginConfig={setOriginConfig} form={form} source={selectedList?.[0]} /> */}
        {/*  <AdvancedCard form={form} visible={visible} /> */}
      </Form>
    </ModalZSV>
  );
};

export default EditTemplateConfig;
