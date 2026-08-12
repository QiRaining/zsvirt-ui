import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import { Injectable, Inject } from '@nestjs/common'
import dayjs from 'dayjs'

import { ActionService } from '@/base/action-service'
import { Logger } from '@/common/logger/logger.decorator'
import { ZSLoggerService } from '@/common/logger/logger.service'
import { WORKING_DIR } from '@/common/paths'
import { ManagementNodeService } from '@/zsphere-administration/management-node/management-node.service'

import { CertResetInput, GenNewPemInput, CertInfo, CertUploadInfoInput } from './cert-manage.model'
import * as utils from './utils/common'
import { Config } from './utils/config'
import { Nginx } from './utils/nginx'
import * as openssl from './utils/openssl'

interface HttpOption {
  protocol: 'http'
  redirect?: false
}

interface HttpsOption {
  protocol: 'https'
  redirect?: boolean
}

type ProtocolOption = HttpOption | HttpsOption

@Injectable()
export class CertManageService extends ActionService {
  @Logger(CertManageService.name) private log: ZSLoggerService
  @Inject() private managementNodeService: ManagementNodeService
  @Inject() private nginx: Nginx

  private workDir: string
  private defaultCertName: string
  private defaultCertPath: string
  private certPath: string
  private uploadTimePath: string

  constructor(private config: Config) {
    super()
    this.defaultCertName = 'ui.keystore.pem'
    this.workDir = WORKING_DIR
    this.defaultCertPath = path.join(this.workDir, this.defaultCertName)
    this.uploadTimePath = path.join(this.workDir, 'uploadTime')
    this.certPath = this.config.getCertPathSync(this.defaultCertPath)
  }

  reset(input: CertResetInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'https.certificate', async () => {
      const port = this.setProtocol({ protocol: 'http' })
      this.backupAndRemoveCert()
      return {
        id: actionId,
        inventory: { port }
      }
    })
    return { actionId }
  }

  private setProtocol({ protocol, redirect }: ProtocolOption) {
    const port = this.nginx.updateConfig({
      protocol,
      redirect,
      certPath: this.certPath
    })
    this.config.updateConfig({ protocol, port, redirect })
    this.config.updateUiState({ protocol, port })
    this.config.updateWebhookProtocol({ protocol, port })
    setTimeout(() => {
      this.nginx.restart()
    }, 500)
    return port
  }

  setThirdPartCert(input: CertUploadInfoInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'https.certificate', async () => {
      const { redirect, ...certInput } = input.payload
      const content = utils.ensureCertFormat(certInput)
      const tempCertPath = await openssl.verifyCert(content)
      this.installCert(tempCertPath)
      const port = this.setProtocol({ protocol: 'https', redirect })
      return {
        id: actionId,
        inventory: { port }
      }
    })
    return { actionId }
  }

  async getCertInfo(): Promise<CertInfo> {
    if (!this.config.isHttps()) {
      return { https: false }
    }
    const info = await openssl.parseCert(this.certPath)
    return { ...info, https: true, uploadTime: this.getUploadTime() }
  }

  getDefaultCertContent() {
    return fs.readFileSync(this.defaultCertPath, 'utf-8')
  }

  getCertPath() {
    return {
      isDefault: this.certPath === this.defaultCertPath,
      path: this.certPath
    }
  }

  private backupAndRemoveCert() {
    if (!fs.existsSync(this.defaultCertPath)) {
      return
    }
    utils.mvFile(
      this.defaultCertPath,
      path.join(
        this.workDir,
        `${this.defaultCertName}.old`,
        dayjs().format('YYYYMMDD-h:mm:ss.SSS')
      ),
      this.defaultCertName
    )
  }

  private installCert(tempCertPath: string) {
    this.backupAndRemoveCert()
    fs.copyFileSync(tempCertPath, this.defaultCertPath)
    fs.chmodSync(this.defaultCertPath, 0o600)
    fs.writeFileSync(this.uploadTimePath, `${utils.formatDate()}\n`)
    this.config.updateWebSshCert()
    if (this.certPath !== this.defaultCertPath) {
      this.certPath = this.defaultCertPath
      this.config.setCertPath(this.defaultCertPath)
    }
    try {
      fs.rmSync(path.dirname(tempCertPath), { recursive: true, force: true })
    } catch (err) {
      this.log.error(err)
    }
  }

  private getUploadTime() {
    try {
      return fs.readFileSync(this.uploadTimePath).toString().trim()
    } catch {
      return undefined
    }
  }

  private async createCert(
    option: {
      days?: number
      subject?: Partial<openssl.ISubject>
    } = {}
  ) {
    const { days = 3 * 365, subject = { CN: 'localhost', O: 'localhost' } } = option
    const { hostNameList: nodeIps } = await this.managementNodeService.getDoubleManagementNodeInfo()
    const tempCertPath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'zstack-ui-server-')),
      'cert.pem'
    )
    await openssl.generateCert({
      certPath: tempCertPath,
      days,
      subject,
      nodeIps
    })
    return tempCertPath
  }

  generateCert(input: GenNewPemInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'https.certificate', async () => {
      const { duration, redirect, ...subject } = input.payload
      const tempCertPath = await this.createCert({
        days: parseInt(duration),
        subject
      })
      this.installCert(tempCertPath)
      const port = this.setProtocol({ protocol: 'https', redirect })
      return {
        id: actionId,
        inventory: { port }
      }
    })
    return { actionId }
  }
}
