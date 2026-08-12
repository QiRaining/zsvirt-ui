import type { ApolloClientOptions } from "@apollo/client";
import {
  ApolloClient,
  ApolloLink,
  from,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { onError } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { bus } from "@zstack/zsphere-utils";
import { createClient } from "graphql-ws";
import { isEqual } from "lodash-es";

import { useLoginRedirectStore } from "../store/use-login-redirect-store";
import { isPublicPath } from "./isPublicPath";

const possibleTypes = {
  BasicEndPoint: [
    "AliyunSmsEndPoint",
    "DingTalkEndPoint",
    "EmailEndPoint",
    "FeiShuEndPoint",
    "HttpEndPoint",
    "MicrosoftTeamsEndPoint",
    "SmsEndPoint",
    "SnmpTrapEndPoint",
    "TemplateEndPoint",
    "UniversalSmsEndPoint",
    "WeComEndPoint",
  ],
  EndPoint: [
    "AliyunSmsEndPoint",
    "DingTalkEndPoint",
    "EmailEndPoint",
    "FeiShuEndPoint",
    "HttpEndPoint",
    "MicrosoftTeamsEndPoint",
    "SmsEndPoint",
    "SnmpTrapEndPoint",
    "UniversalSmsEndPoint",
    "WeComEndPoint",
  ],
  HybirdVirtualRouter: ["AliyunVirtualRouter", "HybridBorderRouter"],
  L3NetworkInNic: ["L3Network", "ProvisionNetwork"],
  OwnerQueryResp: ["AccountOwnerQueryResp", "ProjectOwnerQueryResp"],
};

const isDev = process.env.NODE_ENV === "development";

const uri =
  process.env.NODE_ENV === "test"
    ? "http://zstack.test:3100/graphql"
    : "/graphql";

if (isDev) {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

// Start the mocking conditionally.
// if (process.env.NODE_ENV === 'development') {
//   const { worker } = require('../mock/index.ts')
//   worker.start()
// }

const httpLink = new HttpLink({
  uri: (operation) => `${uri}?gql=${operation.operationName}`,
  fetch,
  headers: isDev
    ? {
        "schema-fix": "true", // headers 的 ts 类型为 Record<string, string>, 所以这里需要使用 string
      }
    : {},
});

/**
 * https://www.apollographql.com/docs/react/api/link/apollo-link-ws
 * 官方已经弃用 WebSocketLink 和 subscriptions-transport-ws library, 因为此库不再维护，需要使用 graphql-ws  */
const wsLink = new GraphQLWsLink(
  createClient({
    url:
      process.env.NODE_ENV === "test"
        ? `${
            window.location.protocol === "https:" ? "wss" : "ws"
          }://zstack.test:3100/graphql`
        : `${window.location.protocol === "https:" ? "wss" : "ws"}://${
            window.location.host
          }/graphql`,
    shouldRetry: () => true,
    retryAttempts: 5,
  }),
);

// zstac-50782，处理同一浏览器不同tab登录不同账号串session的问题
// 在用户登录之后，apollo拿到的肯定是当前用户的session，但是研究了一下发现没法直接读apollo对象里面的数据
// 所以这边搞了个额外的对象来存apollo的session
// 其实还有一种方案是登录后直接存到全局状态管理里面，
// 但是搜了一下代码发现设置localstorage里面sessionId的地方还蛮多，怕漏改，所以选了这种方法
export const apolloSession = {
  sessionId: localStorage.getItem("sessionId"),
};

const authMiddleware = new ApolloLink((operation, forward) => {
  apolloSession.sessionId = localStorage.getItem("sessionId");
  operation.setContext(({ headers = {} }) => ({
    headers: {
      "x-session-id": localStorage.getItem("sessionId") || null,
      ...headers,
    },
  }));
  return forward(operation);
});

const clearCacheMiddleware = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    const context = operation.getContext();
    const {
      response: { headers },
    } = context;
    const zsVersion = headers?.get("zs-version");
    // e2e测试的时候不需要清除localStorage
    const isE2ETest = localStorage.getItem("e2e_test_mode") === "true";
    if (
      zsVersion &&
      localStorage.getItem("zsVersion") !== zsVersion &&
      !isE2ETest
    ) {
      localStorage.clear();
      localStorage.setItem("zsVersion", zsVersion);
      sessionStorage.clear();
      window.location.reload();
    }
    return response;
  });
});

export const redirect = (forceLogout: boolean = false) => {
  if (!isPublicPath()) {
    const sessionTimeout = useLoginRedirectStore.getState().visible;
    if (window.location.pathname !== "login" && !sessionTimeout) {
      useLoginRedirectStore.setState({ visible: true, forceLogout });
    }
  }
};

const errorMiddleware = onError(
  ({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        try {
          if (/Invalid sessionId/.test(message)) {
            redirect();
            return;
          }
          const { code } = JSON.parse(message);
          switch (code) {
            case "ID.1001": {
              redirect();
              break;
            }
            case "LOGIN_CONTROL.1000": {
              bus.emit("PasswordExpired", "LOGIN_CONTROL.1000");
              break;
            }
            default:
              console.log(
                `[GraphQL error]: \n Message: ${message} \n Location: ${JSON.stringify(
                  locations,
                )}, Path: ${path}`,
              );
          }
        } catch {
          if (isDev) {
            const actionId = operation?.variables?.input?.action?.actionId;

            if (actionId) {
              bus.emit("GraphQLError", actionId, message);
            }
          }

          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
              locations,
            )}, Path: ${path}`,
          );
        }
      });
    }
    // graphQLErrors = []
    if (networkError) {
      console.log(`[Network error]: ${JSON.stringify(networkError)}`);
      // networkError = undefined
    }
  },
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  from([errorMiddleware, authMiddleware, clearCacheMiddleware, httpLink]),
);

const mergePolicy =
  (mergeBy: "self" | string = "self") =>
  (existing: any[], incoming: any[]) => {
    const mapCallback = (it: any) => (mergeBy === "self" ? it : it?.[mergeBy]);
    const oldValue = existing?.map(mapCallback).sort();
    const newValue = incoming?.map(mapCallback).sort();
    if (isEqual(oldValue, newValue)) {
      return existing;
    }
    return incoming;
  };

const apollo = new ApolloClient({
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      fetchPolicy: "network-only",
      /**
       * apolloCache,当手动修改缓存时,会根据缓存策略refresh所有字段
       * 而当默认策略为network-only或者cache-and-network时就会重新触发一个请求更新缓存
       * 这可能会使手动更新缓存失败(例如,手动更改state为Stopping,但是如果请求来的数据可能还是Running,缓存就会又被覆盖了)
       * 而且还会触发一次无意义的请求
       * @see https://github.com/apollographql/apollo-client/issues/6833
       * @see https://github.com/apollographql/apollo-client/issues/7105
       */
      nextFetchPolicy(lastFetchPolicy) {
        // 不会影响refetch和query
        if (lastFetchPolicy === "network-only") {
          return "cache-first";
        }
        return lastFetchPolicy;
      },
    },
    query: {
      fetchPolicy: "network-only",
    },
  },
  cache: new InMemoryCache({
    possibleTypes,
    typePolicies: {
      // 不刷新缓存的指定类型
      None: {
        keyFields: ["uuid"],
      },
      TelemetryConsentInventory: {
        keyFields: ["uuid"],
      },
      VmInstance: {
        keyFields: ["uuid"],
        fields: {
          vmNics: {
            merge: mergePolicy("uuid"),
          },
        },
      },
      VmNic: {
        keyFields: ["uuid"],
        fields: {
          usedIps: {
            merge: mergePolicy("uuid"),
          },
        },
      },
      Volume: {
        keyFields: ["uuid"],
      },
      Image: {
        keyFields: ["uuid"],
      },
      IAM2Project: {
        keyFields: ["uuid"],
      },
      BackupStorage: {
        keyFields: ["uuid"],
      },
      HostVO: {
        keyFields: ["uuid"],
      },
      PortMirror: {
        keyFields: ["uuid"],
      },
      PrimaryStorageVO: {
        keyFields: ["uuid"],
      },
      SdnController: {
        keyFields: ["uuid"],
      },
      SchedulerJobGroup: {
        keyFields: ["uuid"],
      },
      ResourceConfigInPage: {
        keyFields: ["uuid"],
      },
      TemplateConfig: {
        keyFields: ["uuid"],
      },
      SlbOffering: {
        keyFields: ["uuid"],
      },
      AutoScalingGroup: {
        keyFields: ["uuid"],
      },
      BareMetal2Instance: {
        keyFields: ["uuid"],
      },
      PortMirrorSession: {
        keyFields: ["uuid"],
      },
      PciDeviceSpec: {
        keyFields: ["uuid"],
      },
      VGpuDeviceSpec: {
        keyFields: ["uuid"],
      },
      PortForwarding: {
        keyFields: ["uuid"],
      },
      DirectoryGroup: {
        keyFields: ["uuid"],
      },
      SharedBlock: {
        keyFields: ["uuid"],
      },
      Zone: {
        keyFields: ["uuid"],
      },
      CdRom: {
        keyFields: ["uuid"],
      },
      SchedulerJob: {
        keyFields: ["uuid"],
      },
      SshKeyPair: {
        keyFields: ["uuid"],
      },
      ThirdpartyPlatform: {
        keyFields: ["uuid"],
      },
      CdpTask: {
        keyFields: ["uuid"],
      },
      SchedulerTrigger: {
        keyFields: ["uuid"],
        fields: {
          jobsUuid: {
            merge: mergePolicy("uuid"),
          },
        },
      },
      GlobalConfig: {
        keyFields: ["uuid"],
      },
      VirtualRouterOffering: {
        keyFields: ["uuid"],
      },
      Netflow: {
        keyFields: ["uuid"],
      },
      L3Network: {
        keyFields: ["uuid"],
        fields: {
          ipRanges: {
            merge: mergePolicy("uuid"),
          },
        },
      },
      NetflowCollector: {
        keyFields: ["uuid"],
      },
      CephPrimaryStoragePool: {
        keyFields: ["uuid"],
      },
      SecurityGroup: {
        keyFields: ["uuid"],
      },
      AffinityGroup: {
        keyFields: ["uuid"],
      },
      InstanceOffering: {
        keyFields: ["uuid"],
      },
      VxlanPool: {
        keyFields: ["uuid"],
      },
      VniRange: {
        keyFields: ["uuid"],
      },
      Vtep: {
        keyFields: ["uuid"],
      },
      CephMon: {
        keyFields: ["uuid"],
      },
      IAM2ProjectTemplate: {
        keyFields: ["uuid"],
      },
      DiskOffering: {
        keyFields: ["uuid"],
      },
      Cluster: {
        keyFields: ["uuid"],
      },
      PciDevice: {
        keyFields: ["uuid"],
      },
      ConsoleProxyAgent: {
        keyFields: ["uuid"],
      },
      AccessKey: {
        keyFields: ["uuid"],
      },
      VpcVRouter: {
        keyFields: ["uuid"],
      },
      VpcHaGroup: {
        keyFields: ["uuid"],
        fields: {
          vrRefs: {
            merge: mergePolicy("uuid"),
          },
          services: {
            merge: mergePolicy("id"),
          },
        },
      },
      ClusterDRS: {
        keyFields: ["uuid"],
      },
      VolumeSnapshot: {
        keyFields: ["uuid"],
      },
      RecoveryTask: {
        keyFields: ["uuid"],
      },
      VolumeSnapshotGroup: {
        keyFields: ["uuid"],
      },
      DRSAdvice: {
        keyFields: ["uuid"],
      },
      IscsiServer: {
        keyFields: ["uuid"],
      },
      FiberChannelStorage: {
        keyFields: ["uuid"],
      },
      ScsiLun: {
        keyFields: ["uuid"],
      },
      VipNetwork: {
        keyFields: ["uuid"],
      },
      VipNetworkQos: {
        keyFields: ["uuid"],
      },
      Eip: {
        keyFields: ["uuid"],
      },
      L2Network: {
        keyFields: ["uuid"],
        fields: {
          attachedClusterUuids: {
            merge: mergePolicy("self"),
          },
        },
      },
      VRouterRouteTable: {
        keyFields: ["uuid"],
      },
      VRouterRouteEntry: {
        keyFields: ["uuid"],
      },
      IPsecConnection: {
        keyFields: ["uuid"],
      },
      HybridKeySecret: {
        keyFields: ["uuid"],
      },
      Role: {
        keyFields: ["uuid"],
      },
      UsbDevice: {
        keyFields: ["uuid"],
      },
      FireWallRuleTemplate: {
        keyFields: ["uuid"],
      },
      FireWallIpSetTemplate: {
        keyFields: ["uuid"],
      },
      FirewallRuleSet: {
        keyFields: ["uuid"],
      },
      FirewallRule: {
        keyFields: ["uuid"],
      },
      FirewallRelateNetwork: {
        keyFields: ["id"],
      },
      FireWall: {
        keyFields: ["uuid"],
      },
      OSPF: {
        keyFields: ["uuid"],
      },
      ZWatchAlarmVO: {
        keyFields: ["uuid"],
      },
      IAM2OrganizationVO: {
        keyFields: ["uuid"],
      },
      IAM2VirtualIDVO: {
        keyFields: ["uuid"],
      },
      VirtualGroup: {
        keyFields: ["uuid"],
      },
      BaremetalPxeServer: {
        keyFields: ["uuid"],
      },
      BaremetalChassis: {
        keyFields: ["uuid"],
      },
      BaremetalInstance: {
        keyFields: ["uuid"],
      },
      ResourceStack: {
        keyFields: ["uuid"],
      },
      BillingsPriceTable: {
        keyFields: ["uuid"],
      },
      EndPoint: {
        keyFields: ["uuid"],
      },
      BasicEndPoint: {
        keyFields: ["uuid"],
      },
      EndPointEmailAddress: {
        keyFields: ["uuid"],
      },
      TicketProcess: {
        keyFields: ["uuid"],
      },
      Ticket: {
        keyFields: ["uuid"],
      },
      ThirdPartyAuthVO: {
        keyFields: ["uuid"],
      },
      OneClickAlarm: {
        keyFields: ["uuid"],
      },
      MonitorGroup: {
        keyFields: ["uuid"],
      },
      GroupAction: {
        keyFields: ["actionUuid"],
      },
      AlarmHistories: {
        keyFields: ["uuid"],
      },
      MetricRuleTemplate: {
        keyFields: ["uuid"],
      },
      EventRuleTemplate: {
        keyFields: ["uuid"],
      },
      LoadBalancer: {
        keyFields: ["uuid"],
      },
      Listener: {
        keyFields: ["uuid"],
      },
      Certificate: {
        keyFields: ["uuid"],
      },
      ApplicationCenter: {
        keyFields: ["uuid"],
      },
      BareMetal2Gateway: {
        keyFields: ["uuid"],
      },
      BareMetalNode: {
        keyFields: ["uuid"],
      },
      BaremetalChassisDisk: {
        keyFields: ["uuid"],
      },
      ServerGroup: {
        keyFields: ["uuid"],
      },
      SlbGroup: {
        keyFields: ["uuid"],
      },
      V2VMigration: {
        keyFields: ["uuid"],
      },
      V2VConversionHost: {
        keyFields: ["uuid"],
      },
      RemoteBackupStorage: {
        keyFields: ["uuid"],
      },
      LocalBackupStorage: {
        keyFields: ["uuid"],
      },
      EmailServerSetting: {
        keyFields: ["uuid"],
      },
      LogServer: {
        keyFields: ["uuid"],
      },
      VrRef: {
        keyFields: ["uuid"],
      },
      Tag: {
        keyFields: ["uuid"],
      },
      SNSTextTemplate: {
        keyFields: ["uuid"],
      },
      LicenseInfo: {
        keyFields: ["uuid"],
      },
      UsedIp: {
        keyFields: ["uuid"],
      },
      EcsSecurityGroup: {
        keyFields: ["uuid"],
      },
      EcsSecurityGroupRule: {
        keyFields: ["uuid"],
      },
      StackTemplate: {
        keyFields: ["uuid"],
      },
      MonitorTemplate: {
        keyFields: ["uuid"],
      },
      EcsVpc: {
        keyFields: ["uuid"],
      },
      EcsVSwitch: {
        keyFields: ["uuid"],
      },
      AliyunVirtualRouter: {
        keyFields: ["uuid"],
      },
      IdentityZone: {
        keyFields: ["uuid"],
      },
      HybridBorderRouter: {
        keyFields: ["uuid"],
      },
      HybridRouterInterface: {
        keyFields: ["uuid"],
      },
      HybridKeySecrets: {
        keyFields: ["uuid"],
      },
      HybridDataCenter: {
        keyFields: ["uuid"],
      },
      HybridBucket: {
        keyFields: ["uuid"],
      },
      VpcUserVpnGateway: {
        keyFields: ["uuid"],
      },
      VpcVpnGateway: {
        keyFields: ["uuid"],
      },
      VpcVpnConnection: {
        keyFields: ["uuid"],
      },
      EcsInstance: {
        keyFields: ["uuid"],
      },
      Disk: {
        keyFields: ["uuid"],
      },
      PreconfigurationTemplate: {
        keyFields: ["uuid"],
      },
      SecretResourcePool: {
        keyFields: ["uuid"],
      },
      SecurityMachine: {
        keyFields: ["uuid"],
      },
      LogCollect: {
        keyFields: ["uuid"],
      },
      VmGroup: {
        keyFields: ["uuid"],
        fields: {
          associatedVmSchedulingRuleList: {
            merge: mergePolicy("uuid"),
          },
        },
      },
      HostGroup: {
        keyFields: ["uuid"],
        fields: {
          associatedVmSchedulingRuleList: {
            merge: mergePolicy("uuid"),
          },
        },
      },
      VmSchedulingRule: {
        keyFields: ["uuid"],
      },
      NvmeTarget: {
        keyFields: ["uuid"],
      },
      NVMeLun: {
        keyFields: ["uuid"],
      },
      PhysicalNetworkBond: {
        keyFields: ["uuid"],
      },
      PhysicalNetworkInterface: {
        keyFields: ["uuid"],
      },
      SystemSchedulingTask: {
        keyFields: ["uuid"],
      },
      SchedulerJobForVmAndVolume: {
        keyFields: ["uuid"],
      },
      BlockVolume: {
        keyFields: ["uuid"],
      },
      BlockSnapshot: {
        keyFields: ["uuid"],
      },
      SnmpTrap: {
        keyFields: ["uuid"],
      },
      SnmpAgent: {
        keyFields: ["uuid"],
      },
      OperationLog: {
        keyFields: ["actionId"],
      },
      HostKernelInterface: {
        keyFields: ["uuid"],
      },
      SNSDingTalkAtPerson: {
        keyFields: ["uuid"],
      },
      SNSWeComAtPerson: {
        keyFields: ["uuid"],
      },
      SNSFeiShuAtPerson: {
        keyFields: ["uuid"],
      },
      VmTemplate: {
        keyFields: ["uuid"],
      },
      FreeHardDisk: {
        keyFields: ["uuid"],
      },
      CandidateSharedBlock: {
        keyFields: ["uuid"],
      },
      ZSVBackupStorage: {
        keyFields: ["uuid"],
      },
      BackupData: {
        keyFields: ["uuid"],
      },
      UserGroup: {
        keyFields: ["uuid"],
      },
      NvmeServer: {
        keyFields: ["uuid"],
      },
      ResourceAttributeConstraint: {
        keyFields: ["id"],
      },
      ResourceAttributeKey: {
        keyFields: ["uuid"],
      },
      ConfigFile: {
        keyFields: ["uuid"],
      },
    },
  }),
  link: splitLink,
  queryDeduplication: true, // 启用查询去重以优化性能
  assumeImmutableResults: true, // 假设结果是不可变的，可以提高性能
  name: "zstack-ui-client",
  version: "3.11.8",
  devtools: {
    enabled: process.env.NODE_ENV === "development",
  },
} as ApolloClientOptions<any>);

window.g_main = {
  apolloClient: apollo,
};

/**
 * 定时清理 Apollo InMemoryCache 中不可达的对象
 * InMemoryCache 只在 resetStore (logout) 时清理，导致长会话内存持续增长
 * cache.gc() 会清理所有不再被任何活跃 query 引用的规范化对象
 */
const CACHE_GC_INTERVAL = 5 * 60 * 1000; // 5 分钟
setInterval(() => {
  apollo.cache.gc();
}, CACHE_GC_INTERVAL);

export default apollo;
