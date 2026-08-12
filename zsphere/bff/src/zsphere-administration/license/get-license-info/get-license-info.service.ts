import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { Injectable } from '@nestjs/common'

import { PUBLIC_DIR } from '@/common/paths'

import { createOpenSourceCommunityLicenseInfo } from '../community-license'

@Injectable()
export class GetLicenseInfoService {
  getLicenseInfo() {
    return createOpenSourceCommunityLicenseInfo()
  }

  getCustomizedLicenseNameInfo() {
    // 读取json文件获取license名字中英文
    const licenseNameConfigPath = resolve(PUBLIC_DIR, 'custom-config/license-name-config.json')
    let info = ''
    try {
      const data = readFileSync(licenseNameConfigPath, 'utf8')
      if (data && JSON.parse(data) && typeof JSON.parse(data) === 'object') {
        info = data
      }
    } catch {
      // 文件不存在或格式错误时返回空字符串，该配置为可选项
    }
    return info
  }
}
