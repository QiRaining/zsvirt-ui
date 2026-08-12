import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import DataLoader from 'dataloader'
import { cloneDeep, remove } from 'lodash'

import { conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetAuditDataAction } from '@/api/zstack/GetAuditDataAction'
import { GetResourceNamesAction } from '@/api/zstack/GetResourceNamesAction'
import { GetTaskProgressAction } from '@/api/zstack/GetTaskProgressAction'
import { QueryAccountAction } from '@/api/zstack/QueryAccountAction'
import { QueryLongJobAction } from '@/api/zstack/QueryLongJobAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZsActionApi } from '@/model/zs-action-api.model'
import { ZsActionTask } from '@/model/zs-action-task.model'
import { ZsAction } from '@/model/zs-action.model'
import { ZsLongJob } from '@/model/zs-long-job.model'
import { DataProtectionService } from '@/zstack-cloud-code/crypto-compliance/data-protection/data-protection.service'

@Injectable()
export class SystemSchedulingTaskService extends ActionService {
  @InjectModel(ZsAction) private zsAction: typeof ZsAction
  @InjectModel(ZsActionTask) private zsActionTask: typeof ZsActionTask
  @InjectModel(ZsActionApi) private zsActionApi: typeof ZsActionApi
  @InjectModel(ZsLongJob) private zsLongjob: typeof ZsLongJob
  @Inject() getResourceNameAction: GetResourceNamesAction
  @Inject() getAuditDataAction: GetAuditDataAction
  @Inject() queryAccountAction: QueryAccountAction
  @Inject() queryLongJobAction: QueryLongJobAction
  @Inject() ZqlService: ZQLService
  @Inject() dataProtectionService: DataProtectionService
  @Inject() getTaskProgressAction: GetTaskProgressAction
  @Inject() zqlService: ZQLService

  private taskProgressDataloader

  constructor() {
    super()
    this.taskProgressDataloader = new DataLoader(this._taskProgressDataloader)
  }

  async getTaskProgress(apiID) {
    return this.taskProgressDataloader.load(apiID)
  }

  _taskProgressDataloader = async apiIds => {
    const allTaskProgress = await Promise.all(
      apiIds?.map(apiId =>
        this.getTaskProgressAction.call({
          apiId
        })
      )
    )

    return allTaskProgress?.map((task: any) =>
      Number.isNaN(task?.inventories?.[0]?.content) ? 0 : Number(task?.inventories?.[0]?.content)
    )
  }

  async queryAction(queryParams: QueryAction) {
    const operatingResourcesCondition = this.spliceFilterKeyCondition(
      queryParams,
      'operatingResources',
      this.getOperatingResourcesCondition
    )

    let zqlObj: any = {
      tableName: 'Longjob'
    }
    if (operatingResourcesCondition) {
      zqlObj.condition = operatingResourcesCondition
    }

    zqlObj = QueryConditionTranslator.mergeQueryAction(queryParams, zqlObj)

    const zql = ZQL.stringify(zqlObj)

    console.log('zql', zql)
    const {
      results: [{ inventories: list = [], total = 0 } = {}]
    } = await this.zqlService.call(zql)

    return {
      list,
      total
    }
  }

  spliceFilterKeyCondition(
    queryAction: QueryAction,
    filterKey: string,
    getFilterCondition?: (conditon: any) => any
  ) {
    const { conditions } = queryAction

    const filterCondition = remove(conditions, ({ key }: { key: string }) => key === filterKey)?.[0]
    if (!filterCondition) {
      return null
    }
    return getFilterCondition?.(filterCondition)
  }

  getOperatingResourcesCondition(condition: any) {
    const { value } = condition

    return {
      [ZOp.or]: [
        {
          targetResourceUuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'Volume',
                fields: ['uuid'],
                type: 'Root',
                condition: {
                  vmInstanceUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'VmInstance',
                        fields: ['uuid'],
                        condition: {
                          name: {
                            [ZOp.like]: value
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
          targetResourceUuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'Volume',
                fields: ['uuid'],
                condition: {
                  name: {
                    [ZOp.like]: value
                  }
                }
              }
            }
          }
        }
      ]
    }
  }
}
