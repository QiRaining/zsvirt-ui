import { CacheModule as NestCacheModule } from '@nestjs/cache-manager'
import { Module, Global } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as redisStore from 'cache-manager-redis-store'

import { isEncrypted, Decrypt } from '../../utils/aesCipher'
import { CacheService } from './cache.service'
import { CacheServiceBase } from './cache.service.base'

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const ttl = parseInt(configService.get<string>('ZS_REDIS_TTL') || '9')
        if (process.env.ZSV_MOCK === '1') {
          return { ttl }
        }

        const host = configService.get<string>('ZS_REDIS_HOST')
        const port = Number(configService.get<string>('ZS_REDIS_PORT'))
        if (!host || !Number.isInteger(port) || port < 1 || port > 65535) {
          throw new Error('ZS_REDIS_HOST and a valid ZS_REDIS_PORT are required')
        }

        const options = {
          store: redisStore,
          host,
          port,
          ttl
        }
        let redisPass = configService.get<string>('ZS_REDIS_PASSWORD')
        if (redisPass) {
          redisPass = isEncrypted(redisPass) ? Decrypt(redisPass) : redisPass
          Object.assign(options, {
            password: redisPass
          })
        }
        return options
      }
    })
  ],
  providers: [CacheService, CacheServiceBase],
  exports: [CacheService, CacheServiceBase]
})
export class CacheModule {}
