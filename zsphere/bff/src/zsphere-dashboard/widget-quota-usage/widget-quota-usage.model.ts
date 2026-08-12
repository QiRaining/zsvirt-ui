import { Field, ObjectType, ArgsType, Float } from '@nestjs/graphql'

@ArgsType()
export class WidgetQuotaUsageInput {
  @Field(() => String, { nullable: true })
  uuid: string
}

@ObjectType()
export class WidgetQuotaUsageItem {
  @Field(() => String, { nullable: true })
  name: string

  @Field(() => Float, { nullable: true })
  used: number

  @Field(() => Float, { nullable: true })
  total: number
}

@ObjectType()
export class WidgetQuotaUsage {
  @Field(() => [WidgetQuotaUsageItem], { nullable: true })
  computing: WidgetQuotaUsageItem[]

  @Field(() => [WidgetQuotaUsageItem], { nullable: true })
  storage: WidgetQuotaUsageItem[]

  @Field(() => [WidgetQuotaUsageItem], { nullable: true })
  network: WidgetQuotaUsageItem[]

  @Field(() => [WidgetQuotaUsageItem], { nullable: true })
  other: WidgetQuotaUsageItem[]
}
