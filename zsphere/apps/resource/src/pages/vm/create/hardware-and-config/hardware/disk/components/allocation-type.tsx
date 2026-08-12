import { Form, Select } from "@zstack/zsphere-components";
import { PrimaryStorageType } from "@zstack/zsphere-types";
import React, { useMemo, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface AllocationTypeProps {
  form: any;
  intl: any; // 国际化对象
  index: number;
  sourceType?: string;
  originValue?: any;
  shareableVolume?: { tooltip?: string; disabled?: boolean };
  allocatTypeOptions?: { value: string; text: string }[];
}
const { Item } = Form;

const STYLE_WIDTH_200 = { width: 200 } as const;

const AllocationType: React.FC<AllocationTypeProps> = ({
  form,
  intl,
  index,
  sourceType,
  originValue,
  shareableVolume,
  allocatTypeOptions,
}) => {
  const indexStorePath = form.getFieldValue(`storePath-${index}`);
  const indexStorePathType = indexStorePath?.[0]?.type;
  const isSharedBlock = indexStorePathType === PrimaryStorageType.SharedBlock;

  const allocationType = form.getFieldValue(`allocationType-${index}`);
  //
  // 手动指定存储时，增加置备方式 的字段展示
  // 仅有精简置备时，为固定字段展示
  // 本地存储：精简置备
  // NFS：精简置备
  // SAN 存储：厚置备、精简置备
  //
  // 实际上，就SAN有选项，其他的存储都是文字

  // 使用 ref 跟踪上一次的存储路径 uuid，避免因对象引用变化导致的无限循环
  const lastStorePathUuidRef = useRef<string | undefined>();
  const storePathUuid = indexStorePath?.[0]?.uuid;
  const thinProvision = indexStorePath?.[0]?.systemTag?.thinProvision;

  useEffect(() => {
    // 只有当存储路径的 uuid 真正变化时才更新
    if (!originValue && storePathUuid !== lastStorePathUuidRef.current) {
      lastStorePathUuidRef.current = storePathUuid;
      if (storePathUuid && isSharedBlock) {
        form.setFieldsValue({
          [`allocationType-${index}`]: thinProvision
            ? "ThinProvisioning"
            : "ThickProvisioning",
        });
      }
    }
  }, [index, storePathUuid, isSharedBlock, thinProvision, originValue, form]);

  const renderAllocationTypeForVmInstance = () => {
    //Vhost 和 Ceph 没有制备方式 具体见：
    if (
      [PrimaryStorageType.Addon, PrimaryStorageType.Ceph].includes(
        originValue?.primaryStorage?.type,
      )
    ) {
      return null;
    }

    return (
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.hardware.disk.allocation.type",
          defaultMessage: "Provision Method",
        })}
        name={`allocationType-${index}`}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.create.instance.hardware.disk.allocation.type.tooltip",
              defaultMessage: `### Provision Method

Specifies how to allocate storage space on the disk. Supports thin provision and thick provision methods.

1. Thin Provision: Allocates storage space according to actual usage to achieve higher storage utilization.

2. Thick Provision: Pre-allocates required storage space when creating the disk, which can provide sufficient storage capacity and ensure storage performance.`,
            })}
          </ReactMarkdown>
        }
        tooltip={originValue && shareableVolume?.tooltip}
      >
        {allocationType === "ThinProvisioning"
          ? intl.formatMessage({
              id: "thinProvision",
              defaultMessage: "Thin Provision",
            })
          : intl.formatMessage({
              id: "thickProvision",
              defaultMessage: "Thick Provision",
            })}
      </Item>
    );
  };

  const renderAllocationTypeForStorePath = () => {
    //Vhost 和 Ceph 没有制备方式 具体见：
    if (
      [PrimaryStorageType.Addon, PrimaryStorageType.Ceph].includes(
        indexStorePathType,
      )
    ) {
      return null;
    }

    return (
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.hardware.disk.allocation.type",
          defaultMessage: "Provision Method",
        })}
        name={`allocationType-${index}`}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.create.instance.hardware.disk.allocation.type.tooltip",
              defaultMessage: `### Provision Method

Specifies how to allocate storage space on the disk. Supports thin provision and thick provision methods.

1. Thin Provision: Allocates storage space according to actual usage to achieve higher storage utilization.

2. Thick Provision: Pre-allocates required storage space when creating the disk, which can provide sufficient storage capacity and ensure storage performance.`,
            })}
          </ReactMarkdown>
        }
        tooltip={originValue && shareableVolume?.tooltip}
      >
        {isSharedBlock ? (
          <Select
            disabled={originValue && shareableVolume?.disabled}
            style={STYLE_WIDTH_200}
          >
            {allocatTypeOptions?.map(({ value, text }) => (
              <Select.Option value={value} key={value}>
                {text}
              </Select.Option>
            ))}
          </Select>
        ) : (
          intl.formatMessage({
            id: "thinProvision",
            defaultMessage: "Thin Provision",
          })
        )}
      </Item>
    );
  };

  const renderAllocationType = () => {
    if (sourceType === "VmInstance" && originValue && allocationType) {
      return renderAllocationTypeForVmInstance();
    }

    if (indexStorePathType) {
      return renderAllocationTypeForStorePath();
    }

    return null;
  };

  const renderedAllocationType = useMemo(
    () => renderAllocationType(),
    [indexStorePathType, allocationType, originValue, shareableVolume],
  );

  return <>{renderedAllocationType}</>;
};

export default AllocationType;
