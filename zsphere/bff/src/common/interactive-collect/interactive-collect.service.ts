import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/sequelize'

import { ZsUIConfig } from '@/model/zs-ui-config.model'

@Injectable()
export class InteractiveCollectQueryService {
  @Inject() private configService: ConfigService
  @InjectModel(ZsUIConfig) private zsUIConfig: typeof ZsUIConfig

  async getCollectInteractiveTriggerStatus() {
    return this.configService.get<string>('INTERACTIVE_COLLECT') === 'true'
  }
}
