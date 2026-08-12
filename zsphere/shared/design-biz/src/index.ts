// ============================================
// AuthTabs 组件导出
// ============================================
export { AuthTabs } from "./components/auth-tabs/auth-tabs";
export type {
  AuthTabsProps,
  AuthTabsListItem,
} from "./components/auth-tabs/auth-tabs";

// ============================================
// 基础组件导出
// ============================================
export { AutoSkeleton } from "./components/auto-skeleton";
export { Username } from "./components/username";
export { Spinner, spinnerVariants } from "./components/spinner";
export { Empty, useEmptyConfig } from "./components/empty";
export { Alert } from "./components/alert";
export {
  ZSVFormTabs,
  ZSVHardwareTabs,
  ZSVHardwareTabsAddButton,
} from "./components/form-tabs";
export type {
  ZSVFormTabsItem,
  ZSVFormTabsProps,
  ZSVHardwareTabsItem,
  ZSVHardwareTabsProps,
} from "./components/form-tabs";

// ============================================
// Dialog 组件导出
// ============================================
export {
  DialogWeak,
  DialogWeakP1,
  DialogP0,
  DialogP0Password,
  DialogP0Smart,
  DialogDestructive,
  DialogP1,
  DialogP2,
  DialogP3,
  DialogBase,
  DialogForm,
  useDialogFormContext,
  DialogSelectWay,
  DialogSelectedResource,
  DialogRelatedResource,
  DialogDeletionForm,
  DialogPasswordForm,
  useDialogFormSchemaDeletion,
  useDialogFormSchemaDeletionPassword,
} from "./components/dialog";

// ============================================
// 业务组件导出 (biz/)
// ============================================
export {
  // Header
  HeaderList,
  HeaderDetail,
  Header,
  // Title
  Title,
  // Detail
  DetailDrawer,
  Detail,
  // ResourceName
  ResourceName,
  // TagList
  TagList,
  // NotFound
  NotFound,
  // IconText
  IconText,
  // IconState
  IconState,
  // ResizableLayout
  ResizableLayout,
  // Constant
  Constant,
  useConstant,
  ConfigContext,
  // TaskDot
  TaskDot,
  // Hooks
  useShare,
  // ConfigEmptyProvider
  ConfigEmptyProvider,
  ConfigEmptyContext,
  useConfigEmpty,
  customRenderEmpty,
  // LongText
  LongText,
  // CopyableText
  CopyableText,
} from "./components/biz";

// ============================================
// 类型导出
// ============================================
export type { AutoSkeletonProps } from "./components/auto-skeleton";
export type { SpinnerProps } from "./components/spinner";
export type { AlertProps, GuideAction } from "./components/alert";
export type {
  EmptyProps,
  EmptyType,
  ConfigEmptyProviderProps,
} from "./components/empty";

// Dialog 类型
export type {
  DialogWeakProps,
  DialogWeakP1Props,
  DialogP0Props,
  DialogP0PasswordProps,
  DialogP0SmartProps,
  DialogDestructiveProps,
  DialogP1Props,
  DialogP2Props,
  DialogP3Props,
  DialogBaseProps,
  DialogFormProps,
  IDialogFormContext,
  DialogSelectWayProps,
  SelectWayEntry,
  DialogDeletionFormGuide,
  DialogDeletionPasswordFormGuide,
} from "./components/dialog";

// 业务组件类型
export type {
  HeaderListProps,
  HeaderDetailProps,
  TitleProps,
  DetailDrawerProps,
  DetailDrawerTabPane,
  ResourceNameProps,
  ResourceNameLinkProps,
  TagListProps,
  TagItem,
  NotFoundProps,
  IconTextProps,
  IconStateProps,
  ResizableLayoutProps,
  ConstantProps,
  StateProps,
  StateContentType,
  TaskDotProps,
  Task,
  TaskStatus,
  UseShareReturn,
  ShareResource,
  ConfigEmptyProps,
  LongTextProps,
  CopyableTextProps,
} from "./components/biz";
