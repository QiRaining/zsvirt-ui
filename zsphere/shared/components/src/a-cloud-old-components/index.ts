import {
  default as Action,
  LicenseActionConfigProvider,
  useActionByLicense,
  useLicenseAction,
} from "./action";
import Alert from "./alert";
import {
  default as Auth,
  AuthHander,
  AuthInfoContext,
  useActiveMenu,
  useAuth,
  useAuthInfoContext,
  useAuthMap,
  useRouterByAuth,
} from "./auth";
import { default as Card, DraggableCard } from "./card";
import { ConfigContext, default as ConfigProvider } from "./config";
// import { default as Chart, ChartListProvider } from "./chart";
import { default as Drawer } from "./drawer";
import { default as Field } from "./field";
import { default as Form } from "./form";
import { default as InputUnit } from "./input-unit";
import { default as ListCollect } from "./list-collect";
import {
  default as ReactMarkdown,
  MarkdownWithHtml as ReactMarkdownWithHtml,
} from "./markdown";
import { default as Modal, useValidatePassword } from "./modal";
import { default as Pagination } from "./pagination";
import {
  default as ResourceCapacityOld,
  IResourceCapacityType,
  ResourceCapacityProgress,
} from "./resource-capacity";
import { default as Search } from "./search";
import { default as Select } from "./select";
import { default as SortableList } from "./sortable-list";
import { default as State } from "./state";
import { default as Table } from "./table";
import { default as TableList, useFetch, TableDetailLink } from "./table-list";
import {
  default as SearchAdvanced,
  SearchContext,
  useSearch,
} from "./table-list/components/search-advanced";
import { TabContext, TabPane, Tabs, useTabs } from "./tabs";
import { useClearTargetRouterTabMemo } from "./tabs-2/hooks/use-clear-target-router-tab-memo";
import { useIsCurrentTab } from "./tabs-2/hooks/use-is-current-tab";
import { usePersistTabState } from "./tabs-2/hooks/use-persist-tab-store";
import { useSetTab } from "./tabs-2/hooks/use-set-tab";
import { TabPane as TabPane2, Tabs as Tabs2 } from "./tabs-2/index";
import { usePageStateStore } from "./tabs-2/store/page-state-store";
import { default as Tag } from "./tag";
import { default as Text } from "./text";
import { default as CloudUpload } from "./upload";

// 这个组件要用新的
// import { default as Graphs } from "./graphs";

export {
  // -- ResourceCapacity
  ResourceCapacityOld,
  IResourceCapacityType,
  ResourceCapacityProgress,
  // -- Action
  Action,
  LicenseActionConfigProvider,
  useActionByLicense,
  useLicenseAction,
  // -- Alert
  Alert,
  // -- Auth
  Auth,
  AuthHander,
  AuthInfoContext,
  useActiveMenu,
  useAuth,
  useAuthInfoContext,
  useAuthMap,
  useRouterByAuth,
  // -- Card
  Card,
  DraggableCard,
  // -- Chart 这个要用新的
  // Chart,
  // ChartListProvider,
  // -- Config
  ConfigContext,
  ConfigProvider,
  // -- Drawer
  Drawer,
  // -- Field
  Field,
  // -- Form
  Form,
  // -- InputUnit
  InputUnit,
  // -- ListCollect
  ListCollect,
  // -- ReactMarkdown
  ReactMarkdown,
  ReactMarkdownWithHtml,
  // -- Modal
  Modal,
  useValidatePassword,
  // -- Pagination
  Pagination,
  // -- Search
  Search,
  // -- SearchAdvanced
  SearchAdvanced,
  SearchContext,
  useSearch,
  // -- Select
  Select,
  // -- SortableList
  SortableList,
  // -- State
  State,
  // -- Table
  Table,
  // -- TableList
  TableList,
  useFetch,
  TableDetailLink,
  // -- Tabs
  TabContext,
  TabPane,
  Tabs,
  useTabs,
  // -- Tabs2
  TabPane2,
  Tabs2,
  useClearTargetRouterTabMemo,
  useIsCurrentTab,
  usePersistTabState,
  useSetTab,
  // -- PageStateStore
  usePageStateStore,
  // -- Tag
  Tag,
  // -- Text
  Text,
  // -- Upload
  CloudUpload,
  // -- Graphs
  // Graphs,
};
