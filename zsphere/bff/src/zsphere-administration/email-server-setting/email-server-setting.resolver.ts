import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { OwnerDataLoader } from '../owner/owner.dataloader'
import {
  EmailServerSetting,
  EmailServerSettingQueryResp,
  QueryEmailServerSettingArgs
} from './email-server-setting.model'
//import { EmailServerSettingService } from './email-server-setting.service'
import { EmailServerSettingService } from './query/email-server-setting-query'

@Resolver(() => EmailServerSetting)
export class EmailServerSettingResolver {
  @Inject() emailSeverSettingService: EmailServerSettingService
  @Inject() ownerLoader: OwnerDataLoader

  @Query(() => EmailServerSettingQueryResp)
  async emailServerSettingList(
    @Args() queryArgs: QueryEmailServerSettingArgs
  ): Promise<EmailServerSettingQueryResp> {
    return this.emailSeverSettingService.query(queryArgs)
  }

  @Query(() => EmailServerSetting, { nullable: true })
  async emailServerSetting(
    @Args('uuid') uuid: string
  ): Promise<EmailServerSettingQueryResp | null> {
    return this.emailSeverSettingService.queryByUuid(uuid)
  }

  @ResolveField('shareType')
  async shareType(@Parent() emailServerSetting: EmailServerSetting): Promise<boolean> {
    return await this.ownerLoader.queryResourceShareType(emailServerSetting.uuid)
  }

  @ResolveField('emailPlat')
  async emailPlat(@Parent() emailServerSetting: EmailServerSetting) {
    return this.emailSeverSettingService.getEmailPlatForm(emailServerSetting.uuid)
  }

  @ResolveField()
  async owner(@Parent() emailServerSetting: EmailServerSetting) {
    return this.emailSeverSettingService.getOwner(emailServerSetting.uuid)
  }
}
