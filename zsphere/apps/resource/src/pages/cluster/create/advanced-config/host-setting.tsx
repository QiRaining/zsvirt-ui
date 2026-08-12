import { Tooltip } from "@zstack/design";
import ModalZSV from "@zstack/virtualization-resource/src/pages/vm/create/components/modal-form";
import {
  Form,
  Switch,
  InputUnit as ZSInputUnit,
} from "@zstack/zsphere-components";
import type { globalConfigConfigList } from "@zstack/zsphere-hooks";
import { useLazyGlobalConfigQuery } from "@zstack/zsphere-hooks";
import { HostState } from "@zstack/zsphere-types";
import type {
  Cluster as ICluster,
  Zone as IZone,
} from "@zstack/zsphere-types/graphql";
import {
  parseNumber,
  isUint,
  isOfferingSize,
  transformKvmReservedMemory,
} from "@zstack/zsphere-utils";
import type { FormInstance } from "antd/es/form";
import _ from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const descriptionStyle = { marginBottom: 4 } as const;

const hostGlobalConfig: globalConfigConfigList = [
  {
    category: "kvm",
    name: "ignoreMsrs",
  },
  {
    category: "kvm",
    name: "reservedMemory",
  },
];

export interface IProps {
  form: FormInstance;
  isCreate?: boolean;
}

export const useMemoryUnitMap = () => {
  const memoryUnitMap = new Map([
    ["K", "KB"],
    ["M", "MB"],
    ["G", "GB"],
  ]);

  const memoryUnitList = [...memoryUnitMap.entries()].map(
    ([value, displayName]) => ({
      displayName,
      value,
    }),
  );

  return { memoryUnitMap, memoryUnitList };
};

interface IInputUnitProps {
  unitList: Array<{ displayName: string; value: string; disabled?: boolean }>;
  value?: { number?: number; unit?: string };
  onChange?: (value: any) => void;
}

export const InputUnit: React.FC<IInputUnitProps> = ({
  value,
  onChange: _onChange,
  ...props
}) => {
  const [state, onChange] = React.useState<{
    number?: number;
    unit?: string;
  }>();

  React.useEffect(() => {
    if (value && typeof value !== "string") {
      onChange(value);
    }
  }, [value]);

  React.useEffect(() => {
    if (_onChange) {
      _onChange(`${state?.number}${state?.unit}`);
    }
  }, [state]);

  return <ZSInputUnit {...props} value={state} onChange={onChange} />;
};

const HostSetting: React.FC<IProps> = ({ form, isCreate }) => {
  const intl = useIntl();
  const { memoryUnitList } = useMemoryUnitMap();

  const { queryGlobalConfig, globalConfigDataMap } =
    useLazyGlobalConfigQuery(hostGlobalConfig);

  const { source, selectedList } =
    ModalZSV.useModalFormContext<
      any,
      (IZone | ICluster) & { __typename: string }
    >() ?? {};

  const resource = React.useMemo(
    () => selectedList?.[0] ?? source,
    [selectedList, source],
  );

  const hugepageDisabled = React.useMemo(() => {
    if (resource.__typename === "Zone") {
      return false;
    }

    const hostList = _.compact((resource as ICluster).hostList);
    if (resource.__typename === "Cluster" && !_.isEmpty(hostList)) {
      return hostList?.some((it) => it.state !== HostState.Maintenance);
    }

    return false;
  }, [resource]);

  const getEnableHugepageOrNotFn = () =>
    form?.getFieldValue("premiumCluster-hugepage.enable");

  const validatorMemorySize = ({ getFieldValue }: any) => ({
    validateTrigger: ["onChange"],
    validator() {
      const enableHugepage = getEnableHugepageOrNotFn();
      const { unit, number } =
        transformKvmReservedMemory(getFieldValue("kvm-reservedMemory")) ?? {};

      if (unit === undefined || (!number && Number(number) !== 0)) {
        return Promise.resolve();
      }

      if (enableHugepage && parseNumber(number, unit) < parseNumber(4, "G")) {
        return Promise.reject(
          intl.formatMessage({
            id: "virtualization.cluster.field.reservedMemory.validator.enableHugepage.text",
            defaultMessage: "Memory has been enabled for large pages, and the host needs to reserve at least 4GB of memory.",
          }),
        );
      }

      const size = Number(parseNumber(number, unit));

      if (Number(size) === 0 || size < 0) {
        return Promise.reject(
          intl.formatMessage({
            id: "reserved.capacity.validate.range",
            defaultMessage: "Enter an integer. The size shall range from 1 B to 1 TB.",
          }),
        );
      }

      // 验证容量有效性
      if (typeof number === "number" && unit) {
        if (!isUint(number) || !isOfferingSize(`${number}${unit}`)) {
          return Promise.reject(
            intl.formatMessage({
              id: "virtualization.memory.card.field.memory.validator.valueRange",
              defaultMessage: "Invalid capacity.",
            }),
          );
        }
      }

      return Promise.resolve();
    },
  });

  React.useEffect(() => {
    if (isCreate) {
      queryGlobalConfig?.();
    }
  }, [isCreate, queryGlobalConfig]);

  React.useEffect(() => {
    const setFields = () => {
      const excludeKeys: string[] = [];

      const dataMap = _.omit(globalConfigDataMap, excludeKeys);

      const fields = Object.entries(dataMap).map(([key, { value }]) => {
        let _value = ["true", "false"].includes(value)
          ? JSON.parse(value)
          : value;

        if (key === "kvm-reservedMemory") {
          _value = transformKvmReservedMemory(_value);
        }

        return { name: key, value: _value };
      });

      form?.setFields(fields);
    };

    if (isCreate) {
      setFields();
    }
  }, [isCreate, globalConfigDataMap, form]);

  return (
    <>
      <Form.Item
        label={intl.formatMessage({
          id: "virtualization.cluster.field.checkCpuModel",
          defaultMessage: "Host CPU Model Check",
        })}
        name="checkCpuModel"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.cluster.field.checkCpuModel.iconTooltip",
              defaultMessage: `
iconTooltip`,
            })}
          </ReactMarkdown>
        }
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          id: "virtualization.cluster.field.ignoreMsrs",
          defaultMessage: "ignore_msrs Option",
        })}
        name="kvm-ignoreMsrs"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.cluster.field.ignoreMsrs.tooltip",
              defaultMessage: `
iconTooltip`,
            })}
          </ReactMarkdown>
        }
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          id: "virtualization.cluster.field.enable.zeroCopy",
          defaultMessage: "Host Zero Copy",
        })}
        name="premiumCluster-enable.zeroCopy"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.cluster.field.enable.zeroCopy.tooltip",
              defaultMessage: `
iconTooltip`,
            })}
          </ReactMarkdown>
        }
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          id: "virtualization.cluster.field.hugepage.enable",
          defaultMessage: "Huge Pages",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.cluster.field.hugepage.enable.tooltip",
              defaultMessage: `
iconTooltip`,
            })}
          </ReactMarkdown>
        }
        description={
          <div style={descriptionStyle}>
            {intl.formatMessage({
              id: "virtualization.cluster.field.hugepage.enable.desc",
              defaultMessage:
                "To enable hugepages, ensure all hosts in the cluster are in maintenance mode. Turning on/off this switch requires a host reboot to take effect.",
            })}
          </div>
        }
      >
        <Tooltip
          title={
            hugepageDisabled
              ? intl.formatMessage({
                  id: "virtualization.cluster.field.hugepage.enable.switch.tooltip",
                  defaultMessage:
                    "Before enabling large pages of memory for a cluster, ensure all hosts within the cluster enter maintenance mode...",
                })
              : undefined
          }
        >
          <span>
            <Form.Item
              noStyle
              name="premiumCluster-hugepage.enable"
              valuePropName="checked"
            >
              <Switch disabled={hugepageDisabled} />
            </Form.Item>
          </span>
        </Tooltip>
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev["premiumCluster-hugepage.enable"] !==
          curr["premiumCluster-hugepage.enable"]
        }
      >
        {() => {
          const enableHugepage = getEnableHugepageOrNotFn();

          const unitList = memoryUnitList.map((it) =>
            enableHugepage && ["K", "M"].includes(it.value)
              ? { ...it, disabled: true }
              : it,
          );

          return (
            <Form.Item
              label={intl.formatMessage({
                id: "virtualization.cluster.field.reservedMemory",
                defaultMessage: "Host Reserved Memory",
              })}
              name="kvm-reservedMemory"
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "virtualization.cluster.field.reservedMemory.tooltip",
                    defaultMessage: `
    iconTooltip`,
                  })}
                </ReactMarkdown>
              }
              rules={[validatorMemorySize]}
            >
              <InputUnit unitList={unitList} />
            </Form.Item>
          );
        }}
      </Form.Item>
    </>
  );
};

export default HostSetting;
