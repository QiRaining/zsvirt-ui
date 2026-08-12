import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'

@InputType()
export class CreateAccessKeyInput {
  @Field(() => String)
  accountUuid: string

  @Field(() => String)
  userUuid: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  AccessKeyID?: string

  @Field(() => String, { nullable: true })
  AccessKeySecret?: string
}

@ObjectType()
export class AccessKeyOwner {
  @Field(() => String)
  name: string

  @Field(() => String)
  type: string

  @Field(() => String)
  uuid: string
}
@ObjectType()
export class HybridAccountInventory {
  @Field(() => String)
  name: string

  @Field(() => String)
  uuid: string

  @Field(() => AccessKeyOwner, { nullable: true })
  owner?: AccessKeyOwner

  @Field(() => String, { nullable: true })
  akey?: string

  @Field(() => String, { nullable: true })
  hybridAccountId?: string

  @Field(() => String, { nullable: true })
  hybridUserName?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  description?: string
}

@ObjectType()
export class AccessKey {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String)
  uuid: string

  @Field(() => AccessKeyOwner, { nullable: true })
  owner?: AccessKeyOwner

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  accountUuid?: string

  @Field(() => String, { nullable: true })
  userUuid?: string

  @Field(() => String, { nullable: true })
  AccessKeyID?: string

  @Field(() => String, { nullable: true })
  AccessKeySecret?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true })
  createDate?: string
}
// @ObjectType()
// export class LocalOwner extends AccessKey {
//   @Field(() => BasicOwner, { nullable: true })
//   owner: BasicOwner
// }

@ObjectType()
export class QueryAccessKeyResp {
  @Field(() => [AccessKey], { nullable: true })
  list?: AccessKey[]

  @Field(() => Int, { nullable: true })
  total?: number
}

@ObjectType()
export class QueryHybridKeySecretResult {
  @Field(() => [HybridAccountInventory], { nullable: true })
  list?: HybridAccountInventory[]

  @Field(() => Int, { nullable: true })
  total?: number
}
