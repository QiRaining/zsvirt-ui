// import { Injectable, Inject } from '@nestjs/common'
import { SimpleDataloaderFactory } from '@/common/resource.dataloader'
// import { ResourceConfigService } from './resource-config.service'
// import DataLoader from 'dataloader'

interface IProps {
  name: string
  category: string
  result?: string
}

export const ResourceConfigDataloaderFactory = ({
  name,
  category,
  result = 'inventories.[0].value'
}: IProps) =>
  SimpleDataloaderFactory({
    tableName: 'ResourceConfig',
    getCondition: uuid => ({
      resourceUuid: uuid,
      name,
      category
    }),
    result
  })

// @Injectable()
// export class ResourceConfigDataloader {
//   @Inject() resourceConfigService: ResourceConfigService

//   private resourceConfigDataLoader
//   private rsourceConfigMap: any = {}

//   constructor() {
//     this.resourceConfigDataLoader = new DataLoader(this._getResourceConfigData)
//   }

//   query = async (uuid, category, name) => {
//     this.rsourceConfigMap[uuid] = {
//       uuid,
//       category,
//       name
//     }
//     return this.resourceConfigDataLoader.load(uuid)
//   }

//   _getResourceConfigData = async (uuids = [], names = []) => {
//     const data = this.resourceConfigService._query(uuids, )

//     return data
//   }
// }
