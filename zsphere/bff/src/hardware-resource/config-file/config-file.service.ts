import { Inject, Injectable } from '@nestjs/common'

import { Op, extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ScanVmInstanceMetadataFromPrimaryStorageAction } from '@/api/zstack/ScanVmInstanceMetadataFromPrimaryStorageAction'
import { VmInstanceQueryService } from '@/zsphere-resource/vm-instance/vm-instance-query/vm-instance-query.service'

import { ConfigFile, ConfigFileList } from './config-file.model'

@Injectable()
export class ConfigFileService {
  @Inject()
  vmInstanceQueryService: VmInstanceQueryService

  @Inject()
  scanVmInstanceMetadataFromPrimaryStorageAction: ScanVmInstanceMetadataFromPrimaryStorageAction

  async checkVmInstanceExists(vmInstanceUuid: string): Promise<boolean> {
    try {
      const result = await this.vmInstanceQueryService.get({
        conditions: [
          {
            key: 'uuid',
            op: Op.eq,
            value: vmInstanceUuid
          }
        ]
      })
      return (result?.list?.length ?? 0) > 0
    } catch {
      return false
    }
  }

  async configFileList(params: {
    conditions?: any[]
    limit?: number
    start?: number
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
  }): Promise<ConfigFileList> {
    return await this.getConfigFileList(params)
  }

  async getConfigFileList(params: {
    conditions?: any[]
    limit?: number
    start?: number
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
  }) {
    const { conditions = [], start = 0, limit } = params
    const [, extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'PrimaryStorageUuid',
      'name',
      'path'
    ])

    const primaryStorageUuid = extraConditionMap.PrimaryStorageUuid?.value

    if (!primaryStorageUuid) {
      return { list: [], total: 0 }
    }

    const result = await this.scanVmInstanceMetadataFromPrimaryStorageAction.call({
      uuid: primaryStorageUuid
    })

    const list: ConfigFile[] = (result?.vmInstanceMetadata ?? []).map(item => ({
      uuid: item.vmUuid,
      name: item.vmName,
      path: item.metadataPath,
      architecture: item.architecture,
      hostUuid: item.hostUuid
    }))

    // 过滤：应用搜索条件（name/path 模糊匹配）
    const extraConditions: Array<(val: ConfigFile) => boolean> = []

    if (extraConditionMap.name?.value) {
      const name = String(extraConditionMap.name.value).toLocaleLowerCase()
      extraConditions.push(val => val.name?.toLocaleLowerCase().includes(name))
    }

    if (extraConditionMap.path?.value) {
      const path = String(extraConditionMap.path.value).toLocaleLowerCase()
      extraConditions.push(val => val.path?.toLocaleLowerCase().includes(path))
    }

    const data = list.filter(val => extraConditions.every(fn => fn(val)))

    // 排序
    if (params.sortBy && params.sortDirection) {
      data.sort((a, b) => {
        const aVal = (a as any)[params.sortBy!] ?? ''
        const bVal = (b as any)[params.sortBy!] ?? ''
        const dir = params.sortDirection === 'desc' ? -1 : 1
        return aVal.localeCompare(bVal) * dir
      })
    }

    const total = data.length

    // 分页
    const pagedList = data.slice(start, limit ? start + limit : total)

    return {
      list: pagedList,
      total
    }
  }
}
