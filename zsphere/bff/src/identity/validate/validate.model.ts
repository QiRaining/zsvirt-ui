import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class ValidatePassword {
  @Field(() => Boolean, { nullable: true })
  deleteAble?: boolean
}
