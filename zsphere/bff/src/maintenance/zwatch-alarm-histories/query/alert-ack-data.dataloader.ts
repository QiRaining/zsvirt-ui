import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'

import { AckDataInAlarmHistories } from '../zwatch-alarm-histories.model'

@Injectable()
export class AlertAckDataloader extends SimpleDataloaderFactory<AckDataInAlarmHistories>({
  tableName: 'AlertDataAck',
  getCondition: uuid => ({
    alertDataUuid: uuid,
    resumeAlert: false
  })
}) {}
