import { Injectable, Inject } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import {
  AddHybridKeySecretAction,
  AddHybridKeySecretActionParam
} from '@/api/zstack/AddHybridKeySecretAction'
import { ChangeAccessKeyStateAction } from '@/api/zstack/ChangeAccessKeyStateAction'
import { CreateAccessKeyAction } from '@/api/zstack/CreateAccessKeyAction'
import { DeleteAccessKeyAction } from '@/api/zstack/DeleteAccessKeyAction'
import { DeleteHybridKeySecretAction } from '@/api/zstack/DeleteHybridKeySecretAction'
import { QueryAccessKeyAction } from '@/api/zstack/QueryAccessKeyAction'
import { QueryHybridKeySecretAction } from '@/api/zstack/QueryHybridKeySecretAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionSendResp } from '@/common/model/action-send-resp.model'
import { ZsSession } from '@/model/zs-session.model'

import {
  CreateAccessKeyInput,
  QueryAccessKeyResp,
  QueryHybridKeySecretResult
} from './accesskey-management.model'

@Injectable()
export class AccessKeyService extends ActionService {
  @Inject() queryAccessKeyAction: QueryAccessKeyAction
  @Inject() createAccessKeyAction: CreateAccessKeyAction
  @InjectModel(ZsSession) private zsSessions: typeof ZsSession
  @Inject() changeAccessKeyStateAction: ChangeAccessKeyStateAction
  @Inject() deleteAccessKeyAction: DeleteAccessKeyAction
  @Inject() addHybridKeySecretAction: AddHybridKeySecretAction
  @Inject() queryHybridKeySecretAction: QueryHybridKeySecretAction
  @Inject() deleteHybridKeySecretAction: DeleteHybridKeySecretAction

  async query(params: QueryAction): Promise<QueryAccessKeyResp> {
    const { inventories, total } = await this.queryAccessKeyAction.call(params)
    return {
      list: inventories,
      total
    }
  }

  async queryThirdpartyList(params: QueryAction): Promise<QueryHybridKeySecretResult> {
    const { inventories, total } = await this.queryHybridKeySecretAction.call(params)
    return {
      list: inventories,
      total
    }
  }
}
