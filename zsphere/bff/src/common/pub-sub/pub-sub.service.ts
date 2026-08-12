import { Injectable, Scope } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CONTEXT } from '@nestjs/graphql'
import * as _ from 'lodash'

import { PubSubServiceBase } from './pub-sub-base.service'

let asyncQueryMap

@Injectable({ scope: Scope.DEFAULT })
export class PubSubService extends PubSubServiceBase {
  @Inject(CONTEXT) private readonly context

  constructor(configService: ConfigService) {
    super(configService)
    if (!asyncQueryMap) {
      asyncQueryMap = new Map()
    } // asyncQueryMap 保证全局只有一份
  }

  asyncQueryField(queryName, fieldKey, payload) {
    const sessionId = this.context.req.headers['x-session-id']
    const queryId = this.context.req.headers['x-query-id']
    const traceId = this.context.req.headers['trace_id']
    const param = asyncQueryMap.get(`${traceId}-${queryName}`)
    if (!param || param?.filedList?.indexOf(fieldKey) === -1) {
      return
    }
    param.payloads[fieldKey] = (param.payloads?.[fieldKey] ?? []).concat(payload)

    const finishedFiledQueryNum = _.sumBy(
      _.keys(param.payloads),
      filedKey => param.payloads[filedKey]?.length ?? 0
    )

    if (finishedFiledQueryNum === param.payloadsNum) {
      try {
        const inventories = _.reduce(
          _.values(param.payloads),
          (obj: any, item: any) => {
            const uuidObj = _.groupBy(item, 'uuid')
            if (!_.keys(obj)?.length) {
              return uuidObj
            }
            return _.merge(obj, uuidObj)
          },
          {}
        )
        const listenAsyncQuery = {
          sessionId: sessionId,
          queryName: queryName,
          queryId,
          inventories: _.values(inventories).map(item => JSON.stringify(item[0]))
        }
        this.get().publish(`AsyncQuery-${sessionId}-${queryName}-${queryId}`, {
          listenAsyncQuery
        })
      } catch (e) {
        console.error(`[Async Query Error]: ${e}`)
      }
      asyncQueryMap.delete(`${traceId}-${queryName}`)
    } else {
      asyncQueryMap.set(`${traceId}-${queryName}`, param)
    }
  }

  async asyncQuery(queryName, resourceNum, filedList) {
    const key = `${this.context.req.headers['trace_id']}-${queryName}`
    asyncQueryMap.set(key, {
      payloadsNum: resourceNum * filedList.length,
      filedList,
      payloads: {}
    })
    setTimeout(
      () => {
        if (asyncQueryMap.get(key)) {
          // 10分钟后map中还存在该数据，直接删除
          asyncQueryMap.delete(key)
          console.log(`[Async Query Delete Auto]: ${key}`)
        }
      },
      10 * 60 * 1000
    )
  }
}
