import { Inject } from '@nestjs/common'
import { Resolver, Args, Query } from '@nestjs/graphql'

import { PersonalizationConfig, PersonalizationConfigInput } from './personalization-config.model'
import { PersonalizationConfigService } from './personalization-config.service'

@Resolver(() => PersonalizationConfig)
export class PersonalizationConfigResolver {
  @Inject() PersonalizationConfigService: PersonalizationConfigService

  @Query(() => PersonalizationConfig)
  async queryPersonalizationConfig(
    @Args() args: PersonalizationConfigInput
  ): Promise<PersonalizationConfig> {
    return await this.PersonalizationConfigService.query(args.profileType, args.resourceType)
  }
}
