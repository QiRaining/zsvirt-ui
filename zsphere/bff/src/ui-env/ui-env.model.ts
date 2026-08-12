import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class UIEnvInfo {
  @Field(() => Boolean)
  isOpenPlatform: boolean
}

@ObjectType()
export class BootstrapDeployedInfo {
  @Field(() => Boolean)
  isBootstrap: boolean
}
