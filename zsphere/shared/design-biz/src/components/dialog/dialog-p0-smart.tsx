"use client";

import React from "react";

import { DialogP0 } from "./dialog-p0";
import { DialogP3 } from "./dialog-p3";
import { DialogDeletionFormGuide } from "./hooks/types";

export interface DialogDestructiveProps {
  onConfirm: (arg0: any) => void;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  title: string;
  resourceNames: string[];
  resourceDescription?: React.ReactNode;
  resourceType?: string;
  bannerMessage: string | React.ReactNode;
  relatedResources?: { name: string; count: number }[];
  cancelText?: string;
  confirmText?: string;
  guide?: DialogDeletionFormGuide;
  /** 是否需要输入确认文本删除（来自 useSensitiveJudge，全局配置 delete.resource.double.check） */
  needValidate?: boolean;
  zIndex?: number;
  dialogPortalProps?: any;
}

export const DialogDestructive: React.FC<DialogDestructiveProps> = (props) => {
  const {
    needValidate,
    onConfirm,
    title,
    resourceNames,
    resourceDescription,
    resourceType,
    visible,
    setVisible,
    bannerMessage,
    relatedResources,
    cancelText,
    confirmText,
    guide,
    zIndex,
    dialogPortalProps,
  } = props;

  // needValidate=true 或 guide 有值 → 输入确认文本（DialogP0，对齐老组件 Modal.Action 的 confirmType="input" 行为）
  // needValidate=false + 无 guide → 简单确认（DialogP3）
  if (needValidate || guide) {
    return (
      <DialogP0
        onConfirm={onConfirm}
        visible={visible}
        setVisible={setVisible}
        title={title}
        resourceNames={resourceNames}
        resourceDescription={resourceDescription}
        resourceType={resourceType}
        bannerMessage={bannerMessage}
        relatedResources={relatedResources}
        cancelText={cancelText}
        confirmText={confirmText}
        guide={typeof guide === "object" ? guide : undefined}
        zIndex={zIndex}
        dialogPortalProps={dialogPortalProps}
      />
    );
  }

  return (
    <DialogP3
      title={title}
      visible={visible}
      setVisible={setVisible}
      resourceNames={resourceNames}
      bannerMessage={bannerMessage}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={onConfirm}
    />
  );
};
