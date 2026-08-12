# Tree 组件设计 PRD

## 1. 概述

### 1.1 背景

Tree 组件是 ZStack UI Next 中用于展示层级结构数据的核心组件，广泛应用于资源管理、目录导航、组织架构等场景。当前代码库中 Tree 组件主要基于 Ant Design 的 `Tree.DirectoryTree` 进行封装和扩展。

### 1.2 目标

- 统一 Tree 组件的使用规范
- 提供标准化的 API 和扩展能力
- 支持虚拟滚动、状态持久化、搜索过滤等高级特性
- 提升开发效率和用户体验

### 1.3 适用范围

- 资源树（云主机、存储、网络等）
- 目录树（VM 分组、集群视图）
- 组织架构树
- 模态框树选择器
- 快照树、备份树等业务场景

---

## 2. 现状分析

### 2.1 使用场景统计

#### 2.1.1 资源树（Resource Tree）

**位置**: `packages/products/zsv/apps/resource/src/layouts/resource-tree/`

**特点**:

- 支持多种资源类型：集群主机、数据存储、网络、模板镜像、裸金属等
- 支持状态持久化（localStorage）
- 支持搜索模式（SearchTree）
- 支持右键菜单操作（ActionWrapper）
- 支持动态状态查询（VM、Host、BareMetal 等）

**关键配置**:

```typescript
<Tree.DirectoryTree
  height={size.height}
  titleRender={directoryItem}
  onRightClick={onRightClick}
  showIcon={false}
  itemHeight={32}
  blockNode
  showLine={false}
  treeData={treeInfo.treeData}
  onSelect={onTreeNodeSelect}
  onExpand={setExpandedKeys}
  switcherIcon={renderSwitcherIcon}
  expandedKeys={expandedKeys}
  expandAction="doubleClick"
  selectedKeys={selectedKey ? [selectedKey] : []}
/>
```

#### 2.1.2 VM 目录树（Directory Tree）

**参考来源**: 旧产品线 VM 目录树实现；ZSV 当前资源树实现位于
`packages/products/zsv/apps/resource/src/layouts/resource-tree/`

**特点**:

- 支持分组视图和集群视图切换
- 支持虚拟滚动
- 支持搜索过滤
- 支持一键展开/折叠
- 支持 sessionStorage 状态保存

**关键配置**:

```typescript
<Tree.DirectoryTree
  height={virtualScrollHeight}
  titleRender={directoryItem}
  showIcon={false}
  itemHeight={32}
  blockNode
  showLine={true}
  treeData={treeData}
  onSelect={onTreeNodeSelect}
  onExpand={onTreeNodeExpand}
  switcherIcon={<Icon type="arrow-down-fill" />}
  expandedKeys={expandedKeys}
  expandAction={false}
  selectedKeys={selectedKeys}
/>
```

#### 2.1.3 模态框树选择器（Modal Tree Select）

**位置**: `packages/products/zsv/shared/components/src/modal-tree-select/`

**特点**:

- 支持单选（radio）和复选（checkbox）模式
- 支持虚拟滚动
- 支持自定义节点渲染
- 支持右键菜单

**关键配置**:

```typescript
<Tree.DirectoryTree
  height={treeHeight}
  onCheck={selectType === "checkbox" ? onCheck : undefined}
  onSelect={selectType === "radio" ? onSelect : undefined}
  titleRender={directoryItem}
  checkable={selectType === "checkbox"}
  selectable={selectType !== "checkbox"}
  blockNode
  defaultExpandAll={true}
  showLine={false}
  treeData={treeData}
/>
```

#### 2.1.4 组织树（Org Tree）

**参考来源**: 旧产品线组织树实现；ZSV 侧应按当前应用目录重新落位。

**特点**:

- 使用 `TreeSelect` 组件（下拉树选择器）
- 支持懒加载（loadData）
- 支持过滤默认组织
- 支持权限控制

#### 2.1.5 快照树（Snapshot Tree）

**位置**: `packages/products/zsv/apps/data-protection/src/pages/snapshot/components/tree/`

**特点**:

- 支持右键菜单操作
- 支持动态加载
- 支持自定义节点状态显示

### 2.2 通用模式总结

#### 2.2.1 核心配置项

| 配置项         | 说明           | 默认值              | 使用频率 |
| -------------- | -------------- | ------------------- | -------- |
| `height`       | 虚拟滚动高度   | -                   | 100%     |
| `itemHeight`   | 节点高度       | 32                  | 100%     |
| `blockNode`    | 节点占满整行   | true                | 100%     |
| `showIcon`     | 显示图标       | false               | 100%     |
| `showLine`     | 显示连接线     | false/true          | 50%      |
| `titleRender`  | 自定义节点渲染 | -                   | 100%     |
| `switcherIcon` | 展开/折叠图标  | -                   | 100%     |
| `expandAction` | 展开触发方式   | false/"doubleClick" | 100%     |

#### 2.2.2 状态管理

- **展开状态**: `expandedKeys` + `onExpand`
- **选中状态**: `selectedKeys` + `onSelect` 或 `checkedKeys` + `onCheck`
- **持久化**: localStorage/sessionStorage
- **搜索状态**: 独立的搜索模式，展开所有节点

#### 2.2.3 虚拟滚动

- 所有场景都使用虚拟滚动（`height` 属性）
- 使用 `useSize` hook 动态计算高度
- 使用 `MutationObserver` 监听 DOM 变化，调整滚动条样式

#### 2.2.4 自定义节点渲染

- 100% 的场景都使用 `titleRender` 自定义节点
- 节点组件通常包含：图标、标题、状态、操作按钮等

---

## 3. 组件设计规范

### 3.1 基础 Tree 组件

#### 3.1.1 组件定义

```typescript
interface TreeProps {
  // 数据
  treeData: TreeNode[];

  // 状态控制
  expandedKeys?: string[];
  selectedKeys?: string[];
  checkedKeys?: string[] | { checked: string[]; halfChecked: string[] };

  // 回调
  onExpand?: (expandedKeys: string[]) => void;
  onSelect?: (selectedKeys: string[], info: any) => void;
  onCheck?: (checkedKeys: string[], info: any) => void;
  onRightClick?: (node: TreeNode) => void;

  // 渲染
  titleRender?: (nodeData: TreeNode) => React.ReactNode;
  switcherIcon?:
    | React.ReactNode
    | ((props: { expanded: boolean; isLeaf: boolean }) => React.ReactNode);

  // 虚拟滚动
  height?: number;
  itemHeight?: number;

  // 样式
  blockNode?: boolean;
  showIcon?: boolean;
  showLine?: boolean;

  // 行为
  expandAction?: false | "click" | "doubleClick";
  checkable?: boolean;
  selectable?: boolean;

  // 其他
  defaultExpandAll?: boolean;
  [key: string]: any;
}
```

#### 3.1.2 数据模型

```typescript
interface TreeNode {
  key: string;
  title: string | React.ReactNode;
  children?: TreeNode[];
  isLeaf?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  [key: string]: any; // 扩展属性
}
```

### 3.2 扩展功能

#### 3.2.1 状态持久化

```typescript
interface PersistTreeStatusOptions {
  treeKey: string;
  expandedKeys?: string[];
  selectedKeys?: string[];
}

// 保存状态
const setTreeStatus = (options: PersistTreeStatusOptions) => void;

// 恢复状态
const getTreeStatus = (options: { key: string }) => {
  expandedKeys: string[] | null;
  selectedKeys: string[] | null;
};
```

#### 3.2.2 搜索功能

```typescript
interface SearchTreeProps extends TreeProps {
  searchValue?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
}

// 搜索模式：自动展开所有节点
const SearchTree: React.FC<SearchTreeProps> = ({ searchValue, ...props }) => {
  const expandedKeys = searchValue
    ? getAllExpandableKeys(props.treeData)
    : props.expandedKeys;

  return <Tree {...props} expandedKeys={expandedKeys} />;
};
```

#### 3.2.3 虚拟滚动优化

```typescript
// 使用 MutationObserver 优化滚动条样式
const useTreeScrollOptimization = (treeRef: RefObject<HTMLElement>) => {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      // 调整滚动条显示/隐藏
      // 调整容器宽度
    });

    if (treeRef.current) {
      observer.observe(treeRef.current, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }

    return () => observer.disconnect();
  }, [treeRef]);
};
```

#### 3.2.4 控制器 API

```typescript
interface TreeController {
  expandAll: () => void;
  collapseAll: () => void;
  scrollTo: (key: string, align?: 'top' | 'bottom' | 'auto') => void;
}

const TreeWithController = forwardRef<TreeController, TreeProps>((props, ref) => {
  useImperativeHandle(ref, () => ({
    expandAll: () => setExpandedKeys(getAllKeys(treeData)),
    collapseAll: () => setExpandedKeys([]),
    scrollTo: (key: string) => treeRef.current?.scrollTo({ key }),
  }));

  return <Tree {...props} />;
});
```

### 3.3 业务扩展组件

#### 3.3.1 ResourceTree（资源树）

```typescript
interface ResourceTreeProps extends TreeProps {
  resourceType: "vm" | "host" | "cluster" | "storage" | "network";
  onResourceSelect?: (resource: Resource) => void;
  enableActionMenu?: boolean;
  persistStatus?: boolean;
}
```

#### 3.3.2 DirectoryTree（目录树）

```typescript
interface DirectoryTreeProps extends TreeProps {
  viewType: "group" | "cluster";
  onDirectorySelect?: (directory: Directory) => void;
  enableSearch?: boolean;
  enableExpandAll?: boolean;
}
```

#### 3.3.3 ModalTreeSelect（模态框树选择）

```typescript
interface ModalTreeSelectProps extends TreeProps {
  selectType: "radio" | "checkbox";
  onConfirm?: (selected: TreeNode[]) => void;
  onCancel?: () => void;
  maxSelect?: number;
}
```

---

## 4. API 设计

### 4.1 核心 API

#### Tree

```typescript
<Tree
  treeData={treeData}
  height={500}
  itemHeight={32}
  expandedKeys={expandedKeys}
  selectedKeys={selectedKeys}
  onExpand={handleExpand}
  onSelect={handleSelect}
  titleRender={renderNode}
  blockNode
  showLine={false}
/>
```

#### Tree.SearchTree

```typescript
<Tree.SearchTree
  treeData={treeData}
  searchValue={searchValue}
  onSearch={handleSearch}
  height={500}
  // ... 其他 props
/>
```

#### Tree.TreeWithController

```typescript
const treeControllerRef = useRef<TreeController>(null);

<Tree.TreeWithController
  ref={treeControllerRef}
  treeData={treeData}
  // ... 其他 props
/>

// 使用
treeControllerRef.current?.expandAll();
```

### 4.2 Hooks API

#### useTreeState

```typescript
const {
  expandedKeys,
  selectedKeys,
  setExpandedKeys,
  setSelectedKeys,
  expandAll,
  collapseAll,
} = useTreeState({
  treeData,
  defaultExpandedKeys: ["root"],
  persistKey: "my-tree",
});
```

#### useTreeSearch

```typescript
const { searchValue, filteredTreeData, setSearchValue, clearSearch } =
  useTreeSearch({
    treeData,
    searchKey: "title",
    filterFn: (node, value) => node.title.includes(value),
  });
```

#### useTreePersist

```typescript
const { expandedKeys, selectedKeys, setExpandedKeys, setSelectedKeys } =
  useTreePersist({
    key: "resource-tree",
    defaultExpandedKeys: ["root"],
  });
```

---

## 5. 使用指南

### 5.1 基础用法

```typescript
import { Tree } from '@zstack/design';

const MyTree = () => {
  const [expandedKeys, setExpandedKeys] = useState(['root']);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const treeData = [
    {
      key: 'root',
      title: '根节点',
      children: [
        { key: 'child1', title: '子节点1' },
        { key: 'child2', title: '子节点2' },
      ],
    },
  ];

  const renderNode = (nodeData: TreeNode) => (
    <div>
      <Icon type={nodeData.icon} />
      <span>{nodeData.title}</span>
    </div>
  );

  return (
    <Tree
      treeData={treeData}
      height={500}
      expandedKeys={expandedKeys}
      selectedKeys={selectedKeys}
      onExpand={setExpandedKeys}
      onSelect={setSelectedKeys}
      titleRender={renderNode}
      blockNode
    />
  );
};
```

### 5.2 带搜索的树

```typescript
import { Tree } from '@zstack/design';

const SearchableTree = () => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <>
      <Input
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="搜索节点"
      />
      <Tree.SearchTree
        treeData={treeData}
        searchValue={searchValue}
        height={500}
        titleRender={renderNode}
      />
    </>
  );
};
```

### 5.3 带状态持久化的树

```typescript
import { Tree, useTreePersist } from '@zstack/design';

const PersistentTree = () => {
  const {
    expandedKeys,
    selectedKeys,
    setExpandedKeys,
    setSelectedKeys,
  } = useTreePersist({
    key: 'my-tree',
    defaultExpandedKeys: ['root'],
  });

  return (
    <Tree
      treeData={treeData}
      expandedKeys={expandedKeys}
      selectedKeys={selectedKeys}
      onExpand={setExpandedKeys}
      onSelect={setSelectedKeys}
      height={500}
    />
  );
};
```

### 5.4 资源树（带右键菜单）

```typescript
import ResourceTree from "@zstack/virtualization-resource/src/layouts/resource-tree";

const MyResourceTree = () => {
  return (
    <ResourceTree
      resourceType="vm"
      treeData={treeData}
      onResourceSelect={(resource) => {
        console.log('选中资源:', resource);
      }}
      enableActionMenu
      persistStatus
      height={500}
    />
  );
};
```

---

## 6. 样式规范

### 6.1 尺寸规范

- **节点高度**: 32px（标准）
- **图标尺寸**: 16x16px
- **缩进**: 每级 24px
- **最小宽度**: 200px

### 6.2 颜色规范

- **选中背景**: `var(--color-primary-50)`
- **悬停背景**: `var(--color-neutral-50)`
- **连接线颜色**: `var(--color-neutral-200)`
- **文字颜色**: `var(--color-neutral-800)`

### 6.3 交互规范

- **展开/折叠**: 点击 switcher 图标或双击节点
- **选中**: 单击节点
- **右键菜单**: 右键点击节点
- **搜索**: 实时过滤，自动展开匹配节点

---

## 7. 性能优化

### 7.1 虚拟滚动

- 所有 Tree 组件必须启用虚拟滚动（设置 `height`）
- 使用 `itemHeight` 精确控制节点高度
- 大数据量场景（>1000 节点）必须使用虚拟滚动

### 7.2 数据优化

- 懒加载：使用 `loadData` 实现按需加载
- 数据扁平化：减少嵌套层级，提升渲染性能
- 节点缓存：使用 `React.memo` 优化节点组件

### 7.3 状态优化

- 使用 `useMemo` 缓存计算后的 treeData
- 使用 `useCallback` 缓存回调函数
- 状态持久化使用防抖，避免频繁写入

---

## 8. 可访问性（a11y）

### 8.1 键盘导航

- `↑↓`: 上下移动
- `←→`: 展开/折叠
- `Enter/Space`: 选中节点
- `Esc`: 取消选中

### 8.2 ARIA 属性

- `role="tree"`
- `aria-expanded`
- `aria-selected`
- `aria-level`

---

## 9. 测试规范

### 9.1 单元测试

- 节点渲染测试
- 展开/折叠测试
- 选中/取消选中测试
- 搜索过滤测试
- 状态持久化测试

### 9.2 集成测试

- 虚拟滚动测试
- 大数据量渲染测试
- 右键菜单测试
- 懒加载测试

---

## 10. 迁移指南

### 10.1 从 Ant Design Tree 迁移

```typescript
// 旧代码
import { Tree } from 'antd';
<Tree treeData={data} />

// 新代码
import { Tree } from '@zstack/design';
<Tree treeData={data} height={500} blockNode />
```

### 10.2 从自定义 Tree 迁移

- 统一使用 `Tree.DirectoryTree` 作为基础
- 使用标准化的 props 接口
- 迁移自定义逻辑到 hooks

---

## 11. 后续规划

### 11.1 短期（1-2 个月）

- [ ] 统一现有 Tree 组件实现
- [ ] 提取通用 hooks（useTreeState, useTreeSearch）
- [ ] 完善 TypeScript 类型定义
- [ ] 编写使用文档和示例

### 11.2 中期（3-6 个月）

- [ ] 实现 Tree 组件库（@zstack/design-tree）
- [ ] 支持拖拽排序
- [ ] 支持节点编辑
- [ ] 性能优化和测试

### 11.3 长期（6+ 个月）

- [ ] 支持多选拖拽
- [ ] 支持节点分组
- [ ] 支持自定义布局
- [ ] 支持动画效果

---

## 12. 附录

### 12.1 相关文件清单

- `packages/products/zsv/apps/resource/src/layouts/resource-tree/`
- 旧产品线 VM 目录树实现
- `packages/products/zsv/shared/components/src/modal-tree-select/`
- 目标应用内的组织树实现目录

### 12.2 参考资源

- Ant Design Tree: https://ant.design/components/tree-cn
- React Virtual: https://github.com/tanstack/react-virtual
- Accessibility: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/

---

**文档版本**: v1.0  
**最后更新**: 2024-12  
**维护者**: ZStack UI Team
