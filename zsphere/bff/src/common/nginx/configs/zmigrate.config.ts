import { NginxProxyConfig } from '../types'

const gzipConfig = `    gzip on;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_vary on;
    gzip_types text/css application/json application/javascript text/javascript image/svg+xml;`

export const zmigrateProxyConfig: NginxProxyConfig = {
  serviceId: 'zmigrate',
  serverConfigFileName: 'zmigrate.server.nginx.conf',
  upstreamConfigFileName: 'zmigrate.upstream.nginx.conf',
  upstreamName: 'proxy_zmigrate_server',
  defaultPort: 15300,
  serverTemplate: `
# qiankun entry: 加载 zmigrate 微应用的 HTML 入口
# zsv 通过 loadMicroApp({ entry: "/zmigrate-ui/" }) 加载
# /zmigrate-ui/ → zmigrate nginx root（返回 index.html）
location ^~ /zmigrate-ui/ {
${gzipConfig}
    proxy_pass http://proxy_zmigrate_server/;
    proxy_hide_header Cache-Control;
    proxy_hide_header Expires;
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    add_header Pragma "no-cache" always;
}

# Module Federation 元数据必须每次重新验证，避免宿主拿到旧资源图。
location = /zmigrate-core-shell/mf-manifest.json {
${gzipConfig}
    proxy_pass http://proxy_zmigrate_server;
    proxy_hide_header Cache-Control;
    proxy_hide_header Expires;
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    add_header Pragma "no-cache" always;
}

# 静态资源: zmigrate-core-shell 的 JS/CSS/HTML
# 构建产物 assetPrefix="/zmigrate-core-shell/"，HTML 中引用如:
#   <script src="/zmigrate-core-shell/index.xxx.js">
#   mf-manifest.json publicPath: "/zmigrate-core-shell/"
location ^~ /zmigrate-core-shell/ {
${gzipConfig}
    proxy_pass http://proxy_zmigrate_server/zmigrate-core-shell/;
    proxy_hide_header Cache-Control;
    proxy_hide_header Expires;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
}

# Module Federation 元数据必须每次重新验证，避免加载已下线的旧 chunk。
location = /zmigrate-app/mf-manifest.json {
${gzipConfig}
    proxy_pass http://proxy_zmigrate_server;
    proxy_hide_header Cache-Control;
    proxy_hide_header Expires;
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    add_header Pragma "no-cache" always;
}

# 静态资源: zmigrate-app 子应用的 JS/CSS
# Module Federation remote 入口: /zmigrate-app/mf-manifest.json
location ^~ /zmigrate-app/ {
${gzipConfig}
    proxy_pass http://proxy_zmigrate_server/zmigrate-app/;
    proxy_hide_header Cache-Control;
    proxy_hide_header Expires;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
}

# API 代理: zmigrate 嵌入 zsv 时的 GraphQL 和 REST 请求
# apollo.ts: uri = "/zmigrate-api/graphql"
# use-master-zmigrate-config.ts: POST "/zmigrate-api/api/runtime-config"
# 去掉 /zmigrate-api 前缀后转发到 zmigrate nginx
location ^~ /zmigrate-api/ {
    proxy_pass http://proxy_zmigrate_server/;
}`
}
