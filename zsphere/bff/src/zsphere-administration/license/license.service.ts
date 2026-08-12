import { Inject, Injectable } from '@nestjs/common'

import { GetVersionAction } from '@/api/zstack/GetVersionAction'
import { execCommand } from '@/utils'

import {
  createOpenSourceCommunityLicenseInfo,
  createOpenSourceLicenseExtensionInfo
} from './community-license'

interface TimedCacheEntry<T> {
  expiresAt: number
  pending?: Promise<T>
  value?: T
}

const ABOUT_LICENSE_INFO_CACHE_TTL_MS = 2 * 1000
const VERSION_BY_ZSTACK_CTL_CACHE_TTL_MS = 5 * 60 * 1000

@Injectable()
export class LicenseService {
  private static aboutLicenseInfoCache?: TimedCacheEntry<any>
  private static versionByZStackCTLCache?: TimedCacheEntry<string>

  static clearAboutLicenseInfoCache() {
    LicenseService.aboutLicenseInfoCache = undefined
  }

  static clearVersionByZStackCTLCache() {
    LicenseService.versionByZStackCTLCache = undefined
  }

  @Inject()
  getVersionAction: GetVersionAction

  async getVersion() {
    return await this.getVersionAction.call({})
  }

  // 用ctl命令可以兼容全产品线，，后续需要修改
  // 时间：2023/9/19
  getVersionByZStackCTL(): Promise<string> {
    const cached = LicenseService.versionByZStackCTLCache
    const now = Date.now()

    if (cached?.value && cached.expiresAt > now) {
      return Promise.resolve(cached.value)
    }

    if (cached?.pending) {
      return cached.pending
    }

    const pending = this.loadVersionByZStackCTL().then(value => {
      LicenseService.versionByZStackCTLCache = {
        value,
        expiresAt: Date.now() + VERSION_BY_ZSTACK_CTL_CACHE_TTL_MS
      }

      return value
    })

    LicenseService.versionByZStackCTLCache = {
      pending,
      expiresAt: 0
    }

    return pending
  }

  private async loadVersionByZStackCTL() {
    try {
      const { stdout } = await execCommand('sudo zstack-ctl get_version -a')
      const match = stdout.trim().match(/\d+\.\d+\.\d+/)
      return match ? match[0] : '4.0.0'
    } catch {
      return '4.0.0'
    }
  }

  //用于日志收集
  async getVersionByLogCollect() {
    try {
      const { stdout } = await execCommand('sudo zstack-ctl get_version -a')
      return stdout.trim().replace(/ /g, '-')
    } catch {
      return 'ZSphere'
    }
  }

  async getLicenseInfo() {
    const [{ version }, versionOnUI] = await Promise.all([
      this.getVersionAction.call({}),
      this.getVersionByZStackCTL()
    ])

    return createOpenSourceCommunityLicenseInfo({
      version,
      versionOnUI
    })
  }

  /**
   * 开源版固定返回社区版授权信息，不再查询或联查平台 license。
   */
  getAboutLicenseInfo(): Promise<any> {
    const cached = LicenseService.aboutLicenseInfoCache
    const now = Date.now()

    if (cached?.value && cached.expiresAt > now) {
      return Promise.resolve(cached.value)
    }

    if (cached?.pending) {
      return cached.pending
    }

    const pending = this.loadAboutLicenseInfo()
      .then(value => {
        LicenseService.aboutLicenseInfoCache = {
          value,
          expiresAt: Date.now() + ABOUT_LICENSE_INFO_CACHE_TTL_MS
        }

        return value
      })
      .catch(error => {
        if (LicenseService.aboutLicenseInfoCache?.pending === pending) {
          LicenseService.aboutLicenseInfoCache = undefined
        }

        throw error
      })

    LicenseService.aboutLicenseInfoCache = {
      pending,
      expiresAt: 0
    }

    return pending
  }

  private async loadAboutLicenseInfo() {
    const [{ version }, versionOnUI] = await Promise.all([
      this.getVersionAction.call({}),
      this.getVersionByZStackCTL()
    ])

    return createOpenSourceCommunityLicenseInfo({
      version,
      versionOnUI
    })
  }

  /**
   * 开源版没有 AddOn 和双管理节点授权扩展信息，保持原 about 页面数据结构。
   */
  getAboutLicenseExtensionInfo() {
    return createOpenSourceLicenseExtensionInfo()
  }

  getLicenseRecordsList(_args) {
    return { list: [], total: 0 }
  }
  judgeLicenseTypeEqualToCluster() {
    return false
  }

  getModuleAuthorizationDetailsList(_args: any) {
    return { list: [], total: 0 }
  }

  getPointsDetailsList(_args: any) {
    return { list: [], total: 0 }
  }
}
