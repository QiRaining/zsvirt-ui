import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'

import { UserGroup } from './user-group.model'

@Injectable()
export class UserGroupDataloader extends SimpleDataloaderFactory<UserGroup>({
  tableName: 'UserGroup'
}) {}
