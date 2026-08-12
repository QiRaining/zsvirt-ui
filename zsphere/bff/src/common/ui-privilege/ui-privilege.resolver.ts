import { Inject, UnauthorizedException } from '@nestjs/common'
import { Resolver, Query, ObjectType, Field, CONTEXT } from '@nestjs/graphql'

import { UIPrivilegeService } from './ui-privilege.service'

@ObjectType()
class UIPrivilegeResult {
  @Field(() => [[String]])
  uiPrivileges: string[][]
}

@Resolver(() => UIPrivilegeResult)
export class UIPrivilegeResolver {
  @Inject() uiPrivilegeService: UIPrivilegeService
  @Inject(CONTEXT) protected readonly context

  @Query(() => UIPrivilegeResult)
  async uiPrivilege() {
    const headers = this.context?.req?.headers || this.context?.headers
    const sessionId = headers['x-session-id']
    if (!sessionId) {
      throw new UnauthorizedException('Session not found')
    }
    return this.uiPrivilegeService.getUiPrivileges(sessionId)
  }
}
