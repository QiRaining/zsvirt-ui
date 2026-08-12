import { Inject, Injectable } from '@nestjs/common'
import * as _ from 'lodash'
import { orderBy } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { CheckVolumeSnapshotGroupAvailabilityAction } from '@/api/zstack/CheckVolumeSnapshotGroupAvailabilityAction'
import { QueryVolumeSnapshotGroupAction } from '@/api/zstack/QueryVolumeSnapshotGroupAction'
import { QueryVolumeSnapshotTreeAction } from '@/api/zstack/QueryVolumeSnapshotTreeAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp } from '@/common/zql/index'

import { RevertState, SnapshotType } from './resource-snapshot.model'

@Injectable()
export class ResourcesnapshotService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() queryTreeAction: QueryVolumeSnapshotTreeAction
  @Inject() queryGroupAction: QueryVolumeSnapshotGroupAction
  @Inject()
  checkGroupAvailabilityAction: CheckVolumeSnapshotGroupAvailabilityAction

  async querySnapshotTree(param?: QueryAction) {
    // 提取公共操作函数
    const collectGroupUuids = (item: any, groupUuids: string[]) => {
      if (item.inventory.groupUuid) {
        groupUuids.push(item.inventory.groupUuid)
        item.inventory.snapshotType = SnapshotType.Group
      } else {
        item.inventory.snapshotType = SnapshotType.Single
      }

      if (item.children?.length > 0) {
        item.children.forEach((child: any) => collectGroupUuids(child, groupUuids))
        item.children = orderBy(item.children, [o => o.inventory.createDate], ['desc'])
      }
    }

    const mergeGroupInfo = (item: any, groupList: any[], avaiList: any[] = []) => {
      const currentGroupUuid = item.inventory.groupUuid
      if (currentGroupUuid) {
        const group = groupList.find(g => g.uuid === currentGroupUuid)
        const availability = avaiList.find(a => a.uuid === currentGroupUuid)

        if (group) {
          item.inventory.group = {
            name: group.name || '',
            description: group.description,
            createDate: group.createDate,
            lastOpDate: group.lastOpDate,
            snapshotCount: group.snapshotCount,
            vmInstanceUuid: group.vmInstanceUuid,
            ...(availability && {
              revertState: availability.available ? RevertState.Available : RevertState.Unable,
              reason: availability.reason
            })
          }
        }
      }

      item.children?.forEach((child: any) => mergeGroupInfo(child, groupList, avaiList))
    }

    // 通用分块查询函数
    const chunkedQuery = async <T>({
      values,
      chunkSize = 50,
      queryFn
    }: {
      values: string[]
      chunkSize?: number
      queryFn: (chunk: string[]) => Promise<T[]>
    }) => {
      const chunks = _.chunk(values, chunkSize)
      const results = await Promise.all(chunks.map(chunk => queryFn(chunk)))
      return results.flat()
    }

    if (_.isEmpty(param?.conditions)) {
      // 初始查询优化为单个查询
      const zql = ZQL.stringify({
        tableName: 'vmInstance',
        fields: ['uuid'],
        condition: {
          [ZOp.and]: [
            {
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'volumesnapshotGroup',
                    fields: ['vmInstanceUuid']
                  }
                }
              }
            },
            {
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'templatedVminstance',
                    fields: ['uuid']
                  }
                }
              }
            },
            {
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'templatedVminstanceCache',
                    fields: ['cacheVmInstanceUuid']
                  }
                }
              }
            }
          ]
        }
      })

      const { results } = await this.zqlService.call(zql)
      const vmUuids = results?.[0]?.inventories?.map((it: { uuid: string }) => it.uuid) || []

      // 批量查询 VolumeSnapshotGroupRef
      const volumeSnapshotGroups = await chunkedQuery({
        values: vmUuids,
        queryFn: async vmUuidChunk => {
          const zql = ZQL.stringify({
            tableName: 'volumeSnapshotGroupRef',
            fields: ['volumeUuid'],
            condition: {
              deviceId: '0',
              volumeSnapshotGroupUuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'volumeSnapshotGroup',
                    fields: ['uuid'],
                    condition: { vmInstanceUuid: { [ZOp.in]: vmUuidChunk } }
                  }
                }
              }
            }
          })
          const { results } = await this.zqlService.call(zql)
          return results?.[0]?.inventories || []
        }
      })

      const volumeUuids = _.uniq(volumeSnapshotGroups.map((it: any) => it?.volumeUuid))

      // // 批量查询快照树
      const resultList = await chunkedQuery({
        values: volumeUuids,
        queryFn: async chunk => {
          const results = await Promise.all(
            chunk.map(async uuid => {
              const { inventories } = await this.queryTreeAction.call({
                conditions: [{ key: 'volumeUuid', op: ZOp.eq, value: uuid }]
              })
              return inventories || []
            })
          )
          return results.flat()
        }
      })

      // 收集并处理分组信息
      const groupUuids: string[] = []
      resultList.forEach(item => collectGroupUuids(item.tree, groupUuids))

      if (groupUuids.length > 0) {
        const groupList = await chunkedQuery({
          values: groupUuids,
          queryFn: async uuidChunk => {
            const results = await chunkedQuery({
              values: uuidChunk,
              queryFn: async uuidChunk => {
                const { inventories } = await this.queryGroupAction.call({
                  conditions: [{ key: 'uuid', op: ZOp.in, values: uuidChunk }]
                })
                return inventories || []
              }
            })
            return results.flat()
          }
        })

        resultList.forEach(item => mergeGroupInfo(item.tree, groupList))
      }

      return { list: resultList, total: resultList.length }
    } else {
      // 带条件查询分支
      const { inventories: treeList = [], total } = await this.queryTreeAction.call({
        replyWithCount: true,
        ...param
      })

      const groupUuids: string[] = []
      treeList.forEach(item => collectGroupUuids(item.tree, groupUuids))

      if (groupUuids.length > 0) {
        const [groupList, avaiList] = await Promise.all([
          chunkedQuery({
            values: groupUuids,
            queryFn: async uuidChunk => {
              const results = await chunkedQuery({
                values: uuidChunk,
                queryFn: async uuidChunk => {
                  const { inventories } = await this.queryGroupAction.call({
                    conditions: [{ key: 'uuid', op: ZOp.in, values: uuidChunk }]
                  })
                  return inventories || []
                }
              })
              return results.flat()
            }
          }),
          this.checkGroupAvailabilityAction
            .call({ uuids: groupUuids })
            .then(res => res.results || [])
        ])

        treeList.forEach(item => mergeGroupInfo(item.tree, groupList, avaiList))
      }

      return { list: treeList, total }
    }
  }
}
