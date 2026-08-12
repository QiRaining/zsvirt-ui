import { Injectable, Scope } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PubSub } from 'graphql-subscriptions'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import Redis, { RedisOptions } from 'ioredis'

import { genUuid } from '@/utils'

import { isEncrypted, Decrypt } from '../../utils/aesCipher'
import { ZwatchConvergenceManager } from './zwtach-convergence-manager'

class LocalPubSub extends PubSub {
  asyncIterator(triggers: string | readonly string[]) {
    return this.asyncIterableIterator(triggers)
  }
}

type PubSubBackend = {
  publish: (trigger: string, payload: any) => Promise<void>
  asyncIterator: (triggers: string | string[]) => AsyncIterator<unknown>
}

let pubSub: PubSubBackend | undefined

@Injectable({ scope: Scope.DEFAULT })
export class PubSubServiceBase {
  public id
  public zwatchConvergenceManager

  constructor(public configService: ConfigService) {
    if (!pubSub) {
      if (process.env.ZSV_MOCK === '1') {
        pubSub = new LocalPubSub() as PubSubBackend
      } else {
        const host = this.configService.get<string>('ZS_REDIS_HOST')
        const port = Number(this.configService.get<string>('ZS_REDIS_PORT'))
        if (!host || !Number.isInteger(port) || port < 1 || port > 65535) {
          throw new Error('ZS_REDIS_HOST and a valid ZS_REDIS_PORT are required')
        }
        const options: RedisOptions = { host, port }
        let redisPass = this.configService.get<string>('ZS_REDIS_PASSWORD')
        if (redisPass) {
          redisPass = isEncrypted(redisPass) ? Decrypt(redisPass) : redisPass
          Object.assign(options, {
            password: redisPass
          })
        }
        pubSub = new RedisPubSub({
          publisher: new Redis(options),
          subscriber: new Redis(options)
        }) as PubSubBackend
      }
    }
    this.id = genUuid()
    if (!this.zwatchConvergenceManager) {
      this.zwatchConvergenceManager = new ZwatchConvergenceManager('4 * * * * *', pubSub)
    }
  }

  get() {
    if (!pubSub) {
      throw new Error('PubSub backend is not initialized')
    }
    return pubSub
  }

  response(payload) {
    this.get().publish(payload.sessionId, { listenActionResp: payload })
  }

  zwatch(payload) {
    // 大屏监控 报警消息不需要收敛
    // payload.payload 必须是 string，因为 GraphQL ZWatchEvent.payload 声明为 String 类型
    // 如果传入 Object，GraphQL String scalar serialize 会抛异常导致 WebSocket 推送失败
    const serialized = {
      ...payload,
      payload:
        typeof payload.payload === 'string' ? payload.payload : JSON.stringify(payload.payload)
    }
    this.get().publish(`ZWatch-${payload.sessionId}`, {
      listenZWatch: serialized
    })

    this.zwatchConvergenceManager.push(payload)
  }

  ticket(payload) {
    this.get().publish(`Ticket-${payload.sessionId}`, {
      listenTicket: payload
    })
  }

  apiInspector(payload) {
    this.get().publish(`ApiInspector-${payload.sessionId}`, {
      listenApiInspector: payload
    })
  }

  exportData(payload) {
    this.get().publish(`exportData-${payload.sessionId}`, {
      exportTaskUpdated: payload
    })
  }
}
