import { Injectable, Inject } from '@nestjs/common'
import { find as _find, pick as _pick, reduce as _reduce, map as _map } from 'lodash'
import * as _ from 'lodash'

import { Op, conditionsToObject, Condition as ICondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetResourceConfigAction } from '@/api/zstack/GetResourceConfigAction'
import { UpdateResourceConfigAction } from '@/api/zstack/UpdateResourceConfigAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionSendResp } from '@/common/model/action-send-resp.model'
import ZQL, { ZOp } from '@/common/zql/index'
import { genUuid } from '@/utils'

import { GlobalConfig } from '../global-config/global-config.model'
import { DependentResourceType, ResourceConfig } from './resource-config.model'

@Injectable()
export class ResourceConfigService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() getResourceConfig: GetResourceConfigAction
  @Inject() updateResourceConfigAction: UpdateResourceConfigAction

  async queryResourceConfigInPage(queryArgs: QueryAction) {
    const conditionsMap = conditionsToObject(queryArgs.conditions)
    const extraConditionsMap = conditionsToObject(queryArgs.extraConditions) as {
      resourceConfigList: any
    }
    const candidateKeys = ['nameList', 'categoryList', 'resourceUuid']
    const { nameList, categoryList, resourceUuid } = _pick(conditionsMap, candidateKeys) as {
      nameList: string[]
      categoryList: string[]
      resourceUuid: string
    }

    const list = await this._query(resourceUuid, categoryList, nameList)

    // const zqlCondition = [
    //   {
    //     tableName: 'GlobalConfig', // 全局配置
    //     condition: {
    //       name: {
    //         [ZOp.in]: nameList
    //       },
    //       category: {
    //         [ZOp.in]: categoryList
    //       }
    //     }
    //   },
    //   {
    //     tableName: 'ResourceConfig', // 资源配置，如果资源没有被设过，则该数据库表中是没有数据的。
    //     condition: {
    //       resourceUuid: resourceUuid,
    //       name: {
    //         [ZOp.in]: nameList
    //       },
    //       category: {
    //         [ZOp.in]: categoryList
    //       }
    //     }
    //   }
    // ]

    // const zql = ZQL.multStringify(zqlCondition)
    // const resp = await this.zqlService.call(zql)

    // // 全局配置
    // const globalConfigInfoMap = _.reduce(
    //   _.get(resp, ['results', '0', 'inventories'], []),
    //   (obj, it) => {
    //     obj[`${it?.category}.${it?.name}`] = {
    //       ...it,
    //       globalConfigValue: it?.value,
    //       dependentResourceType: DependentResourceType.GlobalConfig // 全局配置
    //     }
    //     return obj
    //   },
    //   {} as { [key: string]: GlobalConfig }
    // )

    // const configList = _.keys(globalConfigInfoMap)

    // // 资源配置
    // const resourceConfigInfoMap = _.reduce(
    //   _.get(resp, ['results', '1', 'inventories'], []),
    //   (obj, it) => {
    //     obj[`${it?.category}.${it?.name}`] = {
    //       ...it,
    //       globalConfigValue: _.get(
    //         globalConfigInfoMap[`${it?.category}.${it?.name}`],
    //         'value'
    //       ),
    //       dependentResourceType: it?.resourceType // resourceUuid 所属资源类型
    //     }
    //     return obj
    //   },
    //   {} as { [key: string]: ResourceConfig }
    // )

    // const resourceConfigList = _.keys(resourceConfigInfoMap)

    // const noResourceConfigList = _.difference(configList, resourceConfigList)

    // if (noResourceConfigList?.length > 0) {
    //   try {
    //     await Promise.allSettled(
    //       noResourceConfigList.map(categoryName => {
    //         const config = _.get(globalConfigInfoMap, categoryName)

    //         return this.getResourceConfig
    //           .call({
    //             name: config?.name,
    //             category: config?.category,
    //             resourceUuid: resourceUuid
    //           })
    //           .then(resp => {
    //             const effectiveConfigs = _.get(resp, 'effectiveConfigs', [])
    //             let resourceType = DependentResourceType.GlobalConfig // effectiveConfigs 不存在的话表示使用的是全局配置。

    //             if (effectiveConfigs?.length > 0) {
    //               // 随机找一个，其实应该按照Host PrimaryStorage Cluster等资源顺序来查找。目前Host 没有资源配置。
    //               // 就当前代码逻辑，effectiveConfigs 要么不存在，要么只有一个，其实取 effectiveConfigs[0] 即可。
    //               const effectiveConfig = _find(
    //                 effectiveConfigs,
    //                 it => it?.value === resp?.value
    //               )

    //               resourceType = effectiveConfig?.resourceType || resourceType
    //             }

    //             _.merge(
    //               resourceConfigInfoMap,
    //               {
    //                 [categoryName]: _.get(globalConfigInfoMap, [categoryName])
    //               },
    //               {
    //                 [categoryName]: {
    //                   resourceUuid,
    //                   value: resp?.value,
    //                   uuid: genUuid(),
    //                   globalConfigValue: _.get(globalConfigInfoMap, [
    //                     categoryName,
    //                     'value'
    //                   ]),
    //                   dependentResourceType: resourceType
    //                 }
    //               }
    //             )
    //           })
    //       })
    //     )
    //   } catch (error) {
    //     console.log(error)
    //   }
    // }

    // // let list = resp.results[0].inventories.map(item => {
    // //   const resourceConfig = _find(
    // //     resp.results[1]?.inventories,
    // //     it => it?.name === item.name && it?.category === item.category
    // //   )

    // //   // 云主机的规格热修改和网卡多队列需要获取集群配置
    // //   let clusterConfig
    // //   if (
    // //     item.category === 'vm' &&
    // //     ['numa', 'nicMultiQueueNum'].includes(item.name)
    // //   ) {
    // //     clusterConfig = _find(
    // //       resp.results[2]?.inventories,
    // //       it => it?.name === item.name && it?.category === item.category
    // //     )
    // //   }

    // //   // 资源配置
    // //   if (resourceConfig) {
    // //     return {
    // //       ...resourceConfig,
    // //       globalConfigValue: item.value,
    // //       isGlobalConfig: false
    // //     }
    // //   }
    // //   // 集群配置
    // //   if (clusterConfig) {
    // //     return {
    // //       ...clusterConfig,
    // //       globalConfigValue: item.value,
    // //       isGlobalConfig: false
    // //     }
    // //   }
    // //   // 全局配置
    // //   return {
    // //     ...item,
    // //     uuid: genUuid(),
    // //     resourceUuid,
    // //     globalConfigValue: item.value,
    // //     isGlobalConfig: true
    // //   }
    // // })
    // // const resourceObj = _reduce(
    // //   list,
    // //   (obj, item) => {
    // //     if (!obj[item.category]) {
    // //       obj[item.category] = {
    // //         [item.name]: item
    // //       }
    // //     } else {
    // //       obj[item.category][item.name] = item
    // //     }
    // //     return obj
    // //   },
    // //   {}
    // // )
    // // if (extraConditionsMap?.resourceConfigList) {
    // //   list = _map(
    // //     JSON.parse(extraConditionsMap?.resourceConfigList),
    // //     item => resourceObj[item.category][item.name]
    // //   )
    // // }
    return { list }
  }

  _query = async (resourceUuid, categoryList = [], nameList = []) => {
    const zqlCondition = [
      {
        tableName: 'GlobalConfig', // 全局配置
        condition: {
          name: {
            [ZOp.in]: nameList
          },
          category: {
            [ZOp.in]: categoryList
          }
        }
      },
      {
        tableName: 'ResourceConfig', // 资源配置，如果资源没有被设过，则该数据库表中是没有数据的。
        condition: {
          resourceUuid: resourceUuid,
          name: {
            [ZOp.in]: nameList
          },
          category: {
            [ZOp.in]: categoryList
          }
        }
      }
    ]

    const zql = ZQL.multStringify(zqlCondition)
    const resp = await this.zqlService.call(zql)

    // 全局配置
    const globalConfigInfoMap = _.reduce(
      _.get(resp, ['results', '0', 'inventories'], []),
      (obj, it) => {
        obj[`${it?.category}.${it?.name}`] = {
          ...it,
          globalConfigValue: it?.value,
          dependentResourceType: DependentResourceType.GlobalConfig // 全局配置
        }
        return obj
      },
      {} as { [key: string]: GlobalConfig }
    )

    const configList = _.keys(globalConfigInfoMap)

    // 资源配置
    const resourceConfigInfoMap = _.reduce(
      _.get(resp, ['results', '1', 'inventories'], []),
      (obj, it) => {
        obj[`${it?.category}.${it?.name}`] = {
          ...it,
          globalConfigValue: _.get(globalConfigInfoMap[`${it?.category}.${it?.name}`], 'value'),
          dependentResourceType: it?.resourceType // resourceUuid 所属资源类型
        }
        return obj
      },
      {} as { [key: string]: ResourceConfig }
    )

    const resourceConfigList = _.keys(resourceConfigInfoMap)

    const noResourceConfigList = _.difference(configList, resourceConfigList)

    if (noResourceConfigList?.length > 0) {
      try {
        await Promise.allSettled(
          noResourceConfigList.map(categoryName => {
            const config = _.get(globalConfigInfoMap, categoryName)

            return this.getResourceConfig
              .call({
                name: config?.name,
                category: config?.category,
                resourceUuid: resourceUuid
              })
              .then(
                resp => {
                  const effectiveConfigs = _.get(resp, 'effectiveConfigs', [])
                  let resourceType = DependentResourceType.GlobalConfig // effectiveConfigs 不存在的话表示使用的是全局配置。

                  if (effectiveConfigs?.length > 0) {
                    // 随机找一个，其实应该按照Host PrimaryStorage Cluster等资源顺序来查找。目前Host 没有资源配置。
                    // 就当前代码逻辑，effectiveConfigs 要么不存在，要么只有一个，其实取 effectiveConfigs[0] 即可。
                    const effectiveConfig = _find(effectiveConfigs, it => it?.value === resp?.value)

                    resourceType = effectiveConfig?.resourceType || resourceType
                  }

                  _.merge(
                    resourceConfigInfoMap,
                    {
                      [categoryName]: _.get(globalConfigInfoMap, [categoryName])
                    },
                    {
                      [categoryName]: {
                        resourceUuid,
                        value: resp?.value,
                        uuid: genUuid(),
                        globalConfigValue: _.get(globalConfigInfoMap, [categoryName, 'value']),
                        dependentResourceType: resourceType
                      }
                    }
                  )
                },
                error => {
                  console.error(error)
                  // resourceConfig 获取当前资源配置失败
                  _.merge(
                    resourceConfigInfoMap,
                    {
                      [categoryName]: _.get(globalConfigInfoMap, [categoryName])
                    },
                    {
                      [categoryName]: {
                        resourceUuid,
                        uuid: genUuid(),
                        globalConfigValue: _.get(globalConfigInfoMap, [categoryName, 'value']),
                        dependentResourceType: DependentResourceType.GlobalConfig
                      }
                    }
                  )
                }
              )
          })
        )
      } catch (error) {
        console.log(error)
      }
    }
    return _.values(resourceConfigInfoMap)
  }
}
