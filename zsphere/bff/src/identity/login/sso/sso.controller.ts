import { Controller, Get, Inject, Req } from '@nestjs/common'
import { Promise } from 'bluebird'
import * as _ from 'lodash'

import { ZsHttpService } from '@/common/trans/zs-http-service/zs-http-service.service'

@Controller('/api/plugin/sso')
export class SSOController {
  @Inject() zsHttpService: ZsHttpService

  @Get('client')
  async getClient(): Promise<any> {
    const result = await this.zsHttpService.get('/get/sso/client')
    return result.data.inventories
  }

  @Get('token')
  async getToken(@Req() request): Promise<any> {
    try {
      const result = await this.zsHttpService.get('/get/oauth2/token', {
        sessionId: request.headers['x-session-id']
      })
      return result.data.inventory
    } catch (e) {
      return {}
    }
  }
}
