import { Injectable, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
@Injectable()
export class AppService {
  @Inject() configService: ConfigService

  getHello(): string {
    return 'Hello World!'
  }
  getNodeID(): string {
    return this.configService.get<string>('NODE_ID')
  }
}
