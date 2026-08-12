declare module "*.less";
declare module "*.webp" {
  const content: string;
  export default content;
}
declare module "*.json";
declare module "*.gql";
declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.svg?react" {
  import React from "react";

  // 部分 SVG 组件支持自定义 size / color / colorNumber
  interface ReactComponentProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    color?: string;
    colorNumber?: number;
  }

  const ReactComponent: React.FC<ReactComponentProps>;
  export default ReactComponent;
}
declare module "zsv_resource_shared/vm/mf-index";
declare module "zsv_data_protection_shared/backup-management/backup-policy/mf-index";
declare module "zsv_data_protection_shared/backup-management/protected-resource/vm/mf-index";
declare module "zsv_shared/auditing/list";
declare module "@zstack/zsphere-components";
declare module "single-spa" {
  export function navigateToUrl(
    url: string | MouseEvent | React.MouseEvent<HTMLAnchorElement>,
  ): void;
  export function registerApplication(
    name: string,
    app: any,
    activeWhen: any,
  ): void;
  export function start(): void;
}

// 修复 lodash-es 导入问题 - lodash-es 4.x 支持命名导出，但需要正确的类型声明
declare module "lodash-es" {
  export function get(
    object: any,
    path: string | string[],
    defaultValue?: any,
  ): any;
  export function isElement(value: any): boolean;
  export function cloneDeepWith(value: any, customizer?: any): any;
  export function difference<T>(array: T[], ...values: T[][]): T[];
  export function differenceBy<T>(array: T[], ...values: any[]): T[];
  export function flatten<T>(array: any[]): T[];
  export function flattenDeep<T>(array: any[]): T[];
  export function map<T, U>(
    collection: T[] | Record<string, T>,
    iteratee?: any,
  ): U[];
  export function isEqual(value: any, other: any): boolean;
  export function sortBy<T>(
    collection: T[] | Record<string, T>,
    iteratees?: any,
  ): T[];
  export function find<T>(
    collection: T[] | Record<string, T>,
    predicate?: any,
  ): T | undefined;
  export function remove<T>(array: T[], predicate?: any): T[];
  export function isFunction(value: any): value is Function;
  export function isString(value: any): value is string;
  export function isBoolean(value: any): value is boolean;
  export function isNil(value: any): value is null | undefined;
  export function isEmpty(value: any): boolean;
  export function isUndefined(value: any): value is undefined;
  export function isArray(value: any): value is any[];
  export function isNull(value: any): value is null;
  export function forIn<T>(object: T, iteratee?: any): T;
  export function uniq<T>(array: T[]): T[];
  export function uniqBy<T>(array: T[], iteratee?: any): T[];
  export function compact<T>(
    array: (T | null | undefined | false | 0 | "")[],
  ): T[];
  export function pull<T>(array: T[], ...values: T[]): T[];
  export function intersection<T>(...arrays: T[][]): T[];
  export function intersectionBy<T>(...arrays: any[]): T[];
  export function cloneDeep<T>(value: T): T;
  export function uniqueId(prefix?: string): string;
  export function throttle<T extends (...args: any[]) => any>(
    func: T,
    wait?: number,
    options?: any,
  ): T;
  export function toNumber(value: any): number;
  export function floor(value: number, precision?: number): number;
  export function clamp(number: number, lower?: number, upper?: number): number;
  export function slice<T>(array: T[], start?: number, end?: number): T[];
  export function concat<T>(...arrays: (T | T[])[]): T[];
  export function replace(
    string: string,
    pattern: string | RegExp,
    replacement: string,
  ): string;
  export function capitalize(string: string): string;
  export function includes<T>(collection: T[] | string, value: any): boolean;
  export function sum(collection: any[]): number;
  export function keys(object: any): string[];
  export function merge(object: any, ...sources: any[]): any;
  export function union<T>(...arrays: T[][]): T[];
  export function unionBy<T>(...arrays: any[]): T[];
  export function eq(value: any, other: any): boolean;
  export function split(
    string: string,
    separator?: string | RegExp,
    limit?: number,
  ): string[];
  export const _: any;
  export default _;
}

// 修复 @zstack/zsphere-utils 的导出问题
declare module "@zstack/zsphere-utils" {
  export namespace Color {
    export type ISemantic =
      | "positive"
      | "info"
      | "alert"
      | "danger"
      | "pending"
      | "disabled"
      | "normal";
    export type ITheme =
      | "blue"
      | "violet"
      | "purple"
      | "red"
      | "yellow"
      | "yellow-green"
      | "green"
      | "teal";
    export type IMode = "dark" | "light";
    export type ISemanticNumber = 50 | 100 | 200 | 300 | 400 | 500 | 600;
    export type IThemeNumber =
      | 50
      | 100
      | 200
      | 300
      | 400
      | 500
      | 600
      | 700
      | 800
      | 900;
    export type INeutralNumber =
      | 0
      | 50
      | 100
      | 200
      | 300
      | 400
      | 500
      | 600
      | 700
      | 800
      | 900;
  }

  export function getSemanticColor(
    semantic: Color.ISemantic,
    mode?: Color.IMode,
    number?: Color.ISemanticNumber,
  ): string;
  export function getNeutralColor(
    mode?: Color.IMode,
    number?: Color.INeutralNumber,
  ): string;
  export function getThemeColor(
    theme: Color.ITheme,
    mode?: Color.IMode,
    number?: Color.IThemeNumber,
  ): string;
  export function formatBytesToSize(
    value?: number | string,
    decimal?: number,
  ): string;
  export function formatStorageToObj(
    value?: number | string,
    decimal?: number,
    suffixUnit?: string,
  ): { number: number | string; unit: string };
  export function parseNumber(value: any): number;
  export function formatPercent(
    value: number | string,
    decimal?: number,
  ): string;
  export function formatBytes(
    value?: number | string,
    decimal?: number,
  ): string;
  export function formatOps(value?: number | string, decimal?: number): string;
  export function formatPps(value?: number | string, decimal?: number): string;
  export function formatCount(
    value?: number | string,
    decimal?: number,
  ): string;
  export function formatTime(value: any, format?: string): string;
  export function beautyStr(str: string, maxLength?: number): string;
  export function genUuid(): string;
  export const bus: {
    emit(type: string, ...args: any[]): void;
    addListener(type: string, cb: Function): void;
    removeListener(type: string, cb?: Function): void;
  };
  export function objToUrl(options: any): string;
  export function Encrypt(word: string): string;
  export function getGQL(...args: any[]): any;
  export function parseNumber(value: any, unit?: string): number;
  export function getLocaleFromStorage(fallback?: string): string;
  export function setLocaleToStorage(locale: string): void;
  export function getValidLocale(fallback?: string): string;
}

// 声明缺失的模块
declare module "graphql" {
  export type DocumentNode = any;
  export const gql: any;
  export type FieldNode = any;
  export type FragmentDefinitionNode = any;
  export type FragmentSpreadNode = any;
  export function visit(ast: any, visitor: any): any;
}

declare module "react-error-boundary" {
  import { Component, ReactNode } from "react";
  export interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?:
      | ReactNode
      | ((error: Error, resetErrorBoundary: () => void) => ReactNode);
    fallbackRender?: (props: {
      error: Error;
      resetErrorBoundary: () => void;
    }) => ReactNode;
    onError?: (error: Error, errorInfo: any) => void;
  }
  export class ErrorBoundary extends Component<ErrorBoundaryProps> {}
}

declare module "rc-virtual-list" {
  import { Component } from "react";
  export interface VirtualListProps {
    children?: any;
    data?: any[];
    height?: number;
    itemHeight?: number;
    itemKey?: string | ((item: any, index: number) => string | number);
    [key: string]: any;
  }
  export default class VirtualList extends Component<VirtualListProps> {}
}

declare module "react-inlinesvg" {
  import { Component, ReactNode } from "react";
  export interface InlineSVGProps {
    src: string;
    className?: string;
    style?: React.CSSProperties;
    uniquifyIDs?: boolean;
    onError?: (error: Error) => void;
    onLoad?: (src: string, isCached: boolean) => void;
    children?: ReactNode;
    [key: string]: any;
  }
  export default class InlineSVG extends Component<InlineSVGProps> {
    render(): ReactNode;
  }
}

interface Window {
  g_monaco: any;
  g_main?: any;
  needClearTab: boolean | undefined;
  timeService: any;
}

// 确保 ResizeObserver 类型可用
declare global {
  interface ResizeObserver {
    observe(target: Element): void;
    unobserve(target: Element): void;
    disconnect(): void;
  }

  const ResizeObserver: {
    new (callback: ResizeObserverCallback): ResizeObserver;
  };

  type ResizeObserverCallback = (
    entries: ResizeObserverEntry[],
    observer: ResizeObserver,
  ) => void;

  interface ResizeObserverEntry {
    readonly target: Element;
    readonly contentRect: DOMRectReadOnly;
    readonly borderBoxSize?: ReadonlyArray<ResizeObserverSize>;
    readonly contentBoxSize?: ReadonlyArray<ResizeObserverSize>;
    readonly devicePixelContentBoxSize?: ReadonlyArray<ResizeObserverSize>;
  }

  interface ResizeObserverSize {
    readonly inlineSize: number;
    readonly blockSize: number;
  }

  // 添加 import.meta.glob 的类型支持
  interface ImportMeta {
    glob(
      pattern: string,
      options?: {
        eager?: boolean;
        import?: string;
        query?: string | Record<string, string | string[]>;
        exhaustive?: boolean;
      },
    ): Record<string, any>;
  }
}
