import { Inject } from '@nestjs/common'
import { Query, Args } from '@nestjs/graphql'
import { pick as _pick } from 'lodash'

import { conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { ActionService } from '@/base/action-service'
import { Condition as ICondition } from '@/common/model/action-query.model'
import ZQL, { ZOp, ZQLAction } from '@/common/zql/index'
import { l2NetworkType } from '@/hardware-resource/l2-network/l2.network.model'

import { QuerySharedResourceInput, QuerySharedResourceResult } from './shared-resource-query'

export class ZsvSharedResourceQueryService extends ActionService {
  @Inject() zqlService: ZQLService

  getSharedResourceList(extraConditions: ICondition[], resourceType: string, isShare = true) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['accountUuid', 'groupUuid', 'sharedType']
    const candidateParams = _pick(conditionsMap, candidateKeys) as {
      accountUuid: string
      groupUuid: string
      sharedType: string
    }

    if (candidateParams.groupUuid) {
      return {
        [isShare ? ZOp.or : ZOp.and]: [
          {
            uuid: {
              [isShare ? ZOp.in : ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'AccountGroupResourceRef',
                  fields: ['resourceUuid'],
                  condition: {
                    groupUuid: candidateParams.groupUuid
                  }
                }
              }
            }
          },
          {
            uuid: {
              [isShare ? ZOp.in : ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'AccountResourceRef',
                  fields: ['resourceUuid'],
                  condition: {
                    resourceType,
                    type: 'SharePublic'
                  }
                }
              }
            }
          }
        ]
      }
    }

    //account里面的用户组
    if (candidateParams.accountUuid && candidateParams.sharedType === 'UserGroup') {
      return {
        [ZOp.or]: [
          {
            uuid: {
              [isShare ? ZOp.in : ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'AccountGroupResourceRef',
                  fields: ['resourceUuid'],
                  condition: {
                    groupUuid: {
                      [ZOp.in]: {
                        [ZOp.query]: {
                          tableName: 'AccountGroupAccountRef',
                          fields: ['groupUuid'],
                          condition: {
                            accountUuid: candidateParams.accountUuid
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
            uuid: {
              [isShare ? ZOp.in : ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'AccountResourceRef',
                  fields: ['resourceUuid'],
                  condition: {
                    resourceType,
                    type: 'SharePublic'
                  }
                }
              }
            }
          }
        ]
      }
    }

    return {
      uuid: {
        [isShare ? ZOp.in : ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'AccountResourceRef',
            fields: ['resourceUuid'],
            condition: {
              resourceType,
              accountPermissionFrom: {
                [ZOp.is]: null
              },
              [ZOp.or]: [
                {
                  [ZOp.and]: {
                    accountUuid: candidateParams.accountUuid,
                    type: {
                      [ZOp.ne]: 'Own'
                    }
                  }
                },
                {
                  type: 'SharePublic'
                }
              ]
            }
          }
        }
      }
    }
  }

  getResourceZqlQueryObj(type: string, accountUuid: string, groupUuid?: string) {
    return {
      tableName: 'AccountResourceRef',
      fields: ['resourceUuid'],
      condition: {
        resourceType: type,
        //accountPermissionFrom 存在代表是用户组共享来的
        accountPermissionFrom: {
          [ZOp.is]: null
        },
        [ZOp.and]: {
          type: 'Share',
          ...(accountUuid ? { accountUuid } : { accountPermissionFrom: groupUuid })
        }
      }
    }
  }

  getResourceZqlQuerybyAccountGroup(accountUuid: string) {
    return {
      tableName: 'AccountGroupResourceRef',
      fields: ['resourceUuid'],
      condition: {
        groupUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'AccountGroupAccountRef',
              fields: ['groupUuid'],
              condition: {
                accountUuid
              }
            }
          }
        }
      }
    }
  }

  addPublicShareCondition = (existingCondition, resourceType) => {
    return {
      [ZOp.or]: [
        existingCondition,
        {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'AccountResourceRef',
                fields: ['resourceUuid'],
                condition: {
                  resourceType,
                  type: 'SharePublic'
                }
              }
            }
          }
        }
      ]
    }
  }

  @Query(() => [QuerySharedResourceResult])
  async zsvSharedResourceList(@Args('input') input: QuerySharedResourceInput) {
    const { accountUuid, groupUuid, sharedType } = input

    const l3NetworkKvmZqlObject = {
      [ZOp.or]: {
        ['l2Network.cluster.hypervisorType']: {
          [ZOp.ne]: 'ESX'
        },
        ['l2Network.uuid']: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'L2NetworkClusterRef',
              fields: ['l2NetworkUuid']
            }
          }
        }
      }
    }

    const createResourceQuery = (
      tableName: string,
      resourceType: string,
      nameAs: string,
      extraConditions = {}
    ) => {
      let condition: any

      let shareCondition: any

      //这里指的是 用户下面的用户组tab
      if (accountUuid && sharedType === 'UserGroup') {
        shareCondition = this.addPublicShareCondition(
          {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: this.getResourceZqlQuerybyAccountGroup(accountUuid)
              }
            }
          },
          resourceType
        )
      } else if (accountUuid) {
        shareCondition = this.addPublicShareCondition(
          {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: this.getResourceZqlQueryObj(resourceType, accountUuid)
              }
            }
          },
          resourceType
        )
      } else if (groupUuid) {
        shareCondition = this.addPublicShareCondition(
          {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'AccountGroupResourceRef',
                  fields: ['resourceUuid'],
                  condition: { groupUuid }
                }
              }
            }
          },
          resourceType
        )
      }

      // 合并 extraConditions 和 shareCondition
      if (shareCondition) {
        condition = {
          [ZOp.and]: [{ ...extraConditions }, { ...shareCondition }]
        }
      }

      return {
        tableName,
        action: ZQLAction.COUNT,
        namedAs: nameAs,
        condition
      }
    }

    const resourceQueries = [
      {
        tableName: 'vmInstance',
        resourceType: 'VmInstanceVO',
        nameAs: 'vmInstance',
        extraConditions: {
          [ZOp.and]: [
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
      },
      {
        tableName: 'l3network',
        resourceType: 'L3NetworkVO',
        nameAs: 'l3Network',
        extraConditions: {
          type: 'portGroup',
          category: 'Private',
          ...l3NetworkKvmZqlObject
        }
      },
      {
        tableName: 'image',
        resourceType: 'ImageVO',
        nameAs: 'image',
        extraConditions: {
          format: { [ZOp.ne]: 'vmtx' }
        }
      },
      {
        tableName: 'l2Network',
        resourceType: 'L2NetworkVO',
        nameAs: 'l2Network',
        extraConditions: {
          type: {
            [ZOp.eq]: l2NetworkType.VirtualSwitch
          }
        }
      },
      ...(accountUuid
        ? [
            {
              tableName: 'vmInstance',
              resourceType: 'VmInstanceVO',
              nameAs: 'templatedVmInstance',
              extraConditions: {
                [ZOp.and]: [
                  {
                    uuid: {
                      [ZOp.in]: {
                        [ZOp.query]: {
                          tableName: 'templatedVminstance',
                          fields: ['uuid']
                        }
                      }
                    }
                  }
                ]
              }
            }
          ]
        : [])
    ]

    const zqlObjectList = resourceQueries.map(
      ({ tableName, resourceType, nameAs, extraConditions }) =>
        createResourceQuery(tableName, resourceType, nameAs, extraConditions)
    )

    const zql = ZQL.multStringify(zqlObjectList)
    const resp = await this.zqlService.call(zql)
    const result = []

    resp.results?.forEach(item => {
      result.push({
        type: item.name,
        value: item.total
      })
    })

    return result
  }
}
