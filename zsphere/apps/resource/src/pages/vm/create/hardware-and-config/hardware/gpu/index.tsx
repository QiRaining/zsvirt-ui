import { Tooltip, RadioGroup } from "@zstack/design";
import GpuDeviceList from "@zstack/virtualization-resource/src/pages/gpu-device/list/index";
import VGpuList from "@zstack/virtualization-resource/src/pages/vgpu-device/list/index";
import { ConfigContext } from "@zstack/virtualization-resource/src/pages/vm/action/edit-config/config-context";
import { ModalSelect } from "@zstack/zsphere-components";
import { Form, useAuth } from "@zstack/zsphere-components";
import { useValidator, IIsRequiredType } from "@zstack/zsphere-hooks";
import type { FormCreateType } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { PciDevice, VGpuDevice } from "@zstack/zsphere-types/graphql";
import { formatConditions, parseNumber } from "@zstack/zsphere-utils";
import { keys as _keys } from "lodash-es";
import React, { useContext, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  index: number;
  source?: any;
  isEdit?: boolean;
  originValue?: PciDevice;
}

const { Item } = Form;

const GPUCard: React.FC<IProps> = ({
  form,
  index,
  source,
  originValue,
  isEdit = false,
}) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  const { hasAuth } = useAuth();
  const disabledConfig = useContext(ConfigContext);

  const disabledVgpuSelectFlag: boolean = useMemo(() => {
    //
    return !!(isEdit && source?.state === "Running" && originValue?.parentUuid);
  }, [source, originValue, isEdit]);

  const disabledVgpuRadioFlag: boolean = useMemo(() => {
    //
    return !!(isEdit && source?.state === "Running");
  }, [source, originValue, isEdit]);

  useEffect(() => {
    form.setFields([
      // 动态设置 shouldupdate 才能监听到变化
      {
        name: `gpuDeviceType-${index}`,
        value: originValue?.parentUuid ? "vgpu" : "gpu",
      },
    ]);
    return () => {
      form.setFields([
        // 动态设置 shouldupdate 才能监听到变化
        {
          name: `gpuDeviceType-${index}`,
          value: undefined,
        },
      ]);
    };
  }, [originValue]);

  const getDefaultQuery = (values: any) => {
    let gpudefaultQuery;
    let vgpuDeviceDefaultQuery;
    const selectedGpuUuids = _keys(values)
      .filter(
        (key) =>
          key.indexOf("gpuDevice-") === 0 &&
          values?.[key]?.length &&
          key.split("gpuDevice-")?.[1] !== index.toString(),
      )
      .map((key) => values?.[key]?.[0]?.uuid);
    if (!isEdit) {
      const l3NetworkUuids = _keys(values)
        .filter(
          (key) => key.indexOf("l3NetworkUuids-") > -1 && values?.[key]?.length,
        )
        .map((key) => values?.[key]?.[0]?.uuid);

      const commonContidions = {
        cpuNum: values.totalCoreNum,
        memorySize:
          values.memorySize?.number &&
          parseNumber(values.memorySize?.number, values.memorySize.unit),
        imageUuid: values?.[`l3NetworkUuids-0`]?.[0]?.uuid,
        l3NetworkUuids,
        hostUuid:
          values?.runPath?.[0]?.__typename === "HostVO"
            ? values?.runPath?.[0]?.uuid
            : undefined,
        clusterUuids: source?.__typename === "Cluster" ? [source?.uuid] : [],
      };

      gpudefaultQuery = {
        conditions: [
          { key: "virtStatus", op: Op.ne, value: "SRIOV_VIRTUAL" },
          { key: "uuid", op: Op.notIn, values: selectedGpuUuids },
        ],
        type: "candidateForCreatingVm",
        extraConditions: [
          ...formatConditions({
            ...commonContidions,
            types: ["GPU_Video_Controller", "GPU_3D_Controller"],
          }),
        ],
      };

      vgpuDeviceDefaultQuery = {
        extraConditions: [
          ...formatConditions({
            ...commonContidions,
            types: ["GPU_Video_Controller", "GPU_3D_Controller"],
          }),
        ],
        type: "candidateForCreateVm",
      };
    } else {
      gpudefaultQuery = {
        type: "candidateForAttachToVm",
        extraConditions: [
          { key: "vmInstanceUuid", op: Op.eq, value: source?.uuid },
          {
            key: "types",
            op: Op.in,
            values: ["GPU_Video_Controller", "GPU_3D_Controller"],
          },
        ],
        conditions: [
          {
            key: "type",
            op: Op.in,
            values: ["GPU_Video_Controller", "GPU_3D_Controller"],
          },
          { key: "virtStatus", op: Op.ne, value: "SRIOV_VIRTUAL" },
          { key: "uuid", op: Op.notIn, values: selectedGpuUuids },
        ],
      };

      vgpuDeviceDefaultQuery = {
        type: "candidateForAttachToVm",
        extraConditions: [
          { key: "vmInstanceUuid", op: Op.eq, value: source.uuid },
        ],
      };
    }
    return { vgpuDeviceDefaultQuery, gpudefaultQuery };
  };

  const hasVGpuAuth = hasAuth({
    type: "block",
    resource: "host",
    authKey: "vgpu",
  });

  return (
    <div className={styles.content}>
      {originValue?.uuid ? (
        <Item
          name={`gpuDeviceType-${index}`}
          label={intl.formatMessage({
            id: "gpu.type",
            defaultMessage: "Type",
          })}
        >
          {originValue.parentUuid && hasVGpuAuth
            ? intl.formatMessage({
                id: "zsv.create.instance.hardware.gpu.type.vgpu",
                defaultMessage: "vGPU",
              })
            : intl.formatMessage({
                id: "zsv.create.instance.hardware.gpu.type.physical.gpu",
                defaultMessage: "pGPU",
              })}
        </Item>
      ) : (
        <Item
          noStyle
          shouldUpdate={(pre, cur) => {
            const keys = _keys(cur).filter(
              (key) =>
                key.indexOf("gpuDevice") > -1 &&
                key.split("-")[1] !== index.toString(),
            );
            return keys.some((key) => pre[key] !== cur[key]);
          }}
        >
          {({ getFieldsValue }) => {
            const values = getFieldsValue();
            const disabledVgpu =
              _keys(values).filter(
                (key) =>
                  key.indexOf("gpuDeviceType-") === 0 &&
                  key.split("-")[1] !== index.toString(),
              )?.length > 0;
            return (
              <Item
                preserve
                name={`gpuDeviceType-${index}`}
                label={intl.formatMessage({
                  id: "gpuType",
                  defaultMessage: "GPU Type",
                })}
              >
                <RadioGroup
                  onValueChange={() =>
                    form.setFields([
                      {
                        name: `gpuDevice-${index}`,
                        value: [],
                      },
                    ])
                  }
                  options={[
                    {
                      value: "gpu",
                      label: intl.formatMessage({
                        id: "zsv.create.instance.hardware.gpu.type.physical.gpu",
                        defaultMessage: "pGPU",
                      }),
                    },
                    ...(hasVGpuAuth
                      ? [
                          {
                            value: "vgpu",
                            label: (
                              <Tooltip
                                title={
                                  disabledVgpuRadioFlag
                                    ? intl.formatMessage({
                                        id: "edit.vm.disable.vgpu.selection.tooltip",
                                        defaultMessage:
                                          "vGPU devices do not support hot plugging. Power off the VM and try again.",
                                      })
                                    : ""
                                }
                              >
                                {intl.formatMessage({
                                  id: "zsv.create.instance.hardware.gpu.type.vgpu",
                                  defaultMessage: "vGPU",
                                })}
                              </Tooltip>
                            ),
                            disabled: disabledVgpu || disabledVgpuRadioFlag,
                          },
                        ]
                      : []),
                  ]}
                />
              </Item>
            );
          }}
        </Item>
      )}
      <Item
        noStyle
        shouldUpdate={(pre, cur) => {
          const keys = _keys(cur).filter(
            (key) => key.indexOf("gpuDevice") > -1,
          );
          return keys.some((key) => pre[key] !== cur[key]);
        }}
      >
        {({ getFieldsValue }) => {
          const values = getFieldsValue();
          const { gpudefaultQuery, vgpuDeviceDefaultQuery } =
            getDefaultQuery(values);
          if (values[`gpuDeviceType-${index}`] === "gpu") {
            return (
              <Item
                required
                tooltip={
                  originValue &&
                  disabledConfig.pciDeviceDisabled &&
                  disabledConfig.tooltip
                }
                name={`gpuDevice-${index}`}
                label={intl.formatMessage({
                  id: "gpu.device",
                  defaultMessage: "GPU Device",
                })}
                rules={[
                  isRequired(
                    IIsRequiredType.select,
                    intl.formatMessage({
                      id: "gpu.device",
                      defaultMessage: "GPU Device",
                    }),
                  ),
                ]}
              >
                <ModalSelect
                  disabledBtn={originValue && disabledConfig.pciDeviceDisabled}
                  disabledItem={originValue && disabledConfig.pciDeviceDisabled}
                  className={styles.width200}
                  title={intl.formatMessage({
                    id: "virtualization.create.instance.hardware.gpu.type.gpu.modal.title",
                    defaultMessage: "Select pGPU Device",
                  })}
                >
                  <GpuDeviceList
                    extraDataList={originValue ? [originValue] : []}
                    view="select"
                    defaultQuery={gpudefaultQuery}
                  />
                </ModalSelect>
              </Item>
            );
          }
          return (
            <Item
              required
              tooltip={
                originValue &&
                disabledConfig.pciDeviceDisabled &&
                disabledConfig.pciDeviceTooltip
              }
              name={`gpuDevice-${index}`}
              label={intl.formatMessage({
                id: "gpu.device",
                defaultMessage: "GPU Device",
              })}
              rules={[
                isRequired(
                  IIsRequiredType.select,
                  intl.formatMessage({
                    id: "gpu.device",
                    defaultMessage: "GPU Device",
                  }),
                ),
              ]}
            >
              <ModalSelect
                disabledBtn={
                  (originValue && disabledConfig.pciDeviceDisabled) ||
                  disabledVgpuSelectFlag
                }
                disabledItem={
                  (originValue && disabledConfig.pciDeviceDisabled) ||
                  disabledVgpuSelectFlag
                }
                className={styles.width200}
                title={intl.formatMessage({
                  id: "virtualization.create.instance.hardware.gpu.type.vgpu.modal.title",
                  defaultMessage: "Select vGPU Device",
                })}
              >
                <VGpuList
                  extraDataList={originValue ? [originValue as VGpuDevice] : []}
                  view="select"
                  defaultQuery={vgpuDeviceDefaultQuery}
                />
              </ModalSelect>
            </Item>
          );
        }}
      </Item>
    </div>
  );
};

export default React.memo(GPUCard);
