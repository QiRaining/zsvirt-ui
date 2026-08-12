import { Injectable } from '@nestjs/common'

import { ActionService } from '@/base/action-service'

@Injectable()
export class SNSAtPersonService extends ActionService {}
