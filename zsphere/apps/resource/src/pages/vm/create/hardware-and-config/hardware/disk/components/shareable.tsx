import { Checkbox } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import React, { useRef, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const FormCheckbox = React.forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }
>(({ checked, onChange, label, ...rest }, ref) => {
  const id = React.useId();
  return (
    <div className="flex items-center">
      <Checkbox
        ref={ref}
        id={id}
        checked={checked}
        onCheckedChange={(val) => onChange?.(val === true)}
        {...rest}
      />
      {label && (
        <label
          htmlFor={id}
          className="cursor-pointer pl-2 text-sm !text-neutral-700"
        >
          {label}
        </label>
      )}
    </div>
  );
});

interface IProps {
  form: any;
  index: number;
  storageType?: string;
  originValue?: any;
  isRootDisk: boolean; //判断是否是根盘
  isEdit: boolean; //判断是否是编辑
}

const { Item } = Form;

const ShareableContent: React.FC<
  IProps & { isShareable: boolean; qosOn: boolean }
> = ({ form, index, isRootDisk, originValue, isEdit, isShareable, qosOn }) => {
  const intl = useIntl();
  const hasSetRef = useRef<boolean>(false);

  // 使用 useEffect 处理副作用，只在 isShareable 从 true 变为 false 时执行一次
  useEffect(() => {
    if (!isShareable && !originValue && !hasSetRef.current) {
      hasSetRef.current = true;
      form.setFieldsValue({ [`diskSharable-${index}`]: false });
    }
    // 当 isShareable 变为 true 时，重置标记
    if (isShareable) {
      hasSetRef.current = false;
    }
  }, [isShareable, originValue, form, index]);

  if (isEdit && originValue?.uuid && !isRootDisk) {
    return (
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.hardware.shareable.disk",
          defaultMessage: "Shared Disk",
        })}
        icon="info"
        iconTooltip={{
          title: (
            <>
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "virtualization.create.instance.hardware.shareable.disk.tooltip",
                  defaultMessage:
                    "### Shared Disk\n\nA shared disk is essentially the disk that can be attached to multiple VMs for use, which is similar to a physical disk in that the disk can be attached to multiple physical servers, and each server can read data from and write data into the disk.\n\n- You can share a disk when the storage location is ZCE or ZBS distributed storage and the bus type is Virtio SCSI.\n- You can share a disk when the storage location is SAN storage, the bus type is Virtio SCSI, and the provision method is thick provision.\n- You cannot share a disk if the storage location is other storage types.\n",
                })}
              </ReactMarkdown>
            </>
          ),
        }}
        name={`diskSharable-${index}`}
      >
        {form.getFieldValue(`diskSharable-${index}`) ? (
          <span>{intl.formatMessage({ id: "yes", defaultMessage: "Yes" })}</span>
        ) : (
          <span>{intl.formatMessage({ id: "no", defaultMessage: "No" })}</span>
        )}
      </Item>
    );
  }

  return (
    !isRootDisk && (
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.hardware.shareable.disk",
          defaultMessage: "Shared Disk",
        })}
        icon="info"
        iconTooltip={{
          title: (
            <>
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "virtualization.create.instance.hardware.shareable.disk.tooltip",
                  defaultMessage:
                    "### Shared Disk\n\nA shared disk is essentially the disk that can be attached to multiple VMs for use, which is similar to a physical disk in that the disk can be attached to multiple physical servers, and each server can read data from and write data into the disk.\n\n- You can share a disk when the storage location is ZCE or ZBS distributed storage and the bus type is Virtio SCSI.\n- You can share a disk when the storage location is SAN storage, the bus type is Virtio SCSI, and the provision method is thick provision.\n- You cannot share a disk if the storage location is other storage types.\n",
                })}
              </ReactMarkdown>
            </>
          ),
        }}
        name={`diskSharable-${index}`}
        valuePropName="checked"
        tooltip={(() => {
          if (qosOn) {
            return intl.formatMessage({
              id: "qosOn.tip",
              defaultMessage: "You cannot share this disk with other VMs, because the disk has already been set QoS.",
            });
          }

          if (!isShareable) {
            return (
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "vm.disk.sharable.tooltip2",
                  defaultMessage: `To share a disk:

- Make sure the storage location is ZCE or ZBS distributed storage and the bus type is Virtio SCSI,
- Make sure the storage location is SAN storage, the bus type is Virtio SCSI, and the provision method is thick provision.`,
                })}
              </ReactMarkdown>
            );
          }
        })()}
      >
        <FormCheckbox
          disabled={!!originValue?.uuid || qosOn || !isShareable}
          label={intl.formatMessage({
            id: "virtualization.create.instance.hardware.disk.share.to.others",
            defaultMessage: "Share with other VMs",
          })}
        />
      </Item>
    )
  );
};

const Shareable: React.FC<IProps> = ({
  form,
  index,
  isRootDisk,
  originValue,
  storageType,
  isEdit,
}) => {
  return (
    <Item
      noStyle
      shouldUpdate={(prev, curr) =>
        prev[`turnOnQoS-${index}`] !== curr[`turnOnQoS-${index}`] ||
        prev[`busType-${index}`] !== curr[`busType-${index}`] ||
        prev[`allocationType-${index}`] !== curr[`allocationType-${index}`]
      }
    >
      {() => {
        const allocationType = form.getFieldValue(`allocationType-${index}`);
        const qosOn = form.getFieldValue(`turnOnQoS-${index}`);
        const busType = form.getFieldValue(`busType-${index}`);

        const canShareOnSAN =
          storageType === "SharedBlock" &&
          busType === "virtio-scsi" &&
          allocationType === "ThickProvisioning";

        const canShareOnCeph =
          storageType === "Ceph" && busType === "virtio-scsi";
        const canZbShareOnAddon =
          storageType === "Addon" && busType === "virtio-scsi";

        // 共享硬盘的条件见：
        const isShareable =
          canShareOnSAN || canShareOnCeph || canZbShareOnAddon;

        return (
          <ShareableContent
            form={form}
            index={index}
            isRootDisk={isRootDisk}
            originValue={originValue}
            storageType={storageType}
            isEdit={isEdit}
            isShareable={isShareable}
            qosOn={qosOn}
          />
        );
      }}
    </Item>
  );
};

export default React.memo(Shareable);
