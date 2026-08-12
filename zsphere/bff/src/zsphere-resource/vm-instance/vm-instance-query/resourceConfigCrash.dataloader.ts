import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { GetResourceConfigAction } from '@/api/zstack/GetResourceConfigAction'

function useResourceConfigDataloader({ name, category }: { name: string; category: string }) {
  @Injectable()
  class ResourceConfigDataloader {
    @Inject() getResourceConfigAction: GetResourceConfigAction
    private _dataloader

    constructor() {
      this._dataloader = new DataLoader(this._query)
    }

    _query = async (uuids: string[]) => {
      const queryList = uuids?.map(async uuid =>
        this.getResourceConfigAction.call({
          name,
          category,
          resourceUuid: uuid
        })
      )
      const res = await Promise.all(queryList)
      return res?.map(i => i.value) ?? []
    }

    query = uuid => (uuid ? this._dataloader.load(uuid) : null)
  }

  return ResourceConfigDataloader as new () => {
    query: (uuid: string) => Promise<string | null>
  }
}

export class ResourceConfigCrashDataloader extends useResourceConfigDataloader({
  name: 'crash.strategy',
  category: 'vm'
}) {}
