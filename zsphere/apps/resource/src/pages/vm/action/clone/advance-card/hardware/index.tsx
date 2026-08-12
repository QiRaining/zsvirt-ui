import {
  Button,
  Checkbox,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Text,
} from "@zstack/design";
import {
  FieldStack,
  InputField,
  InputNumberField,
  InputUnitField,
  RadioGroupField,
  SelectField,
  SwitchField,
} from "@zstack/form";
import { Icon } from "@zstack/icon";
import L3NetworkList from "@zstack/virtualization-resource/src/pages/l3-network/list";
import PrimaryStorageList from "@zstack/virtualization-resource/src/pages/primary-storage/list";
import SecurityGroupList from "@zstack/virtualization-resource/src/pages/security-group/list";
import { ModalSelect, SortableList } from "@zstack/zsphere-components";
import {
  ZSVHardwareTabs,
  ZSVHardwareTabsAddButton,
} from "@zstack/zsphere-design-biz";
import { Illustration } from "@zstack/zsphere-illustration";
import {
  L3NetworkQueryType,
  Op,
  PrimaryStorageType,
} from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import {
  formatBytesToSize,
  formatStorageToObj,
  ipv6Netmask2prefix,
} from "@zstack/zsphere-utils";
import { compact, isNil, orderBy } from "lodash-es";
import React, { useEffect, useMemo, useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { getNicTypeByOs } from "../../../../create/basic-config/os";
import { useQueryReleatedResource } from "../../../edit-config/hardware/hooks";
import type { CloneVmValues } from "../../schema";
import { CloneTypeEnum } from "../../utils";

interface HardwareProps {
  form: UseFormReturn<CloneVmValues>;
  visible?: boolean;
  sourceVm?: IVM;
  currentCloneType: CloneTypeEnum;
}

interface ModalSelectFieldProps {
  form: UseFormReturn<CloneVmValues>;
  name: string;
  label: React.ReactNode;
  title: string;
  children: React.ReactElement;
  required?: boolean;
  selectType?: "radio" | "checkbox";
  transformKey?: string;
  disabled?: boolean;
  labelTooltip?: React.ReactNode;
  className?: string;
  autoDispatch?: boolean;
  requiredMessage?: string;
  onValueChange?: (value: unknown) => void;
  renderSelectedList?: () => React.ReactNode;
}

const isEmptySelectedList = (value: unknown) =>
  !Array.isArray(value) || value.length === 0;

const ModalSelectField: React.FC<ModalSelectFieldProps> = ({
  form,
  name,
  label,
  title,
  children,
  required,
  selectType = "radio",
  transformKey,
  disabled,
  labelTooltip,
  className,
  autoDispatch,
  requiredMessage,
  onValueChange,
  renderSelectedList,
}) => (
  <FormField
    control={form.control}
    name={name as any}
    render={({ field }) => (
      <FormItem className="flex min-h-8 flex-row items-start gap-2">
        <FormLabel
          className="mt-[5px] flex"
          required={required}
          info={labelTooltip}
        >
          {label}
        </FormLabel>
        <div className="flex flex-col">
          <FormControl>
            <ModalSelect
              title={title}
              value={field.value}
              onChange={(value: unknown) => {
                field.onChange(value);
                onValueChange?.(value);

                if (!required) {
                  return;
                }

                if (isEmptySelectedList(value)) {
                  form.setError(name as any, {
                    type: "required",
                    message: requiredMessage,
                  });
                } else {
                  form.clearErrors(name as any);
                }
              }}
              selectType={selectType}
              transformKey={transformKey}
              disabledItem={disabled}
              disabledBtn={disabled}
              className={className ?? "!w-80"}
              modalWidth={800}
              autoDispatch={autoDispatch}
              renderSelectedList={renderSelectedList}
            >
              {children}
            </ModalSelect>
          </FormControl>
          <FormMessage />
        </div>
      </FormItem>
    )}
  />
);

const provisionOptions = [
  { label: "厚置备", value: "ThickProvisioning" },
  { label: "精简置备", value: "ThinProvisioning" },
];

const nicTypeOptions = [
  { label: "e1000", value: "e1000" },
  { label: "rtl8139", value: "rtl8139" },
  { label: "virtio", value: "virtio" },
  { label: "pcnet", value: "pcnet" },
];

const FIELD_WIDTH_200 = "!w-[200px]";
const FIELD_WIDTH_100 = "!w-[100px]";
const FIELD_WIDTH_80 = "!w-20";
const L3_NETWORK_LIST_CLASS = "[&_.ant-table-content]:h-80";
const SORTABLE_LIST_CLASS =
  "max-h-60 overflow-y-auto rounded-xs border border-solid border-neutral-400 [&+.zstack-virtualization-modal-select-add]:h-auto [&+.zstack-virtualization-modal-select-add]:!pb-0 [&_.sortable-item-container]:!mb-0 [&_.sortable-item-container]:!border-b [&_.sortable-item-container]:!border-solid [&_.sortable-item-container]:!border-neutral-400 [&_.sortable-item-container]:!bg-transparent [&_.sortable-item-container:last-child]:!border-b-0";
const CHILD_CARD_CLASS = "mb-3 border-l border-solid border-neutral-300 pl-3";
const QOS_CARD_CLASS =
  "relative mb-3 border-l border-solid border-neutral-300 pl-3";
const nicBandWidthOptions = ["Kbps", "Mbps", "Gbps"].map((unit) => ({
  value: unit,
  displayName: unit,
}));

const getHardwareIcon = (type: "disk" | "netcard" | "tpm") => {
  const iconMap = {
    disk: "disk",
    netcard: "netcard",
    tpm: "illustration-lock",
  };

  return iconMap[type];
};

const getHardwareEmptyText = (
  intl: ReturnType<typeof useIntl>,
  type: "disk" | "netcard",
) =>
  intl.formatMessage(
    type === "disk"
      ? {
          id: "disk.alert.in.hardware.item",
          defaultMessage: "Not Configured",
        }
      : {
          id: "nic.alert.in.hardware.item",
          defaultMessage: "Not Configured",
        },
  );

const ReadonlyField: React.FC<{
  label: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <FormItem className="flex min-h-8 flex-row items-start gap-2">
    <FormLabel className="mt-[5px] flex">{label}</FormLabel>
    <div className="mt-[5px] flex min-h-5 items-center text-sm text-neutral-700">
      {children}
    </div>
  </FormItem>
);

const NicCheckboxField: React.FC<{
  form: UseFormReturn<CloneVmValues>;
  name: string;
  label: React.ReactNode;
  checkboxLabel: React.ReactNode;
  disabled?: boolean;
  labelTooltip?: React.ReactNode;
}> = ({ form, name, label, checkboxLabel, disabled, labelTooltip }) => (
  <FormField
    control={form.control}
    name={name as any}
    render={({ field }) => {
      const id = `clone-${name}`;

      return (
        <FormItem className="flex min-h-8 flex-row items-start gap-2">
          <FormLabel className="mt-[5px] flex" info={labelTooltip}>
            {label}
          </FormLabel>
          <FormControl>
            <div className="flex h-8 items-center">
              <Checkbox
                id={id}
                checked={!!field.value}
                disabled={disabled}
                onCheckedChange={(val) => field.onChange(val === true)}
              />
              <label
                htmlFor={id}
                className="cursor-pointer pl-2 text-sm !text-neutral-700"
              >
                {checkboxLabel}
              </label>
            </div>
          </FormControl>
        </FormItem>
      );
    }}
  />
);

const NicDnsField: React.FC<{
  form: UseFormReturn<CloneVmValues>;
  index?: number;
  isWindows?: boolean;
  ipVersion?: 4 | 6 | 46;
  disabled?: boolean;
}> = ({ form, index = 0, isWindows, ipVersion = 46, disabled }) => {
  const intl = useIntl();
  const fieldNamePostfix = ipVersion === 46 ? "" : ipVersion.toString();
  const allocTypeFieldName = isWindows
    ? `dnsAllocationType${fieldNamePostfix}-${index}`
    : `dnsAllocationType${fieldNamePostfix}`;
  const dnsListFieldName = isWindows
    ? `dnsList${fieldNamePostfix}-${index}`
    : `dnsList${fieldNamePostfix}`;
  const maxDnsNum = isWindows ? 2 : 3;
  const dnsList = form.watch(dnsListFieldName as any) ?? [""];
  const allocationType = form.watch(allocTypeFieldName as any) ?? "auto";
  const labelPrefix =
    isWindows && fieldNamePostfix ? `IPv${fieldNamePostfix} ` : "";
  const typeLabel = `${labelPrefix}${intl.formatMessage({
    id: "vm.create.field.dns.allocation.type",
    defaultMessage: "Assign DNS",
  })}`;
  const dnsLabel = `${labelPrefix}${intl.formatMessage({
    id: "dns",
    defaultMessage: "DNS",
  })}`;

  const setDnsList = (nextList: string[]) => {
    form.setValue(dnsListFieldName as any, nextList as any, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  return (
    <>
      <SelectField
        form={form}
        name={allocTypeFieldName as any}
        label={typeLabel}
        labelTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vm.create.field.dns.allocation.type.tooltip",
              defaultMessage:
                "### Assign DNS\n\nBy default, the system automatically assigns DNS addresses, but you can manually specify a DNS.\n\n1. Auto Allocated:\n	- If DHCP is enabled on the distributed port group, DNS can be automatically assigned.\n	- If DHCP is disabled on the distributed port group, DNS will be assigned and take effect through VMTools.\n2. Manual Allocation: Manually configured DNS will be assigned and take effect through VMTools.\n\nNotes:\n\n- If VMTools is not installed on the VM, the DNS configuration will take effect after VMTools installation is completed.\n- For Linux VMs, DNS can only be configured for NIC 1, with a maximum of 3 DNS addresses suppported.\n- For Windows VMs, DNS can be configured for all NICs, with a maximum of 3 DNS addresses per NIC.",
            })}
          </ReactMarkdown>
        }
        className={FIELD_WIDTH_200}
        disabled={disabled}
        options={[
          {
            label: intl.formatMessage({
              id: "vm.create.field.dns.allocation.type.auto",
              defaultMessage: "Auto Allocated",
            }),
            value: "auto",
          },
          {
            label: intl.formatMessage({
              id: "vm.create.field.dns.allocation.type.manual",
              defaultMessage: "Manual Allocation",
            }),
            value: "manual",
          },
        ]}
      />
      {allocationType === "manual" ? (
        <FormItem className="flex flex-row gap-2">
          <FormLabel className="mt-[5px] flex">{dnsLabel}</FormLabel>
          <div className="flex flex-col gap-2">
            {dnsList.map((_dns: string, dnsIndex: number) => (
              <div className="flex items-center gap-2" key={dnsIndex}>
                <InputField
                  form={form}
                  name={`${dnsListFieldName}.${dnsIndex}` as any}
                  label={null}
                  className={FIELD_WIDTH_200}
                  disabled={disabled}
                  rowClassName="gap-0"
                  labelClassName="hidden"
                />
                {!disabled ? (
                  <Icon
                    className="cursor-pointer text-neutral-600"
                    size={16}
                    type="trash"
                    onClick={() =>
                      setDnsList(
                        dnsList.filter(
                          (_: string, i: number) => i !== dnsIndex,
                        ),
                      )
                    }
                  />
                ) : null}
              </div>
            ))}
            {!disabled ? (
              <Button
                className="!px-0"
                variant="link"
                icon={<Icon type="plus" />}
                disabled={dnsList.length >= maxDnsNum}
                onClick={() => setDnsList([...dnsList, ""])}
              >
                {intl.formatMessage({
                  id: "add.dns",
                  defaultMessage: "Add DNS",
                })}{" "}
                {`(${dnsList.length}/${maxDnsNum})`}
              </Button>
            ) : null}
          </div>
        </FormItem>
      ) : null}
    </>
  );
};

const NicQosFields: React.FC<{
  form: UseFormReturn<CloneVmValues>;
  index: number;
}> = ({ form, index }) => {
  const intl = useIntl();
  const qosEnabled = useWatch({
    control: form.control,
    name: `netCardQosEnabled-${index}` as any,
  });

  useEffect(() => {
    if (!qosEnabled) {
      return;
    }

    const inboundBandwidth = form.getValues(`inboundBandwidth-${index}` as any);
    const outboundBandwidth = form.getValues(
      `outboundBandwidth-${index}` as any,
    );

    if (!inboundBandwidth) {
      form.setValue(`inboundBandwidth-${index}` as any, {
        number: undefined,
        unit: "Kbps",
      });
    }
    if (!outboundBandwidth) {
      form.setValue(`outboundBandwidth-${index}` as any, {
        number: undefined,
        unit: "Kbps",
      });
    }
  }, [form, index, qosEnabled]);

  if (!qosEnabled) {
    return null;
  }

  return (
    <div className={QOS_CARD_CLASS}>
      <FieldStack>
        <InputUnitField
          form={form}
          name={`outboundBandwidth-${index}` as any}
          label={intl.formatMessage({
            id: "sed.boundBandwidth",
            defaultMessage: "Transmit Bandwidth",
          })}
          className={FIELD_WIDTH_80}
          unitClassName={FIELD_WIDTH_100}
          labelClassName="-mr-3 pl-3"
          unitList={nicBandWidthOptions}
          inputTooltip={intl.formatMessage({
            id: "vm.field.bandwidth.tooltip",
            defaultMessage: "Bandwidth range: 8 Kpbs – 30 Gbps",
          })}
        />
        <InputUnitField
          form={form}
          name={`inboundBandwidth-${index}` as any}
          label={intl.formatMessage({
            id: "receive.boundBandwidth",
            defaultMessage: "Receive Bandwidth",
          })}
          className={FIELD_WIDTH_80}
          unitClassName={FIELD_WIDTH_100}
          labelClassName="-mr-3 pl-3"
          unitList={nicBandWidthOptions}
          inputTooltip={intl.formatMessage({
            id: "vm.field.bandwidth.tooltip",
            defaultMessage: "Bandwidth range: 8 Kpbs – 30 Gbps",
          })}
        />
      </FieldStack>
    </div>
  );
};

const Hardware: React.FC<HardwareProps> = ({
  form,
  visible,
  sourceVm,
  currentCloneType,
}) => {
  const intl = useIntl();
  const l3NetworkRequiredMessage = intl.formatMessage({
    id: "instance.field.l3NetworkUuids.validator.required",
    defaultMessage: "Select Distributed Port Group",
  });
  const relatedData = useQueryReleatedResource(
    sourceVm?.uuid ?? "",
    sourceVm?.hostUuid ?? sourceVm?.lastHostUuid,
    sourceVm?.defaultL3NetworkUuid,
    sourceVm as any,
  );
  const [nicIndexes, setNicIndexes] = useState<number[]>([]);
  const [activeHardwareKey, setActiveHardwareKey] = useState("");
  const watchedValues = useWatch({ control: form.control });

  const isFastClone = currentCloneType === CloneTypeEnum.FastFullClone;
  const sourceVolumeList = useMemo(
    () => relatedData?.volumeList ?? [],
    [relatedData?.volumeList],
  );
  const sourceNicList = useMemo(
    () => relatedData?.nicList ?? [],
    [relatedData?.nicList],
  );

  useEffect(() => {
    if (!visible || !relatedData) {
      return;
    }

    sourceVolumeList.forEach((volume: any, index: number) => {
      form.setValue(`diskUuid-${index}` as any, volume.uuid);
      form.setValue(
        `storePath-${index}` as any,
        volume.primaryStorage ? [volume.primaryStorage] : [],
      );
      form.setValue(
        `allocationType-${index}` as any,
        volume?.systemTag?.VolumeProvisioningStrategy ?? "ThickProvisioning",
      );
    });

    const indexes = sourceNicList.map((_nic: any, index: number) => index);
    setNicIndexes(indexes);
    sourceNicList.forEach((nic: any, index: number) => {
      const ipv4 = nic.usedIps?.find((item: any) => item.ipVersion === 4);
      const ipv6 = nic.usedIps?.find((item: any) => item.ipVersion === 6);
      form.setValue(`nicUuid-${index}` as any, nic.uuid);
      form.setValue(`netCardState-${index}` as any, nic.state === "enable");
      form.setValue(
        `l3NetworkUuids-${index}` as any,
        nic.l3Network ? [nic.l3Network] : [],
      );
      form.setValue(
        `nicType-${index}` as any,
        nic.driverType ??
          getNicTypeByOs(
            sourceVm?.platform as unknown as string,
            sourceVm?.guestOsType as unknown as string,
          ),
      );
      form.setValue(`gateway4-${index}` as any, ipv4?.gateway);
      form.setValue(`gateway6-${index}` as any, ipv6?.gateway);
      form.setValue(`netmask-${index}` as any, ipv4?.netmask);
      form.setValue(
        `prefixLen-${index}` as any,
        ipv6Netmask2prefix(ipv6?.netmask),
      );
      form.setValue(
        `securityGroup-${index}` as any,
        orderBy(compact(nic.securityGroup), "priority"),
      );
      form.setValue(
        `outboundBandwidth-${index}` as any,
        isNil(nic.nicBandWidth?.outboundBandwidth) ||
          nic.nicBandWidth?.outboundBandwidth === -1
          ? { number: undefined, unit: "Mbps" }
          : formatStorageToObj(nic.nicBandWidth.outboundBandwidth, 0, "bps"),
      );
      form.setValue(
        `inboundBandwidth-${index}` as any,
        isNil(nic.nicBandWidth?.inboundBandwidth) ||
          nic.nicBandWidth?.inboundBandwidth === -1
          ? { number: undefined, unit: "Mbps" }
          : formatStorageToObj(nic.nicBandWidth.inboundBandwidth, 0, "bps"),
      );
      form.setValue(
        `netCardQosEnabled-${index}` as any,
        !(
          (isNil(nic.nicBandWidth?.inboundBandwidth) ||
            nic.nicBandWidth?.inboundBandwidth === -1) &&
          (isNil(nic.nicBandWidth?.outboundBandwidth) ||
            nic.nicBandWidth?.outboundBandwidth === -1)
        ),
      );
      form.setValue(
        `nicMultiQueueNum-${index}` as any,
        nic?.resourceConfig?.nicMultiQueueNum?.toString(),
      );
      form.setValue(`dnsAllocationType4-${index}` as any, "auto");
      form.setValue(`dnsAllocationType6-${index}` as any, "auto");
      form.setValue(`dnsList4-${index}` as any, [""]);
      form.setValue(`dnsList6-${index}` as any, [""]);
    });
    form.setValue("dnsAllocationType" as any, "auto");
    form.setValue("dnsList" as any, [""]);
    if ((sourceVm as any)?.tpmList?.length) {
      form.setValue(
        "tpmVersion" as any,
        (sourceVm as any)?.tpmList?.[0]?.version ?? "2.0",
      );
    }
  }, [form, relatedData, sourceNicList, sourceVm, sourceVolumeList, visible]);

  const primaryStorageDefaultQuery = useMemo(
    () => ({
      conditions: [
        { key: "zoneUuid", op: Op.eq, value: sourceVm?.zoneUuid },
        { key: "cluster.vmInstance.uuid", op: Op.eq, value: sourceVm?.uuid },
        { key: "attachedClusterUuids", op: Op.ne, value: "null" },
      ],
    }),
    [sourceVm?.uuid, sourceVm?.zoneUuid],
  );

  const l3DefaultQuery = useMemo(
    () => ({
      type: L3NetworkQueryType.CreateInstance,
      conditions: [
        { key: "l2Network.cluster.type", value: "zstack", op: Op.eq },
        { key: "defaultFilter", value: "NOT_DEFAULT" },
        { key: "zoneUuid", op: Op.eq, value: sourceVm?.zoneUuid },
        { key: "clusterUuid", op: Op.eq, value: sourceVm?.clusterUuid },
      ],
    }),
    [sourceVm?.clusterUuid, sourceVm?.zoneUuid],
  );

  const addNic = () => {
    const nextIndex = nicIndexes.length === 0 ? 0 : Math.max(...nicIndexes) + 1;
    setNicIndexes([...nicIndexes, nextIndex]);
    form.setValue(`netCardState-${nextIndex}` as any, true);
    form.setValue(`l3NetworkUuids-${nextIndex}` as any, []);
    form.setValue(
      `nicType-${nextIndex}` as any,
      getNicTypeByOs(
        sourceVm?.platform as unknown as string,
        sourceVm?.guestOsType as unknown as string,
      ),
    );
    form.setValue(`securityGroup-${nextIndex}` as any, []);
    form.setValue(`netCardQosEnabled-${nextIndex}` as any, false);
    form.setValue(`outboundBandwidth-${nextIndex}` as any, {
      number: undefined,
      unit: "Mbps",
    });
    form.setValue(`inboundBandwidth-${nextIndex}` as any, {
      number: undefined,
      unit: "Mbps",
    });
    form.setValue(
      `nicMultiQueueNum-${nextIndex}` as any,
      (sourceVm?.cpuNum ?? 1) < 12 ? String(sourceVm?.cpuNum ?? 1) : "12",
    );
    form.setValue(`dnsAllocationType4-${nextIndex}` as any, "auto");
    form.setValue(`dnsAllocationType6-${nextIndex}` as any, "auto");
    form.setValue(`dnsList4-${nextIndex}` as any, [""]);
    form.setValue(`dnsList6-${nextIndex}` as any, [""]);
  };

  const removeNic = (index: number) => {
    setNicIndexes(nicIndexes.filter((item) => item !== index));
    [
      "nicUuid",
      "netCardState",
      "l3NetworkUuids",
      "nicType",
      "gateway4",
      "gateway6",
      "netmask",
      "prefixLen",
      "securityGroup",
      "outboundBandwidth",
      "inboundBandwidth",
      "netCardQosEnabled",
      "nicMultiQueueNum",
      "customMac",
      "ipv4",
      "ipv6",
      "appointIpv4",
      "appointIpv6",
      "dnsAllocationType4",
      "dnsAllocationType6",
      "dnsList4",
      "dnsList6",
    ].forEach((fieldName) => form.unregister(`${fieldName}-${index}` as any));
  };

  const hardwareTabs = [
    ...sourceVolumeList.map((volume: any, index: number) => ({
      key: `disk-${index}`,
      type: "disk" as const,
      label: intl.formatMessage(
        {
          id: "virtualization.hardware.item.disk.index",
          defaultMessage: "Disk {index}",
        },
        { index: index + 1 },
      ),
      description: volume.size
        ? formatBytesToSize(Number(volume.size))
        : getHardwareEmptyText(intl, "disk"),
      descriptionMuted: !volume.size,
      hasError: !volume.size,
      children: (
        <FieldStack>
          {isFastClone ? (
            <ReadonlyField
              label={intl.formatMessage({
                id: "clone.vm.disk.storage.path",
                defaultMessage: "Storage Location",
              })}
            >
              {intl.formatMessage({
                id: "auto.set",
                defaultMessage: "Auto Allocated",
              })}
            </ReadonlyField>
          ) : (
            <>
              <ModalSelectField
                form={form}
                name={`storePath-${index}`}
                label={intl.formatMessage({
                  id: "clone.vm.disk.storage.path",
                  defaultMessage: "Storage Location",
                })}
                title={intl.formatMessage({
                  id: "select.primaryStorage",
                  defaultMessage: "Select Data Storage",
                })}
                className={FIELD_WIDTH_200}
                autoDispatch
              >
                <PrimaryStorageList
                  view="select"
                  defaultQuery={primaryStorageDefaultQuery}
                />
              </ModalSelectField>
              {volume?.primaryStorage?.type ===
                PrimaryStorageType.SharedBlock && (
                <RadioGroupField
                  form={form}
                  name={`allocationType-${index}` as any}
                  label={intl.formatMessage({
                    id: "provisionMode",
                    defaultMessage: "Provision Method",
                  })}
                  options={provisionOptions.map((item) => ({
                    ...item,
                    label: intl.formatMessage({
                      id:
                        item.value === "ThinProvisioning"
                          ? "thinProvision"
                          : "thickProvision",
                      defaultMessage: item.label,
                    }),
                  }))}
                />
              )}
            </>
          )}
        </FieldStack>
      ),
    })),
    ...nicIndexes.map((index) => {
      const isBatchClone = Number(watchedValues?.count ?? 1) > 1;
      const portGroupFieldValue = (watchedValues as any)?.[
        `l3NetworkUuids-${index}`
      ];
      const selectedPortGroup = portGroupFieldValue?.[0];
      const appointIpv4 = (watchedValues as any)?.[`appointIpv4-${index}`];
      const appointIpv6 = (watchedValues as any)?.[`appointIpv6-${index}`];
      const selectedSgList = compact(
        (watchedValues as any)?.[`securityGroup-${index}`],
      );
      const dhcpEnabled = !!selectedPortGroup?.networkServices?.find(
        (item: any) => item.networkServiceType === "DHCP",
      );
      const hasIpv4Range = !!selectedPortGroup?.ipRanges?.find(
        (item: any) => item.ipVersion === 4 && item.ipRangeType === "Normal",
      );
      const hasIpv6Range = !!selectedPortGroup?.ipRanges?.find(
        (item: any) => item.ipVersion === 6 && item.ipRangeType === "Normal",
      );
      const guest = sourceVm?.platform as unknown as string;
      const isWindows = guest === "Windows";
      const isLinux = guest === "Linux";
      const sourceNic = sourceNicList[index];
      const hasPortGroupFieldValue = Array.isArray(portGroupFieldValue);
      const fallbackPortGroupName = sourceNic?.l3NetworkUuid
        ? intl.formatMessage(
            {
              id: "hardware.item.nic.name.show",
              defaultMessage: "{l3Uuid}",
            },
            {
              l3Uuid: sourceNic.l3NetworkUuid,
            },
          )
        : undefined;
      const fallbackPortGroup =
        sourceNic?.l3Network?.name ?? fallbackPortGroupName;
      const portGroupDescription = hasPortGroupFieldValue
        ? selectedPortGroup?.name
        : (selectedPortGroup?.name ?? fallbackPortGroup);
      const hasNicError = !portGroupDescription;
      const nicDescription =
        portGroupDescription ?? getHardwareEmptyText(intl, "netcard");

      return {
        key: `nic-${index}`,
        type: "netcard" as const,
        label: intl.formatMessage(
          {
            id: "virtualization.hardware.item.netcard.index",
            defaultMessage: "NIC {index}",
          },
          { index: index + 1 },
        ),
        description: nicDescription,
        descriptionMuted: hasNicError,
        hasError: hasNicError,
        canDelete: index >= sourceNicList.length,
        onDelete: () => removeNic(index),
        children: (
          <FieldStack>
            <SwitchField
              form={form}
              name={`netCardState-${index}` as any}
              label={intl.formatMessage({
                id: "enable.state",
                defaultMessage: "State",
              })}
            />
            <SelectField
              form={form}
              name={`nicType-${index}` as any}
              label={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.netcard.type",
                defaultMessage: "NIC Model",
              })}
              labelTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "vm.create.field.nicType.tooltip",
                    defaultMessage:
                      "### NIC Model\n\nSpecifies the NIC model for the VM, with Linux defaulting to virtio and Windows to e1000.\n\n\n* e1000: Emulates an Intel NIC to provide standard virtual networking suitable for basic connectivity needs.\n\n* rtl8139: Emulates a Realtek NIC for scenarios that require compatibility with older operating systems or virtual machines, but not for high-performance or latency-sensitive application scenarios.\n\n* virtio: A para-virtualized network driver with low CPU usage and high network throughput for high-performance network scenarios.\n\n* SR-IOV: Virtualizes the physical NICs and cuts them into VF NICs and assigns them directly to VMs. This can achieve I/O performance close to that of physical devices and reduce the host CPU consumption.\n\n* pcnet: Emulates an AMD PCnet NIC with excellent compatibility. Designed primarily for older guest operating systems such as Windows 2000/XP/NT 4.0 and legacy Linux distributions. Suitable for traditional system environments with low network demands.",
                  })}
                </ReactMarkdown>
              }
              options={nicTypeOptions}
              className={FIELD_WIDTH_200}
            />
            <ModalSelectField
              form={form}
              name={`l3NetworkUuids-${index}`}
              label={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.port.group",
                defaultMessage: "Port Group",
              })}
              title={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.select.port.group",
                defaultMessage: "Select Distributed Port Group",
              })}
              required
              requiredMessage={l3NetworkRequiredMessage}
              className={FIELD_WIDTH_200}
              onValueChange={() => {
                [
                  [`appointIpv4-${index}`, false],
                  [`appointIpv6-${index}`, false],
                  [`ipv4-${index}`, undefined],
                  [`ipv6-${index}`, undefined],
                  [`netmask-${index}`, undefined],
                  [`prefixLen-${index}`, undefined],
                  [`gateway4-${index}`, undefined],
                  [`gateway6-${index}`, undefined],
                ].forEach(([fieldName, value]) => {
                  form.setValue(fieldName as any, value as any);
                  form.clearErrors(fieldName as any);
                });
              }}
            >
              <L3NetworkList
                view="select.virtualization"
                defaultQuery={l3DefaultQuery}
                className={L3_NETWORK_LIST_CLASS}
              />
            </ModalSelectField>
            <InputField
              form={form}
              name={`nicMultiQueueNum-${index}` as any}
              label={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.nicMultiQueueNum",
                defaultMessage: "NIC Queue Number",
              })}
              className={FIELD_WIDTH_200}
            />
            {selectedPortGroup ? (
              <>
                <InputField
                  form={form}
                  name={`customMac-${index}` as any}
                  label={intl.formatMessage({
                    id: "virtualization.create.instance.hardware.network.card.mac",
                    defaultMessage: "MAC Address",
                  })}
                  labelTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "vm.template.create.field.mac.address.tooltip",
                        defaultMessage:
                          "vm.template.create.field.mac.address.tooltip",
                      })}
                    </ReactMarkdown>
                  }
                  className={FIELD_WIDTH_200}
                  disabled={isBatchClone}
                  placeholder={intl.formatMessage({
                    id: "auto.generate",
                    defaultMessage: "Auto Generated",
                  })}
                />
                {selectedPortGroup.enableIPAM ? (
                  <>
                    {hasIpv4Range ? (
                      <>
                        <InputField
                          form={form}
                          name={`ipv4-${index}` as any}
                          label={intl.formatMessage({
                            id: "ipv4.address",
                            defaultMessage: "IPv4 Address",
                          })}
                          labelTooltip={
                            <ReactMarkdown>
                              {intl.formatMessage({
                                id: "vm.create.field.staticipv4.tooltip",
                                defaultMessage:
                                  "### IP Address\n\nBy default, the system automatically assigns the IP address. You can also specify an IP address for your VM.\n\nNote: If VMs are created in bulk, the assigned IP address will default to be the start IP address, and the rest available IP addresses will be continuously assigned. When an IP address has been occupied or is insufficient within the range, the corresponding VM cannot be created.      ",
                              })}
                            </ReactMarkdown>
                          }
                          className={FIELD_WIDTH_200}
                          disabled={isBatchClone}
                          placeholder={
                            dhcpEnabled
                              ? intl.formatMessage({
                                  id: "auto.dispatch",
                                  defaultMessage: "Auto Allocated",
                                })
                              : undefined
                          }
                        />
                        {isWindows ? (
                          <NicDnsField
                            form={form}
                            index={index}
                            isWindows
                            ipVersion={4}
                            disabled={isBatchClone}
                          />
                        ) : null}
                      </>
                    ) : null}
                    {hasIpv6Range ? (
                      <>
                        <InputField
                          form={form}
                          name={`ipv6-${index}` as any}
                          label={intl.formatMessage({
                            id: "ipv6.address",
                            defaultMessage: "IPv6 Address",
                          })}
                          labelTooltip={
                            <ReactMarkdown>
                              {intl.formatMessage({
                                id: "vm.create.field.staticipv4.tooltip",
                                defaultMessage:
                                  "### IP Address\n\nBy default, the system automatically assigns the IP address. You can also specify an IP address for your VM.\n\nNote: If VMs are created in bulk, the assigned IP address will default to be the start IP address, and the rest available IP addresses will be continuously assigned. When an IP address has been occupied or is insufficient within the range, the corresponding VM cannot be created.      ",
                              })}
                            </ReactMarkdown>
                          }
                          className={FIELD_WIDTH_200}
                          disabled={isBatchClone}
                          placeholder={
                            dhcpEnabled
                              ? intl.formatMessage({
                                  id: "auto.dispatch",
                                  defaultMessage: "Auto Allocated",
                                })
                              : undefined
                          }
                        />
                        {isWindows ? (
                          <NicDnsField
                            form={form}
                            index={index}
                            isWindows
                            ipVersion={6}
                            disabled={isBatchClone}
                          />
                        ) : null}
                      </>
                    ) : null}
                    {isLinux && index === 0 ? (
                      <NicDnsField form={form} disabled={isBatchClone} />
                    ) : null}
                  </>
                ) : (
                  <>
                    <NicCheckboxField
                      form={form}
                      name={`appointIpv4-${index}`}
                      label={intl.formatMessage({
                        id: "ipv4.address",
                        defaultMessage: "IPv4 Address",
                      })}
                      checkboxLabel={intl.formatMessage({
                        id: "nic.create.instance.field.custom.ip",
                        defaultMessage: "Specify IPv4 by VMTools",
                      })}
                      labelTooltip={
                        <ReactMarkdown>
                          {intl.formatMessage({
                            id: "virtualization.create.instance.hardware.network.card.appointIp.iconTooltip",
                            defaultMessage:
                              "### Specify IP Address\n\n1. If the selected distributed port group has DHCP service disabled, you can use VMTools to specify an IP address for the virtual machine.\n2. If selected, you need to install VMTools on the virtual machine after the creation. The specified IP address will take effect automatically after the VMTools is installed.",
                          })}
                        </ReactMarkdown>
                      }
                      disabled={isBatchClone}
                    />
                    {appointIpv4 ? (
                      <div className={CHILD_CARD_CLASS}>
                        <InputField
                          form={form}
                          name={`ipv4-${index}` as any}
                          label={intl.formatMessage({
                            id: "ipv4.address",
                            defaultMessage: "IPv4 Address",
                          })}
                          labelTooltip={
                            <ReactMarkdown>
                              {intl.formatMessage({
                                id: "vm.create.field.staticipv4.tooltip",
                                defaultMessage:
                                  "### IP Address\n\nBy default, the system automatically assigns the IP address. You can also specify an IP address for your VM.\n\nNote: If VMs are created in bulk, the assigned IP address will default to be the start IP address, and the rest available IP addresses will be continuously assigned. When an IP address has been occupied or is insufficient within the range, the corresponding VM cannot be created.      ",
                              })}
                            </ReactMarkdown>
                          }
                          required
                          className={FIELD_WIDTH_200}
                          disabled={isBatchClone}
                        />
                        <InputField
                          form={form}
                          name={`netmask-${index}` as any}
                          label={intl.formatMessage({
                            id: "netmask",
                            defaultMessage: "Netmask",
                          })}
                          required
                          className={FIELD_WIDTH_200}
                          disabled={isBatchClone}
                        />
                        <InputField
                          form={form}
                          name={`gateway4-${index}` as any}
                          label={intl.formatMessage({
                            id: "ipv4.gateway",
                            defaultMessage: "IPv4 Gateway",
                          })}
                          className={FIELD_WIDTH_200}
                          disabled={isBatchClone}
                        />
                        {isWindows ? (
                          <NicDnsField
                            form={form}
                            index={index}
                            isWindows
                            ipVersion={4}
                            disabled={isBatchClone}
                          />
                        ) : null}
                      </div>
                    ) : null}
                    <NicCheckboxField
                      form={form}
                      name={`appointIpv6-${index}`}
                      label={intl.formatMessage({
                        id: "ipv6.address",
                        defaultMessage: "IPv6 Address",
                      })}
                      checkboxLabel={intl.formatMessage({
                        id: "nic.create.instance.field.custom.ipv6",
                        defaultMessage: "Specify IPv6 by VMTools",
                      })}
                      labelTooltip={
                        <ReactMarkdown>
                          {intl.formatMessage({
                            id: "virtualization.create.instance.hardware.network.card.appointIp.iconTooltip",
                            defaultMessage:
                              "### Specify IP Address\n\n1. If the selected distributed port group has DHCP service disabled, you can use VMTools to specify an IP address for the virtual machine.\n2. If selected, you need to install VMTools on the virtual machine after the creation. The specified IP address will take effect automatically after the VMTools is installed.",
                          })}
                        </ReactMarkdown>
                      }
                      disabled={isBatchClone}
                    />
                    {appointIpv6 ? (
                      <div className={CHILD_CARD_CLASS}>
                        <InputField
                          form={form}
                          name={`ipv6-${index}` as any}
                          label={intl.formatMessage({
                            id: "ipv6.address",
                            defaultMessage: "IPv6 Address",
                          })}
                          labelTooltip={
                            <ReactMarkdown>
                              {intl.formatMessage({
                                id: "vm.create.field.staticipv4.tooltip",
                                defaultMessage:
                                  "### IP Address\n\nBy default, the system automatically assigns the IP address. You can also specify an IP address for your VM.\n\nNote: If VMs are created in bulk, the assigned IP address will default to be the start IP address, and the rest available IP addresses will be continuously assigned. When an IP address has been occupied or is insufficient within the range, the corresponding VM cannot be created.      ",
                              })}
                            </ReactMarkdown>
                          }
                          required
                          className={FIELD_WIDTH_200}
                          disabled={isBatchClone}
                        />
                        <InputNumberField
                          form={form}
                          name={`prefixLen-${index}` as any}
                          label={intl.formatMessage({
                            id: "prefix.length",
                            defaultMessage: "Prefix Length",
                          })}
                          required
                          className={FIELD_WIDTH_80}
                          min={64}
                          max={126}
                          controls={false}
                          disabled={isBatchClone}
                        />
                        <InputField
                          form={form}
                          name={`gateway6-${index}` as any}
                          label={intl.formatMessage({
                            id: "ipv6.gateway",
                            defaultMessage: "IPv6 Gateway",
                          })}
                          className={FIELD_WIDTH_200}
                          disabled={isBatchClone}
                        />
                        {isWindows ? (
                          <NicDnsField
                            form={form}
                            index={index}
                            isWindows
                            ipVersion={6}
                            disabled={isBatchClone}
                          />
                        ) : null}
                      </div>
                    ) : null}
                    {isLinux && index === 0 ? (
                      <NicDnsField form={form} disabled={isBatchClone} />
                    ) : null}
                  </>
                )}
              </>
            ) : null}
            <ModalSelectField
              form={form}
              name={`securityGroup-${index}`}
              label={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.securityGroup",
                defaultMessage: "Security Group",
              })}
              labelTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "virtualization.create.instance.hardware.network.card.securityGroup.iconTooltip",
                    defaultMessage: "### Security Group\n\nThe security group rules are ordered by priority. A smaller number indicates a higher priority. Configure carefully to prevent rule conflicts between security groups.",
                  })}
                </ReactMarkdown>
              }
              title={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.select.securityGroup",
                defaultMessage: "Select Security Group",
              })}
              selectType="checkbox"
              className={FIELD_WIDTH_200}
              renderSelectedList={() => (
                <SortableList
                  className={SORTABLE_LIST_CLASS}
                  dataSource={selectedSgList.map((item: any, i: number) => ({
                    ...item,
                    key: item.uuid,
                    index: i + 1,
                    content: (
                      <div>
                        <Text>{item.name}</Text>
                      </div>
                    ),
                  }))}
                  onSortEnd={(dataSource: any[]) => {
                    form.setValue(`securityGroup-${index}` as any, dataSource);
                  }}
                  onTrash={(item: any) => {
                    form.setValue(
                      `securityGroup-${index}` as any,
                      selectedSgList.filter((sg: any) => sg.uuid !== item.uuid),
                    );
                  }}
                />
              )}
            >
              <SecurityGroupList view="select" />
            </ModalSelectField>
            <SwitchField
              form={form}
              name={`netCardQosEnabled-${index}` as any}
              label={intl.formatMessage({
                id: "nic.qos",
                defaultMessage: "NIC QoS",
              })}
            />
            <NicQosFields form={form} index={index} />
          </FieldStack>
        ),
      };
    }),
    ...((sourceVm as any)?.tpmList?.length
      ? [
          {
            key: "tpm",
            type: "tpm" as const,
            label: "vTPM",
            description:
              form.watch("tpmVersion" as any) ??
              (sourceVm as any)?.tpmList?.[0]?.version ??
              "2.0",
            hasError: false,
            children: (
              <FieldStack>
                <RadioGroupField
                  form={form}
                  name="tpmConfigMethod"
                  label={intl.formatMessage({
                    id: "tpm.config.method",
                    defaultMessage: "TPM Configuration",
                  })}
                  labelTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "vm.clone.field.tpmConfigMethod.tooltip",
                        defaultMessage: `### TPM Configuration

Select how TPM devices are handled during the clone operation:

- Retain: The cloned VM retains the TPM information from the source VM.
- Reset: The system creates a new TPM for the cloned VM using the default key provider.`,
                      })}
                    </ReactMarkdown>
                  }
                  options={[
                    {
                      value: "Retain",
                      label: intl.formatMessage({
                        id: "tpm.config.method.retain",
                        defaultMessage: "Retain",
                      }),
                    },
                    {
                      value: "Reset",
                      label: intl.formatMessage({
                        id: "tpm.config.method.reset",
                        defaultMessage: "Reset",
                      }),
                    },
                  ]}
                />
                <ReadonlyField
                  label={intl.formatMessage({
                    id: "tpm.field.version",
                    defaultMessage: "TPM Spec",
                  })}
                >
                  {form.watch("tpmVersion" as any) ??
                    (sourceVm as any)?.tpmList?.[0]?.version ??
                    "2.0"}
                </ReadonlyField>
              </FieldStack>
            ),
          },
        ]
      : []),
  ];
  const currentHardwareKey = activeHardwareKey || hardwareTabs[0]?.key || "";

  return (
    <ZSVHardwareTabs
      activeKey={currentHardwareKey}
      addAction={
        <ZSVHardwareTabsAddButton
          icon={<Icon className="flex" type="plus" />}
          onClick={addNic}
        >
          {intl.formatMessage({
            id: "virtualization.add.nic",
            defaultMessage: "Add NIC",
          })}
        </ZSVHardwareTabsAddButton>
      }
      configTitle={intl.formatMessage({
        id: "virtualization.hardware.config",
        defaultMessage: "Hardware Configurations",
      })}
      contentId="clone-vm-hardware-tab"
      forceMount
      hardwareTitle={intl.formatMessage({
        id: "virtualization.hardware.item",
        defaultMessage: "Hardware",
      })}
      items={hardwareTabs.map((item) => ({
        key: item.key,
        label: item.label,
        icon: (
          <Illustration type={getHardwareIcon(item.type) as any} size={20} />
        ),
        description: item.description,
        descriptionMuted: item.descriptionMuted,
        descriptionTitle:
          typeof item.description === "string" ? item.description : undefined,
        hasError: item.hasError,
        canDelete: item.canDelete,
        deleteIcon: <Icon size={16} type="trash" />,
        deleteLabel: intl.formatMessage({
          id: "delete",
          defaultMessage: "Delete",
        }),
        onDelete: item.onDelete,
        content: item.children,
      }))}
      onActiveKeyChange={setActiveHardwareKey}
    />
  );
};

export default React.memo(Hardware);
