import { Injectable, Inject } from '@nestjs/common'
import { ObjectType } from '@nestjs/graphql'
import DataLoader from 'dataloader'
import { get, isString } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL, { ZQLAction } from '@/common/zql/index'

interface IProps<V = any> {
  tableName?: string | ((uuid: string) => string)
  fields?: string[]
  getCondition?: (uuid: string) => any
  result?: string
  batchLoadFn?: DataLoader.BatchLoadFn<any, V>
  zqlAction?: ZQLAction
}

@Injectable()
export class ResourceLoader {
  @Inject() zqlService: ZQLService

  useQuery = ({
    tableName,
    fields,
    getCondition = uuid => ({ uuid }),
    result = 'inventories.[0]',
    zqlAction = ZQLAction.QUERY
  }: Omit<IProps, 'batchLoadFn'>) => {
    return async (uuids: readonly string[]) => {
      const multVmZql = uuids.map(uuid => {
        let _tableName: string
        if (typeof tableName === 'function') {
          _tableName = tableName(uuid)
        } else {
          _tableName = tableName
        }
        return {
          tableName: _tableName,
          condition: getCondition(uuid),
          namedAs: uuid,
          fields,
          action: zqlAction
        }
      })
      const zql = ZQL.multStringify(multVmZql)
      const { results } = await this.zqlService.call(zql)

      return uuids.map(uuid => {
        const resource = results?.find(_hy => _hy.name === uuid)
        return get(resource, result, null)
      })
    }
  }
}

export function SimpleDataloaderFactory<V = any>(params: IProps<V>) {
  @ObjectType()
  class SimpleDataloader<V = any> extends ResourceLoader {
    @Inject() declare zqlService: ZQLService

    private _dataloader

    constructor() {
      super()
      const { batchLoadFn, ...rest } = params
      const _query = batchLoadFn || this.useQuery(rest)
      this._dataloader = new DataLoader(_query)
    }

    query: (uuid: string) => V | null = uuid => (uuid ? this._dataloader.load(uuid) : null)
  }
  return SimpleDataloader as new () => {
    query: (uuid: string) => Promise<V | null>
  }
}
