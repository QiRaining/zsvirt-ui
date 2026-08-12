import { Field, ObjectType, ArgsType } from '@nestjs/graphql'

@ObjectType()
export class DashboardHomepageLayoutsConfig {
  @Field(() => String, { nullable: true })
  userId: string

  @Field(() => String, { nullable: true })
  layoutConfig: string
}

@ObjectType()
export class DashboardWelcomeConfig {
  @Field(() => String, { nullable: true })
  userId: string

  @Field(() => String, { nullable: true })
  welcomeConfig: string
}
