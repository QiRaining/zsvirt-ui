import { execSync } from 'child_process'
import * as fs from 'fs'

import { HttpService } from '@nestjs/axios'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { Logger } from '@/common/logger/logger.decorator'
import { ZSLoggerService } from '@/common/logger/logger.service'

import { exec } from './common'

export interface IConfig {
  port: number
  protocol: 'http' | 'https'
  redirect: boolean
}

export interface IWebhookConfig {
  protocol: 'http' | 'https'
  port: number
}

@Injectable()
export class Config {
  HTTP_STATE_FILE = '/var/run/zstack/zstack-ui.http'
  PORT_STATE_FILE = '/var/run/zstack/zstack-ui.port'

  @Inject() httpService: HttpService
  @Inject() configService: ConfigService
  @Logger(Config.name) private logger: ZSLoggerService

  isHttps() {
    try {
      return fs.readFileSync(this.HTTP_STATE_FILE).toString().trim() === 'https'
    } catch {
      return false
    }
  }

  getPort() {
    try {
      return Number(fs.readFileSync(this.PORT_STATE_FILE).toString().trim())
    } catch {
      return undefined
    }
  }

  updateUiState({ port, protocol }: Omit<IConfig, 'redirect'>) {
    exec(`sudo bash -c "\
      echo '${protocol}' > '${this.HTTP_STATE_FILE}' && \
      echo '${port}' > '${this.PORT_STATE_FILE}' \
    "`).catch(e => this.logger.error(e))
  }

  updateConfig({ protocol, port, redirect }: Partial<IConfig>) {
    let sslConfig = ''
    if (protocol !== undefined) {
      sslConfig = `'--enable-ssl=${protocol === 'https'}'`
    }
    let portConfig = ''
    if (port !== undefined) {
      portConfig = `'--server-port=${port}'`
    }
    let redirectConfig = ''
    if (redirect !== undefined) {
      redirectConfig = `'--http_redirect=${redirect}'`
    }
    const params = `${sslConfig} ${portConfig} ${redirectConfig}`
    if (params.trim()) {
      exec(`sudo zstack-ctl config_ui ${params}`).catch(e => this.logger.error(e))
    }
  }

  setCertPath(certPath: string) {
    exec(`sudo zstack-ctl configure 'consoleProxyCertFile=${certPath}'`).catch(e =>
      this.logger.error(e)
    )
  }

  getCertPathSync(defaultCertPath = '') {
    try {
      return execSync('sudo zstack-ctl get_configuration consoleProxyCertFile').toString().trim()
    } catch {
      return defaultCertPath
    }
  }

  updateWebSshCert() {
    exec('sudo zops update-webssh-cert').catch(e => this.logger.error(e))
  }

  async updateWebhookProtocol({ protocol, port }: IWebhookConfig) {
    let vip = ''
    try {
      vip = (await exec('sudo zstack-ctl get_configuration management.server.vip')).stdout.trim()
    } catch {
      vip = ''
    }
    const webhookIp = vip || 'localhost'
    const webhook = `${protocol}://${webhookIp}:${port}/webhook/zwatch`
    const mnServer = this.configService.get<string>('ZS_MN_SERVER')
    try {
      await this.httpService
        .post(
          `${mnServer}/zstack/asyncrest/sendcommand`,
          { systemTopicHttpEndpointURL: webhook },
          { headers: { commandpath: '/sns/globalpropertyupdated' } }
        )
        .toPromise()
    } catch (e) {
      this.logger.error(e)
    } finally {
      exec(`sudo zstack-ctl configure 'sns.systemTopic.endpoints.http.url=${webhook}'`).catch(e =>
        this.logger.error(e)
      )
    }
  }
}
