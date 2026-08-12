import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, CONTEXT } from '@nestjs/graphql'

import { QueryLongJobAction } from '@/api/zstack/QueryLongJobAction'
import { ZsLongJob } from '@/model/zs-long-job.model'

@Resolver(() => ZsLongJob)
export class LongJobResolver {
  @Inject() queryLongJobAction: QueryLongJobAction
  @Inject(CONTEXT) protected readonly _context
  @Query(() => ZsLongJob)
  async longJob(@Args('uuid') uuid: string) {
    const longJobResp = await this.queryLongJobAction.call(
      { conditions: [{ key: 'uuid', value: uuid }] },
      { sessionId: (this._context as any).req.headers['x-session-id'] }
    )
    return longJobResp
  }
}
