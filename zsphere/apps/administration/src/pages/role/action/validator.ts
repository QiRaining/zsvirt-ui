import { ZsvRoleQueryType } from "@zstack/zsphere-types";
import type { ZsvRole } from "@zstack/zsphere-types/graphql";

import { isSodOrResourceViewerRole } from "../utils";

// 没有选中
export const verifyNotSelect = (selectedList: ZsvRole[]): boolean => {
  return selectedList?.length <= 0 || !selectedList;
};

// 单选
export const verifySingleSelect = (selectedList: ZsvRole[]): boolean => {
  return selectedList.length === 1;
};

export const verifyMultiSelect = (selectedList: ZsvRole[]): boolean => {
  return selectedList.length >= 1;
};

export const verifyDelete = (
  current: ZsvRole,
  source: ZsvRole,
  selectedList?: ZsvRole[],
): boolean => {
  if (!selectedList) {
    return !(current?.userCount || current?.userGroupCount);
  }

  const allCustomizedWithUsers = selectedList.every(
    (it) =>
      it.type === ZsvRoleQueryType.Customized &&
      (it?.userCount || it?.userGroupCount),
  );

  if (allCustomizedWithUsers) {
    return true;
  }

  const hasPredefined = selectedList.some(
    (it) => it.type === ZsvRoleQueryType.Predefined,
  );
  const hasCustomizedWithUsers = selectedList.some(
    (it) =>
      it.type === ZsvRoleQueryType.Customized &&
      (it?.userCount || it?.userGroupCount),
  );
  const hasCustomizedWithoutUsers = selectedList.some(
    (it) =>
      it.type === ZsvRoleQueryType.Customized &&
      !(it?.userCount || it?.userGroupCount),
  );

  if (hasPredefined && hasCustomizedWithUsers && hasCustomizedWithoutUsers) {
    const isPredefinedOrCustomizedWithUsers =
      current?.type === ZsvRoleQueryType.Predefined ||
      (current?.type === ZsvRoleQueryType.Customized &&
        (current?.userCount || current?.userGroupCount));
    if (isPredefinedOrCustomizedWithUsers) {
      return false;
    }
  }

  if (selectedList.every((it) => it.type === ZsvRoleQueryType.Customized)) {
    return !(current?.userCount || current?.userGroupCount);
  }

  if (hasPredefined && hasCustomizedWithUsers) {
    return current?.type !== ZsvRoleQueryType.Predefined;
  }

  if (selectedList?.every((it) => it.type === ZsvRoleQueryType.Predefined)) {
    return false;
  }

  return (
    !(current?.userCount || current?.userGroupCount) &&
    current?.type !== ZsvRoleQueryType.Predefined
  );
};

export const verifyPredefined = (current: ZsvRole): boolean => {
  return current?.type !== ZsvRoleQueryType.Predefined;
};

export const verifyClone = (current: ZsvRole): boolean => {
  return !isSodOrResourceViewerRole(current?.uuid);
};
