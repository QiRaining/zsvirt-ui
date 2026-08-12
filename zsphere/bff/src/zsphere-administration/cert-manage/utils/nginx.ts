import * as fs from 'fs'
import * as path from 'path'

import { Injectable, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { Logger } from '@/common/logger/logger.decorator'
import { ZSLoggerService } from '@/common/logger/logger.service'
import { WORKING_DIR } from '@/common/paths'

import { Config } from './config'
import * as systemctl from './systemctl'

const downloadHelper = /* html */ `\
<!DOCTYPE html>
<html>
<body>
<script>
(function () {
  "use strict";
  const search = new URLSearchParams(window.location.search);
  const url = search.get("url");
  if (!url) {
    window.close();
  } else {
    const link = document.createElement("a");
    link.href = url;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => { window.close(); }, 300);
  }
})();
</script>
</body>
</head>
</html>
`

interface IServerConfig {
  port: number
  ssl: boolean
  certPath: string
}

interface IRedirectOptions {
  listenPort: number
  redirectPort: number
}

export interface ServerOption {
  protocol: 'http' | 'https'
  certPath: string
  redirect?: boolean
}

@Injectable()
export class Nginx {
  @Inject() config: Config
  @Logger(Nginx.name) private logger: ZSLoggerService

  private serverConf: string
  private redirectConf: string
  private version: string

  constructor(configService: ConfigService) {
    const configDir = path.join(WORKING_DIR, 'configs')
    this.serverConf = path.join(configDir, 'extend.server.nginx.conf')
    this.redirectConf = path.join(configDir, 'redirect.http.nginx.conf')
    this.version = configService.get<string>('ZS_VERSION')
  }

  private getPort(isHttps: boolean) {
    if (!isHttps) {
      return 80
    } else if (this.config.isHttps()) {
      return this.config.getPort() || 443
    }
    return 443
  }

  private writeServerConfig({ port, ssl, certPath }: IServerConfig) {
    const listenConfig = ssl ? ' ssl' : ''
    const certConfig = ssl ? `ssl_certificate ${certPath};\nssl_certificate_key ${certPath};` : ''

    fs.writeFileSync(
      this.serverConf,
      `\
listen ${port}${listenConfig};
server_name localhost;
proxy_set_header Upgrade $http_upgrade;
ssl_protocols       TLSv1.2 TLSv1.3;
add_header zs-version ${this.version};
${certConfig}
location /download-helper {
  return 302 http://$host$request_uri;
}
`
    )
  }

  private addRedirect({ listenPort, redirectPort }: IRedirectOptions) {
    const urlPort = redirectPort === 443 ? '' : `:${redirectPort}`
    fs.writeFileSync(
      this.redirectConf,
      `\
server {
  listen ${listenPort} default_server;
  server_name localhost;
  location / {
    return 302 https://$host${urlPort}$request_uri;
  }
  location /download-helper {
    add_header Content-Type 'text/html';
    return 200 '${downloadHelper}';
  }
}
`
    )
  }

  private removeRedirect(isHttps: boolean) {
    if (isHttps) {
      fs.writeFileSync(
        this.redirectConf,
        `\
server {
  listen 80 default_server;
  server_name localhost;
  location / {
    return 404 '';
  }
  location /download-helper {
    add_header Content-Type 'text/html';
    return 200 '${downloadHelper}';
  }
}
`
      )
    } else {
      fs.writeFileSync(this.redirectConf, '')
    }
  }

  updateConfig({ protocol, certPath, redirect }: ServerOption) {
    const isHttps = protocol === 'https'
    const port = this.getPort(isHttps)

    this.writeServerConfig({
      ssl: isHttps,
      port,
      certPath
    })

    if (redirect && isHttps) {
      this.addRedirect({ listenPort: 80, redirectPort: port })
    } else {
      this.removeRedirect(isHttps)
    }

    return port
  }

  restart() {
    systemctl.restart('zstack-ui-nginx').catch(e => this.logger.error(e))
  }

  reload() {
    systemctl.reload('zstack-ui-nginx').catch(e => this.logger.error(e))
  }
}
