import { Module } from '@nestjs/common'

import { CacheModule } from '@/common/cache/cache.module'

import { SearchResourceModule } from './resource/resource.module'
import { SearchController } from './search.controller'

@Module({
  // 这个地方必须加 ttl: 0 不然存入数据后下次 get 出来是 undefined
  // imports: [SearchResourceModule, CacheModule.register({ ttl: 0 })],
  imports: [SearchResourceModule, CacheModule],
  providers: [],
  controllers: [SearchController]
})
export class SearchModule {}
