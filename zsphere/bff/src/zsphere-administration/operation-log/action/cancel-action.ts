import { Controller, Get, Query } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { ZsAction } from '@/model/zs-action.model'

import { OperationStatus } from '../operation-log.model'

@Controller('api/operation/action')
export class CancelActionController {
  @InjectModel(ZsAction) private zsAction: typeof ZsAction

  @Get('/cancel')
  async cancel(@Query('actionId') actionId: string) {
    if (!actionId) {
      return {
        success: false,
        error: 'you may not input param `actionId`'
      }
    }
    try {
      const action = await this.zsAction.findOne({
        where: { actionId },
        attributes: [
          'id',
          'actionId',
          'key',
          'name',
          'userName',
          'resourceUuids',
          'loginIp',
          'status',
          'userId',
          'createDate',
          'lastOpDate',
          'progress'
        ]
      })
      if (!action) {
        return {
          success: false,
          error: `can not find action with current actionId ${actionId}`
        }
      }
      await action.update({
        status: OperationStatus.Canceled,
        lastOpDate: new Date()
      })
      return {
        success: true,
        action
      }
    } catch (e) {
      return {
        success: false,
        actionId,
        error: e
      }
    }
  }
}
