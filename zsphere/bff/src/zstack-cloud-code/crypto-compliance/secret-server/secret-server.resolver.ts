import { Inject } from '@nestjs/common'
import { Args, Query, Resolver, ResolveField, Parent } from '@nestjs/graphql'

import { SecretServerQueryService } from './query/secret-server.query.service'
import { QuerySecretServerArgs, SecretServer, SecretServerList } from './secret-server.model'

@Resolver(() => SecretServer)
export class SecretServerResolver {
  @Inject() secretServerQueryService: SecretServerQueryService

  @Query(() => SecretServerList)
  secretServerList(@Args() queryArgs: QuerySecretServerArgs) {
    return this.secretServerQueryService.get(queryArgs)
  }

  @Query(() => SecretServer)
  secretServer(@Args('uuid') uuid: string) {
    return this.secretServerQueryService.secretServer(uuid)
  }

  @ResolveField(() => Boolean)
  isEnableCryptoCmpl(@Parent() secretServer: SecretServer) {
    return this.secretServerQueryService.isEnableCryptoCmpl(secretServer.uuid)
  }

  @Query(() => Number)
  secretServerCount() {
    return this.secretServerQueryService.secretServerCount()
  }
}
