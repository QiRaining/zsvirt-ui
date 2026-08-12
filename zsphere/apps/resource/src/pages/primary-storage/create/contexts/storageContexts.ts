import { createContext } from "react";

import type {
  IPrimaryStorageTypeContext,
  ISharedResourceDataContext,
  IPrimaryStorageResourceContext,
} from "../type";
// 类型相关的 Context
export const PrimaryStorageTypeContext =
  createContext<IPrimaryStorageTypeContext | null>(null);

// 共享数据 Context
export const SharedResourceDataContext =
  createContext<ISharedResourceDataContext | null>(null);

// 资源操作相关的 Context
export const PrimaryStorageResourceContext =
  createContext<IPrimaryStorageResourceContext | null>(null);
