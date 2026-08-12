import { Inject, Injectable } from '@nestjs/common'

import { QueryParam as IQueryParam } from '@/api/zstack/base/query-base'
import { QueryBackupStorageAction } from '@/api/zstack/QueryBackupStorageAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'

import { RemoteBackupStorageQueryResp } from '../remote-backup-storage.model'
@Injectable()
export class QueryRemoteBackupStorageService {
  @Inject() queryBackupStorageAction: QueryBackupStorageAction
  @Inject() querySystemTagAction: QuerySystemTagAction

  async query(params: IQueryParam): Promise<RemoteBackupStorageQueryResp> {
    const { inventories: list, total } = await this.queryBackupStorageAction.call(params)
    return { list, total }
  }

  async querySystemTags(params: IQueryParam) {
    const { inventories: list } = await this.querySystemTagAction.call(params)
    return list[0].tag
  }
}
