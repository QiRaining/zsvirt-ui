import { Inject, Injectable } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import DataLoader from 'dataloader'
import { sortBy as _sortBy } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetResourceAccountAction } from '@/api/zstack/GetResourceAccountAction'
import ZQL, { ZOp } from '@/common/zql/index'
import { ZsSession } from '@/model/zs-session.model'

@Injectable()
export class TagDataloader {
  @Inject() zqlService: ZQLService
  @Inject(CONTEXT) private context
  @InjectModel(ZsSession) private zsSession: typeof ZsSession
  @Inject() apiGetResourceAccountAction: GetResourceAccountAction

  private tagsDataloader
  constructor() {
    this.tagsDataloader = new DataLoader(this._query)
  }

  query(resource) {
    return this.tagsDataloader.load(resource)
  }

  _query = async resources => {
    const uuids = resources.map(item => item.uuid)
    const sessionId = (this.context as any).req.headers['x-session-id']
    const session = await this.zsSession.findOne({
      where: {
        sessionId
      }
    })
    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }
    const zqlObject = {
      tableName: 'usertag',
      condition: {
        resourceUuid: {
          [ZOp.in]: uuids
        },
        tagPatternUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'accountResourceRef',
              fields: 'resourceUuid',
              condition: {
                resourceType: 'TagPatternVO'
              }
            }
          }
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    const inventories = resp.results[0].inventories
    return uuids.map(async uuid => {
      const tagList = inventories.filter(tag => tag.resourceUuid === uuid)
      if (tagList.length > 0) {
        const tagPatternList = tagList.map(item => item.tagPattern)
        const params = {
          resourceUuids: tagPatternList.map(item => item.uuid)
        }
        const { inventories } = await this.apiGetResourceAccountAction.call(params)
        tagPatternList.map(item => {
          item['ownerUuid'] = inventories[item?.uuid]?.uuid
        })

        return tagPatternList
      } else {
        return []
      }
    })
  }
}
@Injectable()
export class TagsDataloader {
  @Inject() zqlService: ZQLService
  @Inject(CONTEXT) private context
  @InjectModel(ZsSession) private zsSession: typeof ZsSession
  @Inject() apiGetResourceAccountAction: GetResourceAccountAction

  private tagsDataloader
  constructor() {
    this.tagsDataloader = new DataLoader(this._query)
  }

  query(uuid) {
    return this.tagsDataloader.load(uuid)
  }

  _query = async uuids => {
    // const sessionId = (this.context as any).req.headers['x-session-id']
    // const session = await this.zsSession.findOne({
    //   where: {
    //     sessionId
    //   }
    // })
    // if (!session) {
    //   throw Error(`Invalid sessionId [${sessionId}]`)
    // }

    const zqlObject = {
      tableName: 'usertag',
      condition: {
        tagPatternUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'accountResourceRef',
              fields: 'resourceUuid',
              condition: {
                resourceType: 'TagPatternVO'
              }
            }
          }
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    const inventories = resp.results[0].inventories
    return uuids.map(async uuid => {
      const tagList = inventories.filter(tag => tag.resourceUuid === uuid)
      if (tagList.length > 0) {
        const tagPatternList = tagList.map(item => item.tagPattern)
        const params = {
          resourceUuids: tagPatternList.map(item => item.uuid)
        }
        const { inventories } = await this.apiGetResourceAccountAction.call(params)
        tagPatternList.map(item => {
          item['ownerUuid'] = inventories[item?.uuid]?.uuid
        })

        return _sortBy(tagPatternList, function (tag) {
          return tag?.name
        })
      } else {
        return []
      }
    })
  }
}

@Injectable()
export class TagForAlarmDataloader {
  @Inject() zqlService: ZQLService
  @Inject(CONTEXT) private context
  @InjectModel(ZsSession) private zsSession: typeof ZsSession
  @Inject() apiGetResourceAccountAction: GetResourceAccountAction

  private tagsDataloader
  constructor() {
    this.tagsDataloader = new DataLoader(this._query)
  }

  query(resource) {
    return this.tagsDataloader.load(resource)
  }

  _query = async resources => {
    const uuids = resources.map(item => item.uuid)
    // const sessionId = (this.context as any).req.headers['x-session-id']
    // const session = await this.zsSession.findOne({
    //   where: {
    //     sessionId
    //   }
    // })
    // if (!session) {
    //   throw Error(`Invalid sessionId [${sessionId}]`)
    // }
    const zqlObject = {
      tableName: 'usertag',
      condition: {
        resourceUuid: {
          [ZOp.in]: uuids
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    const inventories = resp.results[0].inventories
    return uuids.map(async uuid => {
      const tagList = inventories?.find(tag => tag.resourceUuid === uuid)
      if (tagList) {
        return inventories.find(tag => tag.resourceUuid === uuid)
      } else {
        return null
      }
    })
  }
}
