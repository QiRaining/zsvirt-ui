import { ImagePlatform as Platform } from "@zstack/zsphere-types";

// Windows NT 4.0 需要使用 pcnet 网卡型号和 pentium CPU 模式
export const WINDOWS_NT_OS = "Windows NT 4.0";

/** 根据平台和具体 OS 版本获取默认网卡型号 */
export const getNicTypeByOs = (
  platform: string,
  osRelease?: string,
): string => {
  if (platform === Platform.Linux) {
    return "virtio";
  }
  if (osRelease === WINDOWS_NT_OS) {
    return "pcnet";
  }
  return "e1000";
};

/** 批量更新表单中所有网卡的 nicType */
export const updateAllNicTypes = (form: any, nicType: string) => {
  const allValues = form.getFieldsValue();
  const updates: Record<string, string> = {};
  for (const key of Object.keys(allValues)) {
    if (key.startsWith("nicType-")) {
      updates[key] = nicType;
    }
  }
  if (Object.keys(updates).length > 0) {
    form.setFieldsValue(updates);
  }
};
