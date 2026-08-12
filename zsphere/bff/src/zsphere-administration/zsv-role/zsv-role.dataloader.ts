import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'

import { ZsvRole } from './zsv-role.model'

@Injectable()
export class ZsvRoleDataloader extends SimpleDataloaderFactory<ZsvRole>({
  tableName: 'ZsvRole'
}) {}
