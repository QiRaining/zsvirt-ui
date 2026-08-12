/**
 * Nginx 代理配置接口
 * 每个第三方服务（zstone/zcex/zmigrate）注册一份静态配置
 */
export interface NginxProxyConfig {
  /** 唯一标识: "zstone" | "zcex" | "zmigrate" */
  serviceId: string
  /** server 配置文件名，如 "zstone.server.nginx.conf" */
  serverConfigFileName: string
  /** upstream 配置文件名，如 "zstone.upstream.nginx.conf" */
  upstreamConfigFileName: string
  /** upstream 名称，如 "proxy_zstone_server" */
  upstreamName: string
  /** 默认端口（当调用方未传端口时使用） */
  defaultPort: number
  /** location block 模板 */
  serverTemplate: string
}

/**
 * 设置代理时传入的参数
 */
export interface NginxProxySetupParams {
  /** 服务标识，对应 NginxProxyConfig.serviceId */
  serviceId: string
  /** 管理节点 IP */
  managementIp: string
  /** 覆盖默认端口 */
  port?: number
}
