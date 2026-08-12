import type { IscsiServer as IIscsiServer } from "@zstack/zsphere-types/graphql";

// 单选
export const verifySingleSelect = (selectedList: IIscsiServer[]): boolean => {
  return selectedList.length === 1;
};

// 没有选中
export const verifyNotSelect = (selectedList: IIscsiServer[]): boolean => {
  return selectedList?.length <= 0;
};

// 启用
export const verifyEnable = (current: IIscsiServer): boolean => {
  return current.state === "Disabled";
};

// 停用
export const verifyDisable = (current: IIscsiServer): boolean => {
  return current.state === "Enabled";
};

// 卸载集群
export const verifyDetachCluster = (current: IIscsiServer): boolean => {
  return !!current?.iscsiClusterRefs && current?.iscsiClusterRefs?.length > 0;
};

// 多选
export const verifyMultiSelect = (selectedList: IIscsiServer[]): boolean => {
  return selectedList?.length > 0;
};

// 刷新
export const verifyRefreshIscsiServer = (
  selectedList: IIscsiServer[],
): boolean => {
  return selectedList?.length > 0;
};

// 删除
export const verifyDelete = (selectedList: IIscsiServer[]): boolean => {
  return selectedList?.length > 0;
};
