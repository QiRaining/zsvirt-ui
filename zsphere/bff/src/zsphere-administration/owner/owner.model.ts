import {
  ObjectType,
  Field,
  Int,
  registerEnumType,
  ArgsType,
  InputType,
  createUnionType
} from '@nestjs/graphql'

import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

@ObjectType()
export class CommonOwner {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String)
  type?: string
}

@ObjectType()
export class BasicOwner extends CommonOwner {
  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Int, { nullable: true })
  volumeNum?: number

  @Field(() => Int, { nullable: true })
  vmNum?: number
}

@ObjectType()
export class AccountOwner extends BasicOwner {
  @Field(() => String)
  declare type: string
}

@ObjectType()
export class AccountGroupOwner extends BasicOwner {
  @Field(() => String)
  declare type: string
}

@ObjectType()
export class ProjectType {
  @Field(() => String)
  name: string

  @Field(() => Int)
  ordinal: number
}

@ObjectType()
export class ProjectAttribute {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String)
  value: string

  @Field(() => ProjectType)
  type: ProjectType
}

@ObjectType()
export class ProjectOwner extends BasicOwner {
  @Field(() => String)
  linkedAccountUuid: string

  @Field(() => ProjectType)
  state: ProjectType

  @Field(() => [ProjectAttribute])
  attributes: [ProjectAttribute]

  @Field(() => String, { nullable: true })
  admin?: string
}

@ObjectType()
export class ResourceShare {
  @Field(() => String)
  resourceUuid: string

  @Field(() => String)
  shareType: ShareType
}

export enum OwnerQueryType {
  'Account' = 'Account',
  'AccountGroup' = 'AccountGroup',
  'Project' = 'Project',
  'AccountCandidate' = 'AccountCandidate',
  'ProjectCandidate' = 'ProjectCandidate',
  'AccountOwner' = 'AccountOwner',
  'ProjectOwner' = 'ProjectOwner',
  'AllAccount' = 'AllAccount',
  'AllProject' = 'AllProject',
  'AllAccountGroup' = 'AllAccountGroup'
}

registerEnumType(OwnerQueryType, {
  name: 'OwnerQueryType'
})

export enum ShareType {
  'Public' = 'Public',
  'Group' = 'Group',
  'None' = 'None'
}

registerEnumType(ShareType, {
  name: 'ShareType'
})

export enum OwnerSummaryType {
  'Normal' = 'Normal',
  'Candidate' = 'Candidate',
  'ChangeOwner' = 'ChangeOwner',
  'All' = 'All'
}

registerEnumType(OwnerSummaryType, {
  name: 'OwnerSummaryType'
})

@ArgsType()
export class QueryOwnerArg extends QueryAction {
  @Field(() => OwnerQueryType)
  declare type: OwnerQueryType
}

@ArgsType()
export class QueryOwnerSummaryArg extends QueryAction {
  @Field(() => OwnerSummaryType)
  declare type: OwnerSummaryType
}

@ObjectType()
export class AccountOwnerQueryResp extends QueryCommonResponse(AccountOwner) {
  @Field(() => OwnerQueryType)
  declare type: OwnerQueryType
}

@ObjectType()
export class AccountGroupOwnerQueryResp extends QueryCommonResponse(AccountGroupOwner) {
  @Field(() => OwnerQueryType)
  declare type: OwnerQueryType
}

@ObjectType()
export class ProjectOwnerQueryResp extends QueryCommonResponse(ProjectOwner) {
  @Field(() => OwnerQueryType)
  type: OwnerQueryType
}

@ObjectType()
export class OwnerSummaryQueryResp {
  @Field(() => Int)
  project: number

  @Field(() => Int)
  account: number
}

export const OwnerQueryResp = createUnionType({
  name: 'OwnerQueryResp',
  types: () => [AccountOwnerQueryResp, ProjectOwnerQueryResp, AccountGroupOwnerQueryResp],
  resolveType: value => {
    if (
      value.type === OwnerQueryType.Project ||
      value.type === OwnerQueryType.ProjectCandidate ||
      value.type === OwnerQueryType.ProjectOwner
    ) {
      return ProjectOwnerQueryResp
    }
    if (
      value.type === OwnerQueryType.Account ||
      value.type === OwnerQueryType.AccountCandidate ||
      value.type === OwnerQueryType.AccountOwner
    ) {
      return AccountOwnerQueryResp
    }
    if (
      value.type === OwnerQueryType.AccountGroup ||
      value.type === OwnerQueryType.AllAccountGroup
    ) {
      return AccountGroupOwnerQueryResp
    }

    return null
  }
})

// @InputType()
// export class ShareResourceInput {
//   @Field(() => [String])
//   resourceUuids: string[]

//   @Field(() => [String], { nullable: true })
//   accountUuids?: string[]

//   @Field(() => Boolean, { nullable: true })
//   toPublic?: boolean
// }

@InputType()
export class ShareResourceToProjectInput {
  @Field(() => [String])
  resourceUuids: string[]

  @Field(() => [String])
  projectUuids: string[]

  @Field(() => Boolean, { nullable: true })
  toPublic?: boolean
}

// @InputType()
// export class RevokeResourceSharingInput {
//   @Field(() => [String])
//   resourceUuids: string[]

//   @Field(() => [String], { nullable: true })
//   accountUuids?: string[]

//   @Field(() => Boolean, { nullable: true })
//   toPublic?: boolean

//   @Field(() => Boolean, { nullable: true })
//   all?: boolean
// }

@InputType()
export class RevokeResourceSharingFromProjectInput {
  @Field(() => [String])
  resourceUuids: string[]

  @Field(() => [String])
  projectUuids: string[]

  @Field(() => Boolean, { nullable: true })
  toPublic?: boolean

  @Field(() => Boolean, { nullable: true })
  all?: boolean
}

@InputType()
export class ChangeResourceOwnerInput {
  @Field(() => String)
  accountUuid: string

  @Field(() => String)
  resourceUuid: string
}

@InputType()
export class BatchChangeResourceOwnerInput {
  @Field(() => String)
  accountUuid: string

  @Field(() => [String])
  resourceUuids: string[]
}

@ObjectType()
export class AccountResourceRefInventory {
  @Field(() => String, { nullable: true })
  accountUuid?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => String, { nullable: true })
  ownerAccountUuid?: string

  @Field(() => String, { nullable: true })
  resourceType?: string
}

@ObjectType()
export class OwnerActionResp {
  @Field(() => AccountResourceRefInventory, { nullable: true })
  result?: AccountResourceRefInventory

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
