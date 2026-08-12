import { useMutation } from "@apollo/client";
import { checkHostnameRepeat } from "@zstack/virtualization-resource/src/gql/backup-storage.gql";
import type { ValueProps } from "@zstack/zsphere-components";
import { useValidator as useGlobalValidator } from "@zstack/zsphere-hooks";
import type {
  CheckHostnameRepeatParam as ICheckHostnameRepeatParam,
  CheckHostnameRepeatResult as ICheckHostnameRepeatResult,
} from "@zstack/zsphere-types/graphql";
import { isIPV4, reject } from "@zstack/zsphere-utils";
import { usePersistFn } from "ahooks";
import { inRange, isInteger } from "lodash-es";
import { useIntl } from "react-intl";

export const useValidator = () => {
  const intl = useIntl();
  const { isRequired } = useGlobalValidator(intl);

  // 定义常量，避免魔法数字，提高可读性和可维护性
  const ONE_B = 1;
  const ONE_KB = 1024;
  const ONE_MB = 1024 * 1024;
  const ONE_GB = 1024 * 1024 * 1024;
  const ONE_TB = 1024 * 1024 * 1024 * 1024;

  const validReservedCapacity = async (
    _rule: any,
    value: ValueProps,
    validMaxSettingCapacity: {
      isValid: boolean;
      maxSettingCapacity?: number;
    },
  ) => {
    // 输入内容应该为整数数字，设置数值在[1B, 1TB]之间
    let _number = Number(value?.number) || 0;

    if (value?.number === undefined || value?.number === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    const _unit = value?.unit;
    switch (_unit) {
      case "B":
        break;
      case "K":
      case "KB":
        _number *= ONE_KB;
        break;
      case "M":
      case "MB":
        _number *= ONE_MB;
        break;
      case "G":
      case "GB":
        _number *= ONE_GB;
        break;
      case "T":
      case "TB":
        _number *= ONE_TB;
        break;
      default:
        break;
    }

    const isIntegerValue = isInteger(_number);
    const isInRange = _number >= ONE_B && _number <= ONE_TB;

    if (validMaxSettingCapacity.isValid) {
      const isUnderMax = _number <= validMaxSettingCapacity.maxSettingCapacity;

      if (isIntegerValue && isInRange && isUnderMax) {
        return;
      }

      throw intl.formatMessage({
        id: "reserved.capacity.validate.range.and.max.setting.capacity",
        defaultMessage:
          "Enter an integer that ranges from 1B to 1TB and does not exceed the total size of image storage.",
      });
    }

    if (isIntegerValue && isInRange) {
      return;
    }

    throw intl.formatMessage({
      id: "reserved.capacity.validate.range",
      defaultMessage: "Enter an integer. The size shall range from 1 B to 1 TB.",
    });
  };

  const validBlobDownloadUploadConcurrency = (_rule: any, value: any) => {
    let _value = value;
    try {
      _value = Number(value);
    } catch {
      // console.error('Number translate error:', e)
    }
    if (isInteger(_value) && inRange(_value, 1, 17)) {
      return Promise.resolve();
    }

    return Promise.reject(
      intl.formatMessage({
        id: "backupStorage.blobDownloadUploadConcurrency.validate.range",
        defaultMessage: "Input should be an integer number within the range of [1, 16].",
      }),
    );
  };

  // 检测 ImageStoreBackupStorage hostname 是否被占用
  const [remoteValidateHostname] = useMutation<
    { checkHostnameRepeat: ICheckHostnameRepeatResult },
    {
      input: ICheckHostnameRepeatParam;
    }
  >(checkHostnameRepeat);
  const validatorBSHostname = usePersistFn(
    async (zoneUuid: string, hostname?: string) => {
      if (!hostname) {
        return reject(
          intl.formatMessage({
            id: "global.field.validator.input.required",
            defaultMessage: "This field is required.",
          }),
        );
      }

      if (!isIPV4(hostname)) {
        return reject(
          intl.formatMessage({
            id: "backupStorage.field.hostname.validator.format",
            defaultMessage: "Invalid mirror storage IP.",
          }),
        );
      }
      const res = await remoteValidateHostname({
        variables: { input: { zoneUuid, hostname } },
      });
      if (res?.data?.checkHostnameRepeat?.repeat) {
        return reject(
          intl.formatMessage({
            id: "backupStorage.field.hostname.validator.repeat",
            defaultMessage: "Image storage IP address has been occupied.",
          }),
        );
      }

      return;
    },
  );

  return {
    isRequired,
    validBlobDownloadUploadConcurrency,
    validReservedCapacity,
    validatorBSHostname,
  };
};
