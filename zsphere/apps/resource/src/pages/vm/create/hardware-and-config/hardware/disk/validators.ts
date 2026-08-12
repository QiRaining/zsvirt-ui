import {
  formatStorageToObj,
  isOfferingSize,
  isUint,
  parseNumber,
} from "@zstack/zsphere-utils";
import { isInteger as _isInteger } from "lodash-es";

export const validateDiskSize = (
  form: any,
  index: number,
  originValue: any,
  totalSize: number,
  intl: any,
) => {
  const image = form.getFieldValue(`diskImage-${index}`);
  const diskSize = form.getFieldValue(`diskSize-${index}`);
  const storePath = form.getFieldValue(`storePath-${index}`); //存储大小
  const diskCreateTypeRadioValue = form.getFieldValue(
    `diskCreateType-${index}`,
  );
  const size = parseNumber(diskSize?.number, diskSize?.unit);

  if (!diskSize?.number && diskSize?.number !== 0) {
    return Promise.reject(
      intl.formatMessage({
        id: "global.field.validator.input.required",
        defaultMessage: "This field is required.",
      }),
    );
  }

  //新建硬盘容量
  if (
    diskCreateTypeRadioValue === "new" &&
    storePath?.[0] &&
    size > totalSize
  ) {
    return Promise.reject(
      intl.formatMessage({
        id: "virtualization.disk.field.diskSize.validator.valueRange",
        defaultMessage: "Exceeding designated capacity can utilize the storage limit.",
      }),
    );
  }

  //镜像容量
  if (diskCreateTypeRadioValue === "image") {
    const rawImageSize = image?.[0]?.size ?? originValue?.size;

    if (rawImageSize) {
      const formatted = formatStorageToObj(rawImageSize, 2);
      const alignedImageSize = parseNumber(
        Number(formatted.number),
        formatted.unit as string,
      );

      if (alignedImageSize <= size) {
        if (storePath?.[0] && size > totalSize) {
          return Promise.reject(
            intl.formatMessage({
              id: "virtualization.disk.field.dataDiskCapacity.validator.valueRange",
              defaultMessage: "Invalid capacity, capacity value must be less than data storage capacity.",
            }),
          );
        }
        return Promise.resolve();
      }

      return Promise.reject(
        intl.formatMessage({
          id: "virtualization.disk.field.imageDiskCapacity.validator.valueRange",
          defaultMessage: "Invalid capacity, capacity value must be greater than hard disk image capacity.",
        }),
      );
    }
  }

  if (originValue && size) {
    const originFormatted = formatStorageToObj(originValue.size, 2);
    const alignedOriginSize = parseNumber(
      Number(originFormatted.number),
      originFormatted.unit as string,
    );

    if (size < alignedOriginSize) {
      return Promise.reject(
        intl.formatMessage({
          id: "volume.field.resize.validator.greaterThan.current.capacity",
          defaultMessage: "The new size must be greater than the current size.",
        }),
      );
    }
  }

  if (
    isUint(diskSize?.number) &&
    isOfferingSize(`${diskSize?.number}${diskSize?.unit.substr(0, 1)}`)
  ) {
    return Promise.resolve();
  }

  return Promise.resolve();
};

export const validateImageStatus = (
  form: any,
  index: number,
  isRootDisk: boolean,
  intl: any,
) => {
  const getImageValue = form.getFieldValue([`diskImage-${index}`])?.length;
  if (form.isFieldTouched(`diskImage-${index}`) && !getImageValue) {
    return Promise.reject(
      isRootDisk
        ? intl.formatMessage({
            id: "instance.field.disk.systemImage.validator.required",
            defaultMessage: "Choose a system image.",
          })
        : intl.formatMessage({
            id: "instance.field.disk.image.validator.required",
            defaultMessage: "Select a disk image.",
          }),
    );
  }

  return Promise.resolve();
};

export const isIntegerWithUnit = async (
  _rule: any,
  value: { number?: string | number; unit?: string },
  intl: any,
) => {
  if (
    value?.number === undefined ||
    value?.number === null ||
    value?.number === ""
  ) {
    return;
  }

  if (!_isInteger(value.number)) {
    throw intl.formatMessage({
      id: "volume.field.qos.validator.format",
      defaultMessage: "Enter an integer.",
    });
  }

  return;
};

export const isInteger = async (_rule: any, value: any, intl: any) => {
  if (!value) {
    return;
  }

  if (!_isInteger(+value)) {
    throw intl.formatMessage({
      id: "volume.field.qos.validator.format",
      defaultMessage: "Enter an integer.",
    });
  }

  return;
};
