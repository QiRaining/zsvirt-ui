import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { execCommand } from '@/utils'

@Injectable()
export class UIEnvService {
  @Inject() private configService: ConfigService

  async isBootstrap() {
    let result: boolean
    try {
      const { stdout } = await execCommand('bootstrap is_deployed')
      result = JSON.parse(stdout)
    } catch (e) {
      try {
        // 兼容2.0.0之前的版本
        await execCommand('ls /usr/local/hyperconverged/conf/host_info.json')
        result = true
      } catch (err) {
        result = false
      }
    }
    return {
      isBootstrap: result
    }
  }

  //后续有通过 config_ui 控制 直接写到这
  async getUIEnv() {
    const isOpenPlatform = await this.isOpenPlatform()
    return {
      isOpenPlatform
    }
  }

  async isOpenPlatform() {
    return this.configService.get<string>('OPEN_PLATFORM') === 'true'
  }
}
