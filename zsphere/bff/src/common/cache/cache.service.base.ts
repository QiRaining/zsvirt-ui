import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cache } from 'cache-manager'

@Injectable()
export class CacheServiceBase {
  @Inject() private configService: ConfigService
  @Inject(CACHE_MANAGER) cache: Cache

  get<T>(key: string): Promise<T> {
    console.log(`cache hint: [${key}]`)
    return this.cache.get(key)
  }

  set<T>(key: string, value: T, options?: any): Promise<T> {
    return this.cache.set(key, value, (options?.ttl ?? this.getDefaultTtl()) * 1000)
  }

  del(key: string): Promise<boolean> {
    return this.cache.del(key)
  }

  getDefaultTtl() {
    return parseInt(this.configService.get<string>('ZS_REDIS_TTL') ?? '9')
  }
}
