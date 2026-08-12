import { Controller, Get } from '@nestjs/common'

import { AppService } from './app.service'

@Controller('api/nodeid')
export class NodeIDController {
  constructor(private readonly appService: AppService) {}

  @Get()
  nodeID(): string {
    return this.appService.getNodeID()
  }
}
