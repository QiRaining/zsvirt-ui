# Store

状态管理目录，使用 Zustand 进行状态管理。

## 规范

- Store 文件使用 kebab-case 命名
- 使用 Zustand 创建 store
- 导出时使用命名导出

## 示例

```typescript
// use-app-store.ts
import { create } from "zustand";

interface AppStore {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```
