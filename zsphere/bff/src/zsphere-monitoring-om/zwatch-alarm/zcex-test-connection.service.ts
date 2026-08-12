import { Inject, Injectable } from '@nestjs/common'

import { ZceXTestConnectionAction } from '@/api/zstack/ZceXTestConnectionAction'

import { ZceXTestConnectionActionParamArgs } from './zcex-test-connection.model'

@Injectable()
export class ZceXTestConnectionService {
  @Inject() private readonly zceXTestConnectionAction: ZceXTestConnectionAction

  async testConnection(param: ZceXTestConnectionActionParamArgs): Promise<boolean> {
    try {
      await this.zceXTestConnectionAction.call(param)
      return true
    } catch (e) {
      return false
    }
  }
}
