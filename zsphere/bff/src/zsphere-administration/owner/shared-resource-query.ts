import { Inject } from '@nestjs/common'
import { Query, Args, InputType, Field, Float, ObjectType } from '@nestjs/graphql'
import { pick as _pick } from 'lodash'

import { conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { ActionService } from '@/base/action-service'
import { Condition as ICondition } from '@/common/model/action-query.model'
import ZQL, { ZOp, ZQLAction } from '@/common/zql/index'
import { l2NetworkType } from '@/hardware-resource/l2-network/l2.network.model'

@InputType()
export class QuerySharedResourceInput {
  @Field(() => String, { nullable: true })
  accountUuid?: string

  @Field(() => String, { nullable: true })
  groupUuid?: string

  @Field(() => [String])
  resourceTypeList: string[]

  @Field(() => String, { nullable: true })
  sharedType: string
}

@ObjectType()
export class QuerySharedResourceResult {
  @Field(() => String)
  type: string

  @Field(() => Float)
  value: number
}

export class SharedResourceQueryService extends ActionService {
  @Inject() zqlService: ZQLService

  getResourceZqlQueryObj(type: string, accountUuid: string) {
    return {
      tableName: 'SharedResource',
      fields: ['resourceUuid'],
      condition: {
        resourceType: type,
        [ZOp.or]: {
          receiverAccountUuid: accountUuid,
          toPublic: true
        }
      }
    }
  }

  @Query(() => [QuerySharedResourceResult])
  async sharedResourceList(@Args('input') input: QuerySharedResourceInput) {
    const { accountUuid, resourceTypeList } = input
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
    const l3NetworkESXZqlObject = {
      [ZOp.or]: {
        ['l2Network.cluster.hypervisorType']: 'ESX',
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

    const zqlObjectList = [
      {
        tableName: 'SharedResource',
        action: ZQLAction.COUNT,
        groupBy: 'resourceType',
        condition: {
          resourceType: {
            [ZOp.in]: resourceTypeList
          },
          [ZOp.or]: {
            receiverAccountUuid: accountUuid,
            toPublic: true
          }
        }
      },
      {
        tableName: 'l3network', // 扁平网络
        action: ZQLAction.COUNT,
        namedAs: 'flatNetwork',
        condition: {
          type: 'L3BasicNetwork',
          category: 'Private',
          ...l3NetworkKvmZqlObject,
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: this.getResourceZqlQueryObj('L3NetworkVO', accountUuid)
            }
          }
        }
      },
      {
        tableName: 'l3network', // 公有网络
        action: ZQLAction.COUNT,
        namedAs: 'publicNetwork',
        condition: {
          type: 'L3BasicNetwork',
          category: 'Public',
          ...l3NetworkKvmZqlObject,
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: this.getResourceZqlQueryObj('L3NetworkVO', accountUuid)
            }
          }
        }
      },
      {
        tableName: 'l3network', // Vpc网络
        action: ZQLAction.COUNT,
        namedAs: 'vpcNetwork',
        condition: {
          type: 'L3VpcNetwork',
          ...l3NetworkKvmZqlObject,
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: this.getResourceZqlQueryObj('L3NetworkVO', accountUuid)
            }
          }
        }
      },
      {
        tableName: 'l3network', // VCenter 网络
        action: ZQLAction.COUNT,
        namedAs: 'vcenterNetwork',
        condition: {
          ...l3NetworkESXZqlObject,
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: this.getResourceZqlQueryObj('L3NetworkVO', accountUuid)
            }
          }
        }
      },
      {
        tableName: 'image', // ZStack镜像
        action: ZQLAction.COUNT,
        namedAs: 'zstackImage',
        condition: {
          format: {
            [ZOp.ne]: 'vmtx'
          },
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: this.getResourceZqlQueryObj('ImageVO', accountUuid)
            }
          }
        }
      },
      {
        tableName: 'image', // vcenter镜像
        action: ZQLAction.COUNT,
        namedAs: 'vcenterImage',
        condition: {
          format: 'vmtx',
          system: false,
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: this.getResourceZqlQueryObj('ImageVO', accountUuid)
            }
          }
        }
      },
      {
        tableName: 'pciDeviceSpec', // pciDeviceSpec
        action: ZQLAction.COUNT,
        groupBy: 'isVirtual',
        namedAs: 'pciDeviceSpec',
        condition: {
          type: {
            [ZOp.in]: ['GPU_Video_Controller', 'GPU_3D_Controller']
          },
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: this.getResourceZqlQueryObj('PciDeviceSpecVO', accountUuid)
            }
          }
        }
      },
      {
        tableName: 'mdevDeviceSpec', // mdevDeviceSpec
        action: ZQLAction.COUNT,
        namedAs: 'mdevDeviceSpec',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: this.getResourceZqlQueryObj('MdevDeviceSpecVO', accountUuid)
            }
          }
        }
      },
      {
        tableName: 'instanceOffering', // 计算规格
        action: ZQLAction.COUNT,
        namedAs: 'instanceOffering',
        condition: {
          type: 'UserVm',
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: this.getResourceZqlQueryObj('InstanceOfferingVO', accountUuid)
            }
          }
        }
      },
      {
        tableName: 'virtualRouterOffering', // 云路由规格
        action: ZQLAction.COUNT,
        namedAs: 'virtualRouterOffering',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: this.getResourceZqlQueryObj('InstanceOfferingVO', accountUuid)
            }
          }
        }
      },
      {
        tableName: 'StackTemplate', // 资源栈模版
        action: ZQLAction.COUNT,
        namedAs: 'StackTemplateVO',
        condition: {
          __systemTag__: {
            [ZOp.ne]: 'systemtemplate'
          },
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: this.getResourceZqlQueryObj('StackTemplateVO', accountUuid)
            }
          }
        }
      },
      {
        tableName: 'l2Network', // 二层网络
        action: ZQLAction.COUNT,
        namedAs: 'l2Network',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: this.getResourceZqlQueryObj('L2NetworkVO', accountUuid)
            }
          },
          type: {
            [ZOp.notIn]: [l2NetworkType.VxlanNetworkPool, l2NetworkType.PortGroup]
          }
        }
      },
      {
        tableName: 'l2Network', // vxlan-pool
        action: ZQLAction.COUNT,
        namedAs: 'vxlanPool',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: this.getResourceZqlQueryObj('L2NetworkVO', accountUuid)
            }
          },
          type: {
            [ZOp.eq]: l2NetworkType.VxlanNetworkPool
          }
        }
      }
    ]

    const zql = ZQL.multStringify(zqlObjectList)
    const resp = await this.zqlService.call(zql)
    const result = []
    let vgpuSpecNum = 0
    resp.results?.forEach((item, index) => {
      if (index === 0) {
        item.inventoryCounts?.forEach(count => {
          result.push({
            type: count[0].resourceType,
            value: count[1]
          })
        })
      } else if (item.name === 'pciDeviceSpec' && item.inventoryCounts) {
        item.inventoryCounts?.forEach(count => {
          if (count[0].name === 'true') {
            vgpuSpecNum = count[1]
          } else {
            result.push({
              type: count[0].name,
              value: count[1]
            })
          }
        })
      } else if (item.name === 'mdevDeviceSpec') {
        result.push({
          type: item.name,
          value: item.total + vgpuSpecNum
        })
      } else {
        result.push({
          type: item.name,
          value: item.total
        })
      }
    })
    return result
  }

  getSharedResourceList(extraConditions: ICondition[], resourceType: string, isShare = true) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['accountUuid']
    const candidateParams = _pick(conditionsMap, candidateKeys) as {
      accountUuid: string
    }
    return {
      uuid: {
        [isShare ? ZOp.in : ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'SharedResource',
            fields: ['resourceUuid'],
            condition: {
              resourceType,
              [ZOp.or]: {
                receiverAccountUuid: candidateParams.accountUuid,
                toPublic: true
              }
            }
          }
        }
      }
    }
  }
}
