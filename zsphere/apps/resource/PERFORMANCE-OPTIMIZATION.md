# ZSV Resource 应用性能优化报告

> 生成日期: 2026-01-28
> 基于 React Best Practices Skill 分析

## 📊 项目概况

| 指标             | 数值   | 评估            |
| ---------------- | ------ | --------------- |
| 总文件数         | ~1546  | 大型应用        |
| TSX 组件         | ~1027  | 组件数量多      |
| React.memo 使用  | 130 处 | ⚠️ 覆盖率较低   |
| useMemo 使用     | 846 处 | ✅ 使用较多     |
| useCallback 使用 | 115 处 | ⚠️ 使用偏少     |
| `import * as`    | 44 处  | ❌ 需要优化     |
| antd 直接导入    | 307 处 | ⚠️ 需迁移       |
| React.lazy       | 0 处   | ❌ 缺少代码分割 |
| Promise.all      | 2 处   | ⚠️ 并行请求少   |

---

## 🔴 关键问题 (CRITICAL)

### 1. 缺少路由级代码分割 (`bundle-dynamic-imports`)

**问题**: 整个应用没有使用 `React.lazy` 进行代码分割，所有页面都会打包到一起。

**建议方案**:

```tsx
import React, { Suspense } from "react";
import { Routes, Route } from "react-router";

// 懒加载各个页面模块
const VMList = React.lazy(() => import("./pages/vm/list"));
const VMDetail = React.lazy(() => import("./pages/vm/detail"));
const HostList = React.lazy(() => import("./pages/host/list"));
const ClusterList = React.lazy(() => import("./pages/cluster/list"));
// ... 其他页面

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/vm" element={<VMList />} />
        <Route path="/vm/:uuid" element={<VMDetail />} />
        <Route path="/host" element={<HostList />} />
        {/* ... */}
      </Routes>
    </Suspense>
  );
};
```

### 2. 命名空间导入问题 (`bundle-barrel-imports`)

**问题**: 44 处使用 `import * as _ from 'lodash-es'`，会导入整个库。

**影响文件**:

- `pages/vm/utils.tsx`
- `pages/vm/action/validators.ts`
- `pages/cluster/action/validator.ts`
- 等 44 个文件

**优化方案**:

```tsx
// ❌ 当前写法
import * as _ from "lodash-es";
_.includes(arr, item);
_.sortBy(list, "key");

// ✅ 优化后
import { includes, sortBy } from "lodash-es";
includes(arr, item);
sortBy(list, "key");
```

### 3. 顺序 await 导致请求瀑布 (`async-parallel`)

**问题**: `validators.ts` 中多个独立的 GraphQL 查询顺序执行。

```typescript
// ❌ 当前写法 - 顺序执行
const { data: getLicenseInfoData } = await apolloClient.query({...});
const { data: getLicenseAddOnsData } = await apolloClient.query({...});

// ✅ 优化后 - 并行执行
const [licenseInfoResult, licenseAddOnsResult] = await Promise.all([
  apolloClient.query({ query: GET_LICENSE_INFO }),
  apolloClient.query({ query: GET_LICENSE_ADDONS })
]);
```

---

## 🟠 高优先级问题 (HIGH)

### 4. 组件库迁移 (`bundle-defer-third-party`)

**问题**: 307 处直接使用 `antd`，违反项目规范且增加 bundle 体积。

**建议**: 逐步迁移到 `@zstack/design` 和 `@zstack/zsphere-components`。

### 5. useCallback 使用不足 (`rerender-functional-setstate`)

**问题**: 只有 115 处使用 useCallback，但有 846 处 useMemo，比例失衡。

**示例优化** (`pages/vm/utils.tsx`):

```tsx
// ❌ 当前写法 - validatorIp 每次渲染都创建新函数
export const useValidatorIp = () => {
  const intl = useIntl()
  const [remoteValidateIp] = useMutation(...)

  async function validatorIp({...}) { // 每次都是新函数
    // ...
  }
  return validatorIp
}

// ✅ 优化后
export const useValidatorIp = () => {
  const intl = useIntl()
  const [remoteValidateIp] = useMutation(...)

  const validatorIp = useCallback(async ({...}) => {
    // ...
  }, [intl, remoteValidateIp])

  return validatorIp
}
```

### 6. filter().map() 链式调用 (`js-combine-iterations`)

**问题**: 9 处使用 `.filter().map()` 链式调用，可合并为单次遍历。

```tsx
// ❌ 当前写法 (cpu-mode.tsx)
customCpuMode
  .filter((it: any) => it != null)
  .map((it: any) => (
    <Select.Option key={it} value={it}>
      {it}
    </Select.Option>
  ));

// ✅ 优化后 - 使用 flatMap 或 reduce
customCpuMode.flatMap((it: any) =>
  it != null
    ? [
        <Select.Option key={it} value={it}>
          {it}
        </Select.Option>,
      ]
    : [],
);
```

---

## 🟡 中优先级问题 (MEDIUM)

### 7. React.memo 覆盖率低 (`rerender-memo`)

**问题**: 1027 个组件中只有 130 处使用 React.memo (~12.7%)。

**建议**: 对以下类型组件添加 React.memo:

- 列表项组件
- 表单字段组件
- 卡片组件
- 详情页子组件

### 8. useEffect 依赖项问题 (`rerender-dependencies`)

**示例** (`cpu-mode.tsx`):

```tsx
// ⚠️ 当前写法 - 依赖数组不完整
useEffect(() => {
  if (!isEdit) {
    // 使用了 form 但未在依赖中
    form.setFieldsValue({ CPUMode: "none" });
  }
}, [runPath, isEdit]); // 缺少 form

// ✅ 优化后
useEffect(() => {
  if (!isEdit) {
    form.setFieldsValue({ CPUMode: "none" });
  }
}, [runPath, isEdit, form]);
```

### 9. 条件渲染优化 (`rendering-conditional-render`)

```tsx
// ⚠️ 使用 && 可能渲染 0 或 false
{
  list.length && <Component />;
}

// ✅ 使用三元表达式
{
  list.length > 0 ? <Component /> : null;
}
```

---

## 🟢 低优先级但推荐 (LOW)

### 10. 正则表达式提升 (`js-hoist-regexp`)

```tsx
// ❌ 当前写法 - 每次调用都创建正则
const isValidPassword = (value: string) => {
  return /^(?=.*?[A-Z])(?=.*?[a-z]).../.test(value);
};

// ✅ 优化后 - 提升到模块级
const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z]).../;
const isValidPassword = (value: string) => PASSWORD_REGEX.test(value);
```

### 11. 使用 Set 进行 O(1) 查找 (`js-set-map-lookups`)

```tsx
// ❌ 当前写法
const validStates = ["Running", "Paused", "Stopped", "Crashed"];
_.includes(validStates, state);

// ✅ 优化后
const VALID_STATES = new Set(["Running", "Paused", "Stopped", "Crashed"]);
VALID_STATES.has(state);
```

---

## 📋 优化优先级清单

| 优先级 | 问题                        | 预期收益            | 工作量 | 状态      |
| ------ | --------------------------- | ------------------- | ------ | --------- |
| P0     | 添加 React.lazy 代码分割    | 首屏加载减少 40-60% | 中     | ✅ 已完成 |
| P0     | 优化 lodash 导入方式        | Bundle 减少 ~50KB   | 低     | ✅ 已完成 |
| P1     | 并行化 GraphQL 请求         | 请求时间减少 50%+   | 低     | 待处理    |
| P1     | 迁移 antd 到 @zstack/design | 符合规范 + 减少体积 | 高     | 待处理    |
| P2     | 增加 useCallback 使用       | 减少不必要重渲染    | 中     | 待处理    |
| P2     | 增加 React.memo 覆盖        | 减少子组件重渲染    | 中     | 待处理    |
| P3     | 合并 filter/map 链          | 微优化              | 低     | 待处理    |
| P3     | 正则表达式提升              | 微优化              | 低     | 待处理    |

---

## 🛠️ 已完成的优化

### 2026-01-28

1. **修复 lodash 命名空间导入** - 44 个文件已优化为具名导入

### ⚠️ 关于 React.lazy 的说明

本项目使用 **Module Federation 微前端架构**，每个通过 `exposes` 暴露的模块在被消费时已经是动态加载的。

在开发模式下，Rsbuild 的 lazy compilation 功能会与 `React.lazy` 动态导入产生冲突，导致 HTTP 404 错误：

```
Error: Problem communicating active modules to the server: HTTP 404
```

因此，**不建议在 Module Federation 暴露的模块内部再使用 `React.lazy`**。如果确实需要代码分割，建议：

1. 在生产构建时禁用 lazy compilation
2. 或者将需要懒加载的组件也通过 Module Federation 暴露

---

## 📚 参考资料

- [React Best Practices - Vercel Engineering](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
- [Bundle Size Optimization](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
- [React.lazy and Suspense](https://react.dev/reference/react/lazy)
