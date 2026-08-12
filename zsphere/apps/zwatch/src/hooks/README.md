# Hooks

自定义 Hooks 目录，存放应用内的可复用 Hooks。

## 规范

- Hook 文件使用 kebab-case 命名，以 `use` 开头
- Hook 应该有清晰的类型定义
- 导出时使用命名导出

## 示例

```typescript
// use-custom-hook.ts
import { useState, useEffect } from "react";

interface UseCustomHookOptions {
  // ...
}

export const useCustomHook = (options: UseCustomHookOptions) => {
  const [state, setState] = useState();

  useEffect(() => {
    // ...
  }, []);

  return {
    state,
    setState,
  };
};
```
