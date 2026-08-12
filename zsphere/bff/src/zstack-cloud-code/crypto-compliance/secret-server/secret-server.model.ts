import { ArgsType, Field, ObjectType, OmitType, registerEnumType } from '@nestjs/graphql'

import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

import {
  SecretResourcePoolModel,
  SecretResourcePoolStatus
} from '../secret-resource-pool/secret-resource-pool.model'

export enum SecretServerQueryType {
  Normal = 'Normal'
}
registerEnumType(SecretServerQueryType, { name: 'SecretServerQueryType' })

@ArgsType()
export class QuerySecretServerArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => SecretServerQueryType, {
    nullable: true,
    defaultValue: SecretServerQueryType.Normal
  })
  type?: SecretServerQueryType
}

@ObjectType()
export class SecretServer {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => SecretResourcePoolStatus)
  status: SecretResourcePoolStatus

  @Field(() => SecretResourcePoolModel)
  model: SecretResourcePoolModel

  @Field(() => String)
  managementIp: string

  @Field(() => String)
  port: string

  @Field(() => String, { nullable: true })
  realm?: string

  @Field(() => String, { nullable: true })
  route?: string

  @Field(() => String, { nullable: true })
  clientID?: string

  @Field(() => String, { nullable: true })
  clientSecrete?: string

  @Field(() => String, { nullable: true })
  appId?: string

  @Field(() => String, { nullable: true })
  keyNumSM2?: string

  @Field(() => String, { nullable: true })
  keyNumSM4?: string

  @Field(() => Boolean)
  isEnableCryptoCmpl: boolean

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class SecretServerList extends QueryCommonResponse(SecretServer) {
  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
