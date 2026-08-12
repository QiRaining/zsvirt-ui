import { CacheManagerOptions } from '@nestjs/cache-manager'
import { InternalServerErrorException } from '@nestjs/common'

import { CacheService } from './cache.service'

type Cacheable<T> = (...args) => Promise<T>

export function Cache<T>(options: CacheManagerOptions = {}) {
  return (target: any, methodName: string, descriptor: TypedPropertyDescriptor<Cacheable<T>>) => {
    const originalMethod = descriptor.value
    const className = target.constructor.name

    descriptor.value = async function (...args: any[]) {
      const cache = this.cacheService
      if (!cache || !(cache instanceof CacheService)) {
        throw new InternalServerErrorException('Target Class should inject CacheService')
      } else {
        const cacheKey = await cache.getCacheKey(className, methodName, args)
        const cachedValue = await cache.get<T>(cacheKey)

        if (cachedValue) {
          return cachedValue
        }

        const methodResult = await originalMethod?.apply(this, args)
        cache.set<T>(cacheKey, methodResult, {
          ...options,
          ttl: options?.ttl ?? cache.getDefaultTtl()
        })
        return methodResult
      }
    }

    return descriptor
  }
}
