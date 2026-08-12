"use client";

/**
 * ResizableLayout 已抽离至 @zstack/design 作为通用组件。
 * 此文件保留为兼容 re-export，确保 ZSV 现有 import 路径不变。
 */
export { ResizableLayout, ResizableLayout as default } from "@zstack/design";
export type {
  ResizableLayoutProps,
  NumberSize,
  ResizeDelta,
  LegacyResizeCallback,
  LegacyResizeStopCallback,
  SimpleResizeCallback,
  SimpleResizeStopCallback,
} from "@zstack/design";
