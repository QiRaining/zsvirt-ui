import { registerEnumType } from '@nestjs/graphql'

export enum GlobalIdentityEnum {
  ADMIN_UUID = '36c27e8ff05c4780bf6d2fa65700f22e'
}

registerEnumType(GlobalIdentityEnum, {
  name: 'GlobalIdentityEnum'
})
