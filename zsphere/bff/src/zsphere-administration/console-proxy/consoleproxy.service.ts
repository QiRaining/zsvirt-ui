import { Inject, Injectable } from '@nestjs/common'
import { ApolloError } from 'apollo-server-errors'

import { QueryConsoleProxyAgentAction } from '@/api/zstack/QueryConsoleProxyAgentAction'
import { ReconnectConsoleProxyAgentAction } from '@/api/zstack/ReconnectConsoleProxyAgentAction'
import { UpdateConsoleProxyAgentAction } from '@/api/zstack/UpdateConsoleProxyAgentAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import { PrivilegeService } from '@/privilege/privilege.service'

import { ConsoleProxyAgentQueryResp } from './consoleproxy.model'

@Injectable()
export class ConsoleProxyAgentService extends ActionService {
  @Inject() queryConsoleProxyAgentAction: QueryConsoleProxyAgentAction
  @Inject() reconnectConsoleProxyAgentAction: ReconnectConsoleProxyAgentAction
  @Inject() privilegeService: PrivilegeService
  @Inject() updateConsoleProxyAgentAction: UpdateConsoleProxyAgentAction

  async query(params: QueryAction): Promise<ConsoleProxyAgentQueryResp> {
    const sessionId = this.getSessionId()
    const session = await this.getZsSession().findOne({
      where: {
        sessionId
      }
    })
    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }
    const hasPrivilege = await this.privilegeService.hasPrivilege()
    if (!hasPrivilege) {
      throw new ApolloError('无UI权限', 'FORBIDDEN', { statusCode: 403 })
    }

    const { inventories, total } = await this.queryConsoleProxyAgentAction.call(params)
    return {
      list: inventories,
      total
    }
  }
}
