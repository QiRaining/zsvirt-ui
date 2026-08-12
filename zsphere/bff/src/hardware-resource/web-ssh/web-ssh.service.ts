import { Inject, Injectable } from '@nestjs/common'

import { GetHostWebSshUrlAction } from '@/api/zstack/GetHostWebSshUrlAction'
import { QueryGlobalConfigAction } from '@/api/zstack/QueryGlobalConfigAction'
import { ActionService } from '@/base/action-service'
import { ZOp } from '@/common/zql'

import { WebSSH } from './web-ssh.model'

@Injectable()
export class WebSSHService extends ActionService {
  @Inject()
  getHostWebSshUrlAction: GetHostWebSshUrlAction
  @Inject() queryGlobalConfigAction: QueryGlobalConfigAction

  async queryWebShellTimeout() {
    const { inventories } = await this.queryGlobalConfigAction.call({
      conditions: [
        {
          key: 'category',
          op: ZOp.eq,
          value: 'kvm'
        },
        {
          key: 'name',
          op: ZOp.eq,
          value: 'webssh.idleTimeout'
        }
      ]
    })

    const socketTimeout = Number.parseInt(inventories?.[0]?.value, 10)

    return Number.isNaN(socketTimeout) ? 1800 * 1000 : socketTimeout * 1000
  }

  async queryWebSSHUrl(): Promise<WebSSH> {
    const socketTimeout = await this.queryWebShellTimeout()
    return { socketTimeout }
  }
}
