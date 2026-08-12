import type { IInputUnitProps } from "@zstack/zsphere-components";
import { isIn, parseNumber } from "@zstack/zsphere-utils";
import { isNull, isUndefined, isInteger as _isInteger } from "lodash-es";

export enum SetDiskQosType {
  SetBandwidthTotal = "SetBandwidthTotal",
  SetBandwidthWR = "SetBandwidthWR",
  SetIopsTotal = "SetIopsTotal",
  SetIopsWR = "SetIopsWR",
}

export const bandWidthUnitList: Required<IInputUnitProps>["unitList"] = [
  "MB/s",
  "GB/s",
];

export const diskSizeUnitList: Required<IInputUnitProps>["unitList"] = [
  "MB",
  "GB",
  "TB",
];

export const createValidBand = (form: any, index: number, intl: any) => () => {
  return {
    validateTrigger: "onChange",
    validator(...[, { number: v, unit }]: any[]) {
      const mode = form.getFieldValue([
        `bandwidthMode-${index}`,
      ]) as SetDiskQosType;

      const _bandwidthMode = mode === SetDiskQosType.SetBandwidthTotal;

      const range = {
        maxValue: 1024 * 1024 * 1024 * 100,
        minValue: 1024 * 1024,
      };

      const _v = parseNumber(Number(v), unit);

      // Number(null) = 0 所以需要 _.isNull(v)
      if (
        !isNull(v) &&
        !Number.isNaN(_v) &&
        !isIn(_v, range.minValue, range.maxValue)
      ) {
        return Promise.reject(
          intl.formatMessage({
            id: "volume.field.readingAndWritingSpeed.validator.format",
            defaultMessage: "The speed must be an integer between 1 MB/s and 100 GB/s.",
          }),
        );
      }

      // 读写一起校验
      if (!_bandwidthMode) {
        const r = form.getFieldValue([`readBandwidth-${index}`]);
        const w = form.getFieldValue([`writeBandwidth-${index}`]);
        const _readBandwidth = parseNumber(Number(r.number), r.unit);
        const validR = isIn(_readBandwidth, range.minValue, range.maxValue);
        const _writeBandwidth = parseNumber(Number(w.number), w.unit);
        const validW = isIn(_writeBandwidth, range.minValue, range.maxValue);

        if (
          (_readBandwidth === 0 && validW) ||
          (_writeBandwidth === 0 && validR)
        ) {
          return Promise.resolve();
        }
      }

      return Promise.resolve();
    },
  };
};

export const createValidIops = (form: any, _index: number, intl: any) => () => {
  return {
    validateTrigger: "onChange",
    validator(...[, value]: any[]) {
      const mode = form.getFieldValue(["iopsMode"]) as SetDiskQosType;

      const _iopsMode = mode === SetDiskQosType.SetIopsTotal;

      if (!_iopsMode) {
        const r = form.getFieldValue(["iopsRead"]);
        const w = form.getFieldValue(["iopsWrite"]);
        const _iopsRead = Number(r);
        const validR = _iopsRead > 0;
        const _iopsWrite = Number(w);
        const validW = _iopsWrite > 0;

        if ((_iopsRead === 0 && validW) || (_iopsWrite === 0 && validR)) {
          return Promise.resolve();
        }
      }

      // Number.isNaN(null) = false Number.isNaN(undefined) = false 所以需要 _.isNull(value)
      if (
        value !== "" &&
        !isNull(value) &&
        !isUndefined(value) &&
        !Number.isNaN(value) &&
        value < 16
      ) {
        return Promise.reject(
          intl.formatMessage({
            id: "volume.field.readingAndWritingIops.validator.format",
            defaultMessage: "The value must be equal to or greater than 16.",
          }),
        );
      }

      return Promise.resolve();
    },
  };
};

export const createValidateEmpty =
  (_form: any, _index: number, _intl: any) => () => {
    return {
      required: true,
      validateTrigger: "onChange",
      validator() {
        return Promise.resolve();
      },
    };
  };

export const createValidateImageStatus =
  (form: any, index: number, intl: any) => () => {
    const isRootDisk = index === 0;
    return {
      required: true,
      validateTrigger: "onChange",
      validator() {
        const getImageValue = form.getFieldValue([
          `diskImage-${index}`,
        ])?.length;
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
      },
    };
  };

export const createIsIntegerWithUnit =
  (_form: any, _index: number, intl: any) =>
  async (_rule: any, value: { number?: string | number; unit?: string }) => {
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

export const createIsInteger =
  (_form: any, _index: number, intl: any) => async (_rule: any, value: any) => {
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
