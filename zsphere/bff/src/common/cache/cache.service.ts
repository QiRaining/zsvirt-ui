import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CONTEXT } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import { Cache } from 'cache-manager'

import { ZsSession } from '@/model/zs-session.model'

@Injectable()
export class CacheService {
  @Inject() private configService: ConfigService
  @Inject(CACHE_MANAGER) cache: Cache
  @Inject(CONTEXT) context
  @InjectModel(ZsSession) zsSession: typeof ZsSession

  get<T>(key: string): Promise<T> {
    console.log(`cache hint: [${key}]`)
    return this.cache.get(key)
  }

  set<T>(key: string, value: T, options?: any): Promise<T> {
    return this.cache.set(key, value, (options?.ttl ?? this.getDefaultTtl()) * 1000)
  }

  del(key: string): Promise<boolean> {
    const data = this.cache.get(key)
    if (data) {
      return this.cache.del(key)
    }
    return Promise.resolve(true)
  }

  getDefaultTtl() {
    return parseInt(this.configService.get<string>('ZS_REDIS_TTL') ?? '9')
  }

  async getSession() {
    const sessionId = this.context?.req?.headers?.['x-session-id'] ?? ''
    const session = await this.zsSession.findOne({
      where: {
        sessionId
      }
    })
    return session
  }

  getCacheKey = async (className: string, methodName: string, args: any[] = []) => {
    const currentSession = await this.getSession()
    const identityName = `${
      currentSession?.userId ?? ''
    }:${currentSession?.identity ?? ''}:${currentSession?.accountId ?? ''}`

    const cacheKey = `${identityName}:${className}:${methodName}:${args
      .map(a => (typeof a === 'string' ? a : JSON.stringify(a)))
      .join()}`
    return cacheKey
  }
}
