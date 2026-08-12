import { createUnionType, Field, Float, Int, InterfaceType, ObjectType } from '@nestjs/graphql'

import { EndPointState, EndPointType } from '@/common/enum/common'
import { Owner } from '@/zsphere-resource/image/image.model'

@ObjectType()
export class SNSTopic {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  locale?: string
}

@InterfaceType()
export abstract class BasicEndPoint {
  @Field(() => String)
  name: string

  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => EndPointType, { nullable: true })
  type?: EndPointType

  @Field(() => EndPointState, { nullable: true })
  state?: EndPointState

  @Field(() => String, { nullable: true })
  platformUuid?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => SNSTopic, { nullable: true })
  topic?: SNSTopic

  @Field(() => Owner, { nullable: true })
  owner?: Owner
}

@ObjectType({
  implements: [BasicEndPoint]
})
export class HttpEndPoint extends BasicEndPoint {
  @Field(() => String, { nullable: true })
  url?: string
}

@ObjectType()
export class AtPersonListItem {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  userId?: string

  @Field(() => String, { nullable: true })
  phoneNumber?: string

  @Field(() => String, { nullable: true })
  remark?: string
}

@ObjectType({
  implements: [BasicEndPoint]
})
export class DingTalkEndPoint extends BasicEndPoint {
  @Field(() => Boolean)
  atAll: boolean

  @Field(() => String, { nullable: true })
  url?: string

  @Field(() => String, { nullable: true })
  secret?: string

  @Field(() => [AtPersonListItem], { nullable: true })
  atPersonList?: AtPersonListItem[]

  @Field(() => [String], { nullable: true })
  atPersonPhoneNumbers?: string[]

  @Field(() => Float, {
    nullable: true,
    description: `
      指定人员的数量：
      现阶段因为后端会直接返回 atPersonList，所以直接取 atPersonList.length 即可
      若后面后端遇到性能瓶颈，再让后端不走级联查询 atPersonList，由 node 端去查询数量：见 endpointQueryService.getAtPersonListCount
`
  })
  atPersonListCount?: number
}

@ObjectType({
  implements: [BasicEndPoint]
})
export class FeiShuEndPoint extends BasicEndPoint {
  @Field(() => Boolean)
  atAll: boolean

  @Field(() => String, { nullable: true })
  url?: string

  @Field(() => String, { nullable: true })
  secret?: string

  @Field(() => [AtPersonListItem], { nullable: true })
  atPersonList?: AtPersonListItem[]

  @Field(() => [String], { nullable: true })
  atPersonUserIds?: string[]

  @Field(() => Float, {
    nullable: true,
    description: `
    指定人员的数量：
    现阶段因为后端会直接返回 atPersonList，所以直接取 atPersonList.length 即可
    若后面后端遇到性能瓶颈，再让后端不走级联查询 atPersonList，由 node 端去查询数量：见 endpointQueryService.getAtPersonListCount
  `
  })
  atPersonListCount?: number
}

@ObjectType({
  implements: [BasicEndPoint]
})
export class WeComEndPoint extends BasicEndPoint {
  @Field(() => Boolean)
  atAll: boolean

  @Field(() => String, { nullable: true })
  url?: string

  @Field(() => [AtPersonListItem], { nullable: true })
  atPersonList?: AtPersonListItem[]

  @Field(() => [String], { nullable: true })
  atPersonUserIds?: string[]

  @Field(() => Float, {
    nullable: true,
    description: `
      指定人员的数量：
      现阶段因为后端会直接返回 atPersonList，所以直接取 atPersonList.length 即可
      若后面后端遇到性能瓶颈，再让后端不走级联查询 atPersonList，由 node 端去查询数量：见 endpointQueryService.getAtPersonListCount
`
  })
  atPersonListCount?: number
}

@ObjectType()
export class EmailAddress {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  emailAddress: string

  @Field(() => String)
  endpointUuid: string

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string
}

@ObjectType()
export class Receiver {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  type: string

  @Field(() => String)
  phoneNumber: string

  @Field(() => String)
  endpointUuid: string

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string
}

//我也不知道这个是干嘛的，为了保留原有逻辑
@ObjectType()
export class SmsAK {
  @Field(() => String, { nullable: true })
  akey?: string
}

@ObjectType({
  implements: [BasicEndPoint]
})
export class SmsEndPoint extends BasicEndPoint {
  @Field(() => [Receiver])
  receivers: Receiver[]

  @Field(() => SmsAK)
  accessKey?: SmsAK
}

@ObjectType({
  implements: [BasicEndPoint]
})
export class MicrosoftTeamsEndPoint extends BasicEndPoint {
  @Field(() => String, { nullable: true })
  url?: string
}

@ObjectType()
export class Platform {
  @Field(() => String, { description: '资源的UUID，唯一标示该资源' })
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => Int, { nullable: true })
  snmpPort?: number

  @Field(() => String, { nullable: true })
  snmpAddress?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType({
  implements: [BasicEndPoint]
})
export class EmailEndPoint extends BasicEndPoint {
  @Field(() => [EmailAddress])
  emailAddresses: EmailAddress[]

  @Field(() => Platform, { nullable: true })
  platform?: Platform
}

@ObjectType({
  implements: [BasicEndPoint]
})
export class SnmpTrapEndPoint extends BasicEndPoint {
  @Field(() => Platform, { nullable: true })
  platform?: Platform
}

export const EndPoint = createUnionType({
  name: 'EndPoint',
  types: () => [
    HttpEndPoint,
    EmailEndPoint,
    SmsEndPoint,
    DingTalkEndPoint,
    MicrosoftTeamsEndPoint,
    SnmpTrapEndPoint,
    FeiShuEndPoint,
    WeComEndPoint
  ],
  resolveType: value => {
    const { type } = value
    if (type === EndPointType.Email) {
      return EmailEndPoint
    }
    if (type === EndPointType.DingTalk) {
      return DingTalkEndPoint
    }
    if (type === EndPointType.SYSTEM_HTTP || type === EndPointType.HTTP) {
      return HttpEndPoint
    }
    if (type === EndPointType.AliyunSms) {
      return SmsEndPoint
    }
    if (type === EndPointType.MicrosoftTeams) {
      return MicrosoftTeamsEndPoint
    }
    if (type === EndPointType.SNMP) {
      return SnmpTrapEndPoint
    }
    if (type === EndPointType.FeiShu) {
      return FeiShuEndPoint
    }
    if (type === EndPointType.WeCom) {
      return WeComEndPoint
    }
  }
})

@ObjectType()
export class QueryEndPointResp {
  @Field(() => [EndPoint], { nullable: true })
  list?: (typeof EndPoint)[]

  @Field(() => Int, { nullable: true })
  total?: number
}

@ObjectType()
export class EndPointEmailAddress {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  emailAddress?: string

  @Field(() => String, { nullable: true })
  endpointUuid?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}
@ObjectType()
export class QueryEndPointEmailAddressResp {
  @Field(() => [EndPointEmailAddress], { nullable: true })
  list?: EndPointEmailAddress[]

  @Field(() => Int, { nullable: true })
  total?: number
}

@ObjectType()
export class EndPointSmsAddress {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  phoneNumber?: string

  @Field(() => String, { nullable: true })
  endpointUuid?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}
@ObjectType()
export class QueryEndPointSmsAddressList {
  @Field(() => [EndPointSmsAddress], { nullable: true })
  list?: EndPointSmsAddress[]

  @Field(() => Int, { nullable: true })
  total?: number
}
