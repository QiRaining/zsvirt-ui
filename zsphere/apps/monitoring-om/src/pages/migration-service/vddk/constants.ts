export const VDDK_DOWNLOAD_URL =
  "https://developer.broadcom.com/sdks/vmware-virtual-disk-development-kit-vddk/8.0";

export const VDDK_8_0_3_LINUX_MD5 = "007ab979e52f52401f02278b75ab5c74";

export const isValidVddkPackageMd5 = (md5: string): boolean =>
  md5.toLowerCase() === VDDK_8_0_3_LINUX_MD5;

const VDDK_FILE_NAME_PATTERN = /^[A-Za-z0-9._-]+$/;

export const isValidVddkFileName = (fileName: string): boolean =>
  Boolean(fileName) && VDDK_FILE_NAME_PATTERN.test(fileName);
