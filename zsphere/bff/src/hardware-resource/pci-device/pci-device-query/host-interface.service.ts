import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import {
  remove as _remove,
  compact as _compact,
  isEmpty as _isEmpty,
  reduce as _reduce
} from 'lodash'

import {
  Condition as ICondition,
  Op,
  conditionsToObject,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetCandidateNetworkInterfacesAction } from '@/api/zstack/GetCandidateNetworkInterfacesAction'
import { ActionService } from '@/base/action-service'
import ZQL, { QueryConditionTranslator, ZOp } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import {
  QueryPhysicalNicArgs,
  PhysicalNicQueryType,
  HostNetworkInterfaceServiceRef
} from '../pci-device.model'

@Injectable()
export class HostInterfaceService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject()
  getCandidateNetworkInterfacesAction: GetCandidateNetworkInterfacesAction

  private hostNetworkInterfaceServiceRefLoader

  constructor() {
    super()
    this.hostNetworkInterfaceServiceRefLoader = new DataLoader(this._hostNetworkInterfaceServiceRef)
  }

  async query(param: QueryPhysicalNicArgs) {
    const { type = PhysicalNicQueryType.Normal } = param

    const finalConditions: ICondition[] = []
    let _extrazqlConditions

    switch (type) {
      case PhysicalNicQueryType.Normal:
        _extrazqlConditions = undefined
        break
      case PhysicalNicQueryType.getCandidatesPhysicalNicForMultipleCreateBond:
        _extrazqlConditions = await this.getCandidatesPhysicalNicForMultipleCreateBond(param)
        break
      case PhysicalNicQueryType.getCandidatesPhysicalNicForCreateByInL2VSwitch:
        _extrazqlConditions = await this.getCandidatesPhysicalNicForCreateByInL2VSwitch(param)
        break

      case PhysicalNicQueryType.getCandidatesPhysicalNicForSingleCreateOrModifyBond:
        _extrazqlConditions = await this.getCandidatesPhysicalNicForSingleCreateOrModifyBond(param)
        break

      case PhysicalNicQueryType.getCandidatesPhysicalNicForCreateByInVM:
        _extrazqlConditions = await this.getCandidatesPhysicalNicForCreateByInVM(param)
        break
    }

    const zqlCondition = this.buildZqlCondition(
      param.conditions.concat(finalConditions),
      _extrazqlConditions
    )
    const zqlObject: ZqlObject = {
      tableName: 'HostNetworkInterface',
      condition: zqlCondition,
      orderBy: param.sortBy,
      returnWith: {
        total: true
      },
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start
    }

    const zql = ZQL.stringify(zqlObject)
    const {
      results: [{ inventories = [], total }]
    } = await this.zqlService.call(zql)

    // 网卡的厂商和型号通过拆分 interfaceModel 获得
    inventories.forEach(item => {
      if (item.interfaceModel && item.interfaceModel.includes('_')) {
        const modelArr = item.interfaceModel.split('_')
        item.interfaceFactory = modelArr[0]
        item.interfaceModel = modelArr[1]
      }
    })

    return {
      list: inventories,
      total: total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []

    const extraConditions = _remove(conditions, condition =>
      ['host.clusterUuid', 'pciDevice.virtStatus', 'bondingUuid.self', 'serviceType'].includes(
        condition.key
      )
    )
    const conditionsMap = conditionsToObject(extraConditions)

    if (conditionsMap['host.clusterUuid']) {
      specicalCondition.push({
        hostUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'Host',
              fields: ['uuid'],
              condition: {
                clusterUuid: {
                  [ZOp.eq]: conditionsMap['host.clusterUuid']
                }
              }
            }
          }
        }
      })
    }
    if (conditionsMap['pciDevice.virtStatus']) {
      specicalCondition.push({
        pciDeviceAddress: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'PciDevice.pciDeviceAddress',
              condition: {
                virtStatus: {
                  [ZOp.in]: conditionsMap['pciDevice.virtStatus']
                }
              }
            }
          }
        }
      })
    }
    if (conditionsMap['bondingUuid.self']) {
      _remove(
        conditions,
        condition =>
          condition.key === 'bondingUuid' && condition.op === Op.is && condition.value === null
      )
      specicalCondition.push({
        [ZOp.or]: [
          {
            bondingUuid: conditionsMap['bondingUuid.self']
          },
          {
            bondingUuid: {
              [ZOp.is]: null
            }
          }
        ]
      })
    }
    if (conditionsMap['serviceType']) {
      specicalCondition.push({
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'HostNetworkInterfaceServiceRef',
              fields: ['interfaceUuid'],
              condition: {
                serviceType: {
                  [ZOp.eq]: conditionsMap['serviceType']
                }
              }
            }
          }
        }
      })
    }

    const ipConditionList = conditions.filter(({ key }) => key === 'ipAddresses')
    ipConditionList.forEach(condition => {
      const op = condition?.op
      if (op === ZOp.notLike) {
        const ip = conditionsToObject(
          _remove(
            conditions,
            _condition =>
              ['ipAddresses'].includes(_condition.key) && condition.value === _condition.value
          )
        )['ipAddresses']
        specicalCondition.push({
          [ZOp.or]: [
            {
              ipAddresses: {
                [ZOp.notLike]: ip
              }
            },
            {
              ipAddresses: {
                [ZOp.is]: null
              }
            }
          ]
        })
      }
    })

    const translateConditions = extrazqlConditions
      ? specicalCondition.concat(extrazqlConditions)
      : specicalCondition
    const zqlCondition = QueryConditionTranslator.translate(conditions, translateConditions)
    return zqlCondition
  }

  getCandidatesPhysicalNicForCreateByInL2VSwitch = async (param: QueryPhysicalNicArgs) => {
    const [, _extraConditionMap] = extractAndRemoveExtraCondition(param.conditions, [
      'clusterUuids',
      'intersecting',
      'hostUuids'
    ])
    let hostUuids = _extraConditionMap.hostUuids?.values
    if (!hostUuids?.length) {
      const hostsql = ZQL.stringify({
        tableName: 'host',
        fields: ['uuid'],
        condition: {
          clusterUuid: {
            [ZOp.in]: _extraConditionMap.clusterUuids.values
          }
        }
      })

      const resp = await this.zqlService.call(hostsql)
      hostUuids = resp.results?.[0]?.inventories?.map(item => item.uuid)
    }
    const _resp = await this.getCandidateNetworkInterfacesAction.call({
      hostUuids,
      intersecting: _extraConditionMap.intersecting.value === 'true'
    })

    return _extraConditionMap.intersecting.value === 'true'
      ? {
          interfaceName: {
            [ZOp.in]: _resp.slaveNames
          }
        }
      : {
          uuid: {
            [ZOp.in]: _resp.candidateNics?.map(item => item.uuid)
          }
        }
  }

  private readonly getCandidatesPhysicalNicForMultipleCreateBond = async (
    param: QueryPhysicalNicArgs
  ) => {
    const [, _extraConditionMap] = extractAndRemoveExtraCondition(param.conditions, ['hostUuids'])

    const _extrazqlConditions =
      (await this.getCandidatesPhysicalNicForSingleCreateOrModifyBond(param)) ?? {}

    return {
      ..._extrazqlConditions,
      interfaceName: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'HostNetworkInterface',
            fields: ['interfaceName'],
            condition: {
              [ZOp.and]: [
                {
                  hostUuid: {
                    [ZOp.in]: _extraConditionMap['hostUuids'].values
                  }
                },
                {
                  [ZOp.or]: [
                    {
                      bondingUuid: {
                        [ZOp.not]: null
                      }
                    },
                    {
                      interfaceType: {
                        [ZOp.eq]: 'bridgeSlave'
                      }
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    }
  }

  private readonly getCandidatesPhysicalNicForSingleCreateOrModifyBond = async (
    param: QueryPhysicalNicArgs
  ) => {
    const { conditions } = param

    // 过滤vtepIp
    const vtepIpZql = ZQL.stringify({
      tableName: 'Vtep',
      fields: ['vtepIp'],
      condition: {
        hostUuid: {
          [ZOp.eq]: conditions.find(condition => condition.key === 'hostUuid').value
        }
      }
    })
    const vtepIpResp = await this.zqlService.call(vtepIpZql)
    const vtepIpList = _compact(vtepIpResp.results?.[0]?.inventories?.map(it => it.vtepIp))

    return !_isEmpty(vtepIpList)
      ? {
          [ZOp.and]: vtepIpList.map(vtepIp => ({
            [ZOp.or]: [
              {
                ipAddresses: {
                  [ZOp.notLike]: vtepIp
                }
              },
              {
                ipAddresses: {
                  [ZOp.is]: null
                }
              }
            ]
          }))
        }
      : undefined
  }

  private readonly getCandidatesPhysicalNicForCreateByInVM = async (
    param: QueryPhysicalNicArgs
  ) => {
    const { conditions } = param
    const [, _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'l3NetworkUuid'
      // 'hostUuid'
    ])
    const hostUuid = conditions.find(condition => condition.key === 'hostUuid').value

    return {
      [ZOp.or]: [
        {
          'bonding.bondingName': {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'L2Network',
                fields: ['physicalInterface'],
                condition: {
                  [ZOp.and]: [
                    {
                      'l3Network.uuid': _extraConditionMap?.l3NetworkUuid?.value
                    },
                    {
                      'hostRef.hostUuid': hostUuid
                    }
                  ]
                }
              }
            }
          }
        },
        {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'UplinkGroup',
                fields: ['interfaceUuid'],
                condition: {
                  [ZOp.and]: [
                    {
                      l2NetworkUuid: {
                        [ZOp.in]: {
                          [ZOp.query]: {
                            tableName: 'PortGroup',
                            fields: ['vSwitchUuid'],
                            condition: {
                              uuid: _extraConditionMap?.l3NetworkUuid?.value
                            }
                          }
                        }
                      }
                    },
                    {
                      hostUuid
                    }
                  ]
                }
              }
            }
          }
        }
      ]
    }
  }

  private readonly _hostNetworkInterfaceServiceRef = async (interfaceUuids: string[]) => {
    const zql = ZQL.stringify({
      tableName: 'HostNetworkInterfaceServiceRef',
      condition: {
        interfaceUuid: {
          [ZOp.in]: interfaceUuids
        }
      }
    })

    const { results } = await this.zqlService.call(zql)
    const inventories = results[0]?.inventories ?? []

    const _hostNetworkInterfaceServiceRefMap = _reduce(
      inventories,
      (obj, hostNetworkInterfaceServiceRef) => {
        const { interfaceUuid, vlanId, serviceType } = hostNetworkInterfaceServiceRef

        const key = `${interfaceUuid}-${vlanId}`

        if (!obj[key]) {
          obj[key] = {
            ...hostNetworkInterfaceServiceRef,
            serviceTypes: [serviceType]
          }
        } else {
          obj[key].serviceTypes.push(serviceType)
        }
        return obj
      },
      {}
    )

    const hostNetworkInterfaceServiceRefMap = _reduce(
      Object.values(_hostNetworkInterfaceServiceRefMap) as HostNetworkInterfaceServiceRef[],
      (obj, curr) => {
        if (!obj[curr.interfaceUuid]) {
          obj[curr.interfaceUuid] = [curr]
        } else {
          obj[curr.interfaceUuid].push(curr)
        }

        return obj
      },
      {} as any
    )

    return interfaceUuids.map(uuid => hostNetworkInterfaceServiceRefMap[uuid] ?? [])
  }

  hostNetworkInterfaceServiceRef(interfaceUuid: string) {
    return this.hostNetworkInterfaceServiceRefLoader.load(interfaceUuid)
  }
}
