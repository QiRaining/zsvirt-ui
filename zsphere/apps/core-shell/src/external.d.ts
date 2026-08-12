declare module "*.less";
declare module "*.svg";
declare module "*.png";
declare module "*.gql";
declare module "intl";
declare module "core-js";
declare module "value-equal";
declare module "whatwg-fetch";
declare module "regenerator-runtime/runtime";
declare module "object.fromentries";
declare module "object.entries";
declare module "@skillnull/device-js";
declare module "react-countdown-hook" {
  interface Actions {
    start(ttc?: number): void;
    pause(): void;
    resume(): void;
    reset(): void;
  }

  interface UseCountDown {
    (timeToCount: number, interval?: number): [number, Actions];
  }

  const useCountDown: UseCountDown;

  export default useCountDown;
}

interface Window {
  g_main: {
    localeInfo?: any;
    localeEvent?: any;
    LANG_CHANGE_EVENT?: any;
    apolloClient?: any;
  };
  g_lodash: any;
  g_react: any;
  g_react_dom: any;
  g_antd: any;
  g_bizcharts: any;
  g_react_router: any;
  g_react_router_dom: any;
  g_url: any;
  g_uuid: any;
  g_umi: any;
  g_corejs: any;
  g_value_equal: any;
  g_whatwg_fetch: any;
  g_runtime: any;
  g_numeral: any;
  g_resize_observer_polyfill: any;
  g_assert: any;
  g_prop_types: any;
  g_apollo_client: any;
  g_react_intl: any;
  g_ahooks: any;
  g_immer: any;
  g_editor: any;
  g_zstack_types: any;
  g_zstack_utils: any;
  g_zstack_components: any;
  g_zstack_hooks: any;
  g_antd_zh_cn: any;
  g_action_subscribe: any;
  g_worker: any;
  g_plugin_i18n: any;
  g_zstack_config: any;
  g_zstack_business_component: any;
  g_zstack_single_spa: any;
  __REACT_ERROR_OVERLAY_GLOBAL_HOOK__?: any;
  g_single_spa: any;
}

interface Location {
  query: any;
  valueOf(): object;
  setPrototypeOf(o: any, proto: object | null): any;
}

interface LocationDescriptorObject {
  query: object;
}

interface ResponsiveInfo {
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
}

declare module "*.svg?react" {
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

// zsv-baremetal MF remote modules
declare module "zsv_baremetal/baremetal-cluster/detail" {
  const Component: React.ComponentType<any>;
  export default Component;
}
declare module "zsv_baremetal/baremetal-chassis/detail" {
  const Component: React.ComponentType<any>;
  export default Component;
}
declare module "zsv_baremetal/baremetal-instance/detail" {
  const Component: React.ComponentType<any>;
  export default Component;
}
declare module "zsv_baremetal/baremetal-pre-config-template/detail" {
  const Component: React.ComponentType<any>;
  export default Component;
}
declare module "zsv_baremetal/baremetal-pxe-server/detail" {
  const Component: React.ComponentType<any>;
  export default Component;
}
