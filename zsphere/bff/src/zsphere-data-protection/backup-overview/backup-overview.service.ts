import { Inject, Injectable } from '@nestjs/common'
import { get as _get, groupBy as _groupBy } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetSchedulerExecutionReportAction } from '@/api/zstack/GetSchedulerExecutionReportAction'
import { SchedulerJobGroupState } from '@/common/enum'
import ZQL, { ZOp, ZQLAction } from '@/common/zql/index'

enum CONSTANT {
  'database_resource_uuid' = '7ae6456c0b01324dae6d4bef358a5772'
}

@Injectable()
export class BackupOverviewQueryService {
  @Inject()
  zqlService: ZQLService
  @Inject()
  getSchedulerExecutionReportAction: GetSchedulerExecutionReportAction

  async getMissionOverviewStatistics() {
    const zqlObjList = [
      {
        action: ZQLAction.COUNT,
        tableName: 'Schedulerjobgroup'
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'Schedulerjobgroup',
        condition: {
          jobType: {
            [ZOp.in]: ['vmBackup', 'rootVolumeBackup']
          }
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'Schedulerjobgroup',
        condition: {
          jobType: 'volumeBackup'
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'Schedulerjob',
        condition: {
          targetResourceUuid: CONSTANT.database_resource_uuid
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'Schedulerjobgroup',
        condition: {
          state: SchedulerJobGroupState.Enabled
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'Schedulerjobgroup',
        condition: {
          state: SchedulerJobGroupState.Disabled
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'Schedulerjob',
        condition: {
          targetResourceUuid: CONSTANT.database_resource_uuid,
          state: SchedulerJobGroupState.Enabled
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'Schedulerjob',
        condition: {
          targetResourceUuid: CONSTANT.database_resource_uuid,
          state: SchedulerJobGroupState.Disabled
        }
      },
      {
        // vmBackUpTaskCount
        action: ZQLAction.COUNT,
        tableName: 'VmInstance',
        condition: {
          state: {
            [ZOp.ne]: 'Destroyed'
          },
          type: 'UserVm',
          hypervisorType: 'KVM',
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'Volume',
                fields: ['vmInstanceUuid'],
                condition: {
                  uuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'SchedulerJob',
                        fields: ['targetResourceUuid'],
                        condition: {
                          jobClassName: {
                            [ZOp.in]: [
                              'org.zstack.storage.backup.CreateVmBackupJob',
                              'org.zstack.storage.backup.CreateRootVolumeBackupJob'
                            ] // 云主机整机备份，云主机备份（不带云盘），纯云盘备份不管
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        // vmCdpTaskCount
        action: ZQLAction.COUNT,
        tableName: 'VmInstance',
        condition: {
          state: {
            [ZOp.ne]: 'Destroyed'
          },
          type: 'UserVm',
          hypervisorType: 'KVM',
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'CdpTaskResourceRef',
                fields: ['resourceUuid'],
                condition: {
                  resourceType: 'VmInstanceVO'
                }
              }
            }
          }
        }
      },
      {
        // vmNoneTaskCount
        action: ZQLAction.COUNT,
        tableName: 'VmInstance',
        condition: {
          state: {
            [ZOp.ne]: 'Destroyed'
          },
          type: 'UserVm',
          hypervisorType: 'KVM',
          [ZOp.and]: [
            {
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'CdpTaskResourceRef',
                    fields: ['resourceUuid'],
                    condition: {
                      resourceType: 'VmInstanceVO'
                    }
                  }
                }
              }
            },
            {
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'Volume',
                    fields: ['vmInstanceUuid'],
                    condition: {
                      uuid: {
                        [ZOp.in]: {
                          [ZOp.query]: {
                            tableName: 'SchedulerJob',
                            fields: ['targetResourceUuid'],
                            condition: {
                              jobClassName: {
                                [ZOp.in]: [
                                  'org.zstack.storage.backup.CreateVmBackupJob',
                                  'org.zstack.storage.backup.CreateRootVolumeBackupJob'
                                ] // 云主机整机备份，云主机备份（不带云盘），纯云盘备份不管
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          ]
        }
      },
      {
        // volumeBackUpTaskCount
        action: ZQLAction.COUNT,
        tableName: 'Volume',
        condition: {
          status: {
            [ZOp.notIn]: ['NotInstantiated', 'Deleted']
          },
          format: {
            [ZOp.ne]: 'vmtx'
          },
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'SchedulerJob',
                fields: ['targetResourceUuid'],
                condition: {
                  jobClassName: 'org.zstack.storage.backup.CreateVolumeBackupJob'
                }
              }
            }
          }
        }
      },
      {
        // volumeOtherTaskCount
        action: ZQLAction.COUNT,
        tableName: 'Volume',
        condition: {
          status: {
            [ZOp.notIn]: ['NotInstantiated', 'Deleted']
          },
          format: {
            [ZOp.ne]: 'vmtx'
          },
          type: 'Data',
          [ZOp.or]: [
            {
              vmInstanceUuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'CdpTaskResourceRef',
                    fields: ['resourceUuid'],
                    condition: {
                      resourceType: 'VmInstanceVO'
                    }
                  }
                }
              }
            },
            {
              vmInstanceUuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'Volume',
                    fields: ['vmInstanceUuid'],
                    condition: {
                      uuid: {
                        [ZOp.in]: {
                          [ZOp.query]: {
                            tableName: 'SchedulerJob',
                            fields: ['targetResourceUuid'],
                            condition: {
                              jobClassName: 'org.zstack.storage.backup.CreateVmBackupJob' //  云主机备份任务
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          ],
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'SchedulerJob',
                fields: ['targetResourceUuid'],
                condition: {
                  jobClassName: 'org.zstack.storage.backup.CreateVolumeBackupJob'
                }
              }
            }
          }
        }
      },
      {
        // volumeNoneTaskCount
        action: ZQLAction.COUNT,
        tableName: 'Volume',
        condition: {
          status: {
            [ZOp.notIn]: ['NotInstantiated', 'Deleted']
          },
          format: {
            [ZOp.ne]: 'vmtx'
          },
          type: 'Data',
          [ZOp.or]: [
            {
              vmInstanceUuid: {
                // 没有挂载云主机的云盘不考虑。
                [ZOp.is]: null
              }
            },
            {
              [ZOp.and]: [
                {
                  vmInstanceUuid: {
                    [ZOp.notIn]: {
                      [ZOp.query]: {
                        tableName: 'CdpTaskResourceRef',
                        fields: ['resourceUuid'],
                        condition: {
                          resourceType: 'VmInstanceVO'
                        }
                      }
                    }
                  }
                },
                {
                  vmInstanceUuid: {
                    [ZOp.notIn]: {
                      [ZOp.query]: {
                        tableName: 'Volume',
                        fields: ['vmInstanceUuid'],
                        condition: {
                          uuid: {
                            [ZOp.in]: {
                              [ZOp.query]: {
                                tableName: 'SchedulerJob',
                                fields: ['targetResourceUuid'],
                                condition: {
                                  jobClassName: 'org.zstack.storage.backup.CreateVmBackupJob' //  云主机备份任务
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              ]
            }
          ],
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'SchedulerJob',
                fields: ['targetResourceUuid'],
                condition: {
                  jobClassName: 'org.zstack.storage.backup.CreateVolumeBackupJob'
                }
              }
            }
          }
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'VmInstance',
        condition: {
          state: {
            [ZOp.ne]: 'Destroyed'
          },
          type: 'UserVm',
          hypervisorType: 'KVM'
        }
      },
      {
        // volumeCount
        action: ZQLAction.COUNT,
        tableName: 'Volume',
        condition: {
          status: {
            [ZOp.notIn]: ['NotInstantiated', 'Deleted']
          },
          format: {
            [ZOp.ne]: 'vmtx'
          },
          type: 'Data'
        }
      }
    ]

    const zql = ZQL.multStringify(zqlObjList)

    const resp = await this.zqlService.call(zql)

    const countResults = resp.results.map(it => it.total)

    const totalTaskCount = _get(countResults, 0, 0) + _get(countResults, 3, 0)
    const vmTaskCount = _get(countResults, 1, 0)
    const volumeTaskCount = _get(countResults, 2, 0)
    const dateBaseCount = _get(countResults, 3, 0)
    const enabledCount = _get(countResults, 4, 0) + _get(countResults, 6, 0)
    const disabledCount = _get(countResults, 5, 0) + _get(countResults, 7, 0)

    const vmBackUpTaskCount = _get(countResults, 8, 0)
    const vmCdpTaskCount = _get(countResults, 9, 0)
    const vmNoneTaskCount = _get(countResults, 10, 0)
    const volumeBackUpTaskCount = _get(countResults, 11, 0)
    const volumeOtherTaskCount = _get(countResults, 12, 0)
    const volumeNoneTaskCount = _get(countResults, 13, 0)
    const vmCount = _get(countResults, 14, 0)
    const volumeCount = _get(countResults, 15, 0)

    return {
      totalTaskCount,
      vmTaskCount,
      volumeTaskCount,
      dateBaseCount,
      enabledCount,
      disabledCount,
      vmCount,
      volumeCount,
      vmBackUpTaskCount,
      vmCdpTaskCount,
      vmNoneTaskCount,
      volumeBackUpTaskCount,
      volumeOtherTaskCount,
      volumeNoneTaskCount
    }
  }

  async querySchedulerReport(params) {
    return await this.getSchedulerExecutionReportAction.call(params)
  }

  async queryOverviewSchedulerJobHistory(params) {
    const { minStartTime, minId, startTime, endTime, schedulerJobTypes = [] } = params
    let baseCondition = Object.create(null)
    if (minId && minStartTime) {
      baseCondition = {
        [ZOp.and]: [
          {
            [ZOp.or]: [
              {
                [ZOp.and]: [
                  {
                    startTime: {
                      [ZOp.gte]: minStartTime
                    }
                  },
                  {
                    id: {
                      [ZOp.lt]: minId
                    }
                  },
                  {
                    startTime: {
                      [ZOp.gte]: startTime
                    }
                  },
                  {
                    startTime: {
                      [ZOp.lte]: endTime
                    }
                  }
                ]
              },
              {
                [ZOp.and]: [
                  {
                    startTime: {
                      [ZOp.lt]: minStartTime
                    }
                  },
                  {
                    id: {
                      [ZOp.lt]: minId
                    }
                  },
                  {
                    startTime: {
                      [ZOp.gte]: startTime
                    }
                  },
                  {
                    startTime: {
                      [ZOp.lte]: endTime
                    }
                  }
                ]
              }
            ]
          },
          {
            jobType: {
              [ZOp.in]: schedulerJobTypes
            }
          }
        ]
      }
    } else {
      baseCondition = {
        [ZOp.and]: [
          {
            startTime: {
              [ZOp.gte]: startTime
            }
          },
          {
            startTime: {
              [ZOp.lte]: endTime
            }
          },
          {
            jobType: {
              [ZOp.in]: schedulerJobTypes
            }
          }
        ]
      }
    }
    const zqlObj = {
      tableName: 'Schedulerjobhistory',
      condition: {
        fireInstanceId: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'Schedulerjobhistory',
              fields: ['fireInstanceId'],
              condition: baseCondition
            }
          }
        }
      },
      groupBy: 'fireInstanceId',
      orderBy: 'id',
      orderDirection: 'desc',
      limit: 10
    } as any
    const { results = [] } = await this.zqlService.call(ZQL.stringify(zqlObj))
    const getJSONParsedRequestDump = item => {
      try {
        return JSON.parse(item)
      } catch (error) {
        return {}
      }
    }
    const list = results?.[0]?.inventories ?? []
    const isFull = item => _get(getJSONParsedRequestDump(item.requestDump), ['mode']) === 'full'
    const groupByMap = _groupBy(list, 'fireInstanceId')
    const fireInstanceIdUniqueList = [...new Set(list.map(it => it.fireInstanceId))]
    const resultList = []
    fireInstanceIdUniqueList.forEach((key: string) => {
      const jobList = groupByMap[key].sort(
        (a, b) => Date.parse(b.startTime) - Date.parse(a.startTime)
      )
      const last = jobList?.[0]
      const first = jobList?.[jobList.length - 1]
      resultList.push({
        uuid: first.id,
        id: first.id,
        resourceCount: jobList.length,
        startTime: new Date(first.startTime).getTime(),
        mode:
          first.targetResourceUuid === CONSTANT.database_resource_uuid
            ? 'full'
            : isFull(first)
              ? 'full'
              : 'incremental',
        endTime: Date.parse(last?.startTime) + last?.executeTime * 1000,
        duration: Math.max(...jobList.map(v => v.executeTime)),
        successCount: jobList.filter(v => v.success).length,
        failCount: jobList.filter(v => v.resultDump !== 'Running' && !v.success).length,
        runningCount: jobList.filter(v => v.resultDump === 'Running').length,
        jobList: jobList,
        fireInstanceId: first.fireInstanceId,
        schedulerJobGroupUuid: first.schedulerJobGroupUuid,
        jobType: first.jobType,
        type: first.targetResourceUuid === CONSTANT.database_resource_uuid ? 'database' : 'resource'
      })
    })
    return resultList
  }
}
