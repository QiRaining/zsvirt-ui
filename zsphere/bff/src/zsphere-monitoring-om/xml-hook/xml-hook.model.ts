import { Field, ObjectType, Float, registerEnumType } from '@nestjs/graphql'

export enum XmlHookType {
  Customization = 'Customization',
  System = 'System'
}

registerEnumType(XmlHookType, {
  name: 'XmlHookType'
})

@ObjectType()
export class XmlHook {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => XmlHookType, { nullable: true })
  type?: XmlHookType

  @Field(() => String, { nullable: true })
  hookScript?: string

  @Field(() => [String], { nullable: true })
  vmUuids?: string[]

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class XMLHookList {
  @Field(() => [XmlHook], { nullable: true })
  list: XmlHook[]

  @Field(() => Float)
  total: number
}
