import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import {
  Condition as ICondition,
  conditionsToObject,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetCandidateNetworkBondingsAction } from '@/api/zstack/GetCandidateNetworkBondingsAction'
import { ActionService } from '@/base/action-service'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { HostNetworkBondingServiceRef, Bond } from './bond.model'

@Injectable()
export class BondService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject()
  getCandidateNetworkBondingsAction: GetCandidateNetworkBondingsAction

  private hostNetworkBondingServiceRefLoader
  private vSwitchDataloader

  constructor() {
    super()
    this.hostNetworkBondingServiceRefLoader = new DataLoader(this._hostNetworkBondingServiceRef)
    this.vSwitchDataloader = new DataLoader(this._queryVSwitch)
  }

  async query(param: IQueryAction, queryAction = ZQLAction.QUERY) {
    const finalConditions: ICondition[] = []
    let _extrazqlConditions

    switch (param.type) {
      case 'GetCandidatesBondForL2VSwitch':
        _extrazqlConditions = await this.getCandidatesBondForL2VSwitch(param)
        break

      case 'GetBondInL2VSwitch':
        _extrazqlConditions = await this.getBondInL2VSwitch(param)
        break

      case 'GetBondNotInL2VSwitch':
        _extrazqlConditions = await this.getBondNotInL2VSwitch(param)
        break
    }

    const zqlCondition = this.buildZqlCondition(
      param.conditions.concat(finalConditions),
      _extrazqlConditions
    )
    const zqlObject = {
      tableName: 'HostNetworkBonding',
      action: queryAction,
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

    return {
      list: inventories,
      total: total
    }
  }

  getCandidatesBondForL2VSwitch = async (param: IQueryAction) => {
    const [, _extraConditionMap] = extractAndRemoveExtraCondition(param.conditions, [
      'clusterUuids',
      'hostUuids'
    ])

    let hostUuids = []
    if (!_extraConditionMap?.hostUuids?.values?.length) {
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
    } else {
      hostUuids = _extraConditionMap?.hostUuids?.values
    }
    const _resp = await this.getCandidateNetworkBondingsAction.call({
      hostUuids
    })

    return {
      uuid: {
        [ZOp.in]: _resp?.inventories?.map(item => item.uuid)
      }
    }
  }

  getBondNotInL2VSwitch = async (param: IQueryAction) => {
    const [, _extraConditionMap] = extractAndRemoveExtraCondition(param.conditions, ['vswitchUuid'])

    return {
      ['hostUuid']: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'l2networkhostref',
            fields: ['hostUuid'],
            condition: {
              l2NetworkUuid: _extraConditionMap.vswitchUuid.value
            }
          }
        }
      }
    }
  }

  getBondInL2VSwitch = async (param: IQueryAction) => {
    const [, _extraConditionMap] = extractAndRemoveExtraCondition(param.conditions, [
      'vswitchUuid',
      'bondingName'
    ])

    return {
      ['hostUuid']: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'l2networkhostref',
            fields: ['hostUuid'],
            condition: {
              l2NetworkUuid: _extraConditionMap.vswitchUuid.value
            }
          }
        }
      },
      bondingName: _extraConditionMap.bondingName.value
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []

    const extraConditions = _.remove(conditions, condition =>
      [
        'shareType',
        'ipRangeType',
        'clusterUuid',
        'serviceType',
        'hostUuids',
        'hostName',
        'xmitHashPolicy'
      ].includes(condition.key)
    )
    const conditionsMap = conditionsToObject(extraConditions)

    if (conditionsMap['clusterUuid']) {
      specicalCondition.push({
        hostUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'Host',
              fields: ['clusterUuid'],
              condition: {
                clusterUuid: {
                  [ZOp.eq]: conditionsMap['clusterUuid']
                }
              }
            }
          }
        }
      })
    }

    if (conditionsMap['serviceType']) {
      specicalCondition.push({
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'HostNetworkBondingServiceRef',
              fields: ['bondingUuid'],
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

    if (conditionsMap['xmitHashPolicy']) {
      specicalCondition.push(
        conditionsMap['xmitHashPolicy'] === 'null'
          ? {
              xmitHashPolicy: {
                [ZOp.is]: null
              }
            }
          : {
              xmitHashPolicy: conditionsMap['xmitHashPolicy']
            }
      )
    }

    if (conditionsMap['hostName']) {
      specicalCondition.push({
        hostUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'host',
              fields: ['uuid'],
              condition: {
                name: {
                  [ZOp.like]: conditionsMap['hostName']
                }
              }
            }
          }
        }
      })
    }

    const translateConditions = extrazqlConditions
      ? specicalCondition.concat(extrazqlConditions)
      : specicalCondition
    const zqlCondition = QueryConditionTranslator.translate(conditions, translateConditions)
    return zqlCondition
  }

  getBondResouceCount = async (hostUuid: string) => {
    const zqlBond = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: 'HostNetworkBonding',
      condition: { hostUuid }
    })
    const zqlPhysicalNic = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: 'HostNetworkInterface',
      condition: { hostUuid }
    })

    const [bondresp, nicresp] = await Promise.all([
      this.zqlService.call(zqlBond),
      this.zqlService.call(zqlPhysicalNic)
    ])

    return {
      bond: bondresp?.results?.[0]?.total,
      nic: nicresp?.results?.[0]?.total
    }
  }

  getBondReleatedResource = async (bondingName: string) => {
    const zqlObjects = ZQL.multStringify([
      {
        action: ZQLAction.COUNT,
        tableName: 'l2networkhostref',
        condition: {
          l2NetworkUuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'l2network',
                fields: ['uuid'],
                condition: {
                  physicalInterface: bondingName,
                  type: 'virtualSwitch'
                }
              }
            }
          }
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'vminstance',
        condition: {
          ['vmNics.l3Network.l2Network.physicalInterface']: bondingName
        }
      }
    ])

    const { results } = await this.zqlService.call(zqlObjects)

    return {
      host: results?.[0]?.total,
      vm: results?.[1]?.total
    }
  }

  checkIp = async (ip: string) => {
    const zqlObjectNic = {
      tableName: 'HostNetworkInterface',
      action: ZQLAction.COUNT,
      condition: {
        ipAddresses: {
          [ZOp.like]: ip
        }
      }
    }
    const zqlNic = ZQL.stringify(zqlObjectNic)
    const {
      results: [{ total: nicTotal }]
    } = await this.zqlService.call(zqlNic)

    if (nicTotal !== 0) {
      return {
        available: false
      }
    }

    const zqlObjectBond = {
      tableName: 'HostNetworkBonding',
      action: ZQLAction.COUNT,
      condition: {
        ipAddresses: {
          [ZOp.like]: ip
        }
      }
    }
    const zqlBond = ZQL.stringify(zqlObjectBond)
    const {
      results: [{ total: bondTotal }]
    } = await this.zqlService.call(zqlBond)

    return {
      available: bondTotal === 0
    }
  }

  private _hostNetworkBondingServiceRef = async (bondingUuids: string[]) => {
    const zql = ZQL.stringify({
      tableName: 'HostNetworkBondingServiceRef',
      condition: {
        bondingUuid: {
          [ZOp.in]: bondingUuids
        }
      }
    })

    const { results } = await this.zqlService.call(zql)
    const inventories = results[0]?.inventories ?? []

    const _hostNetworkBondingServiceRefMap = _.reduce(
      inventories,
      (obj, hostNetworkBondingServiceRef) => {
        const { bondingUuid, vlanId, serviceType } = hostNetworkBondingServiceRef
        const key = `${bondingUuid}-${vlanId}`
        if (!obj[key]) {
          obj[key] = {
            ...hostNetworkBondingServiceRef,
            serviceTypes: [serviceType]
          }
        } else {
          obj[key].serviceTypes.push(serviceType)
        }
        return obj
      },
      {}
    )

    const hostNetworkBondingServiceRefMap = _.reduce(
      Object.values(_hostNetworkBondingServiceRefMap) as HostNetworkBondingServiceRef[],
      (obj, curr) => {
        if (!obj[curr.bondingUuid]) {
          obj[curr.bondingUuid] = [curr]
        } else {
          obj[curr.bondingUuid].push(curr)
        }

        return obj
      },
      {} as any
    )

    return bondingUuids.map(uuid => hostNetworkBondingServiceRefMap[uuid] ?? [])
  }

  hostNetworkBondingServiceRef(bondingUuid: string) {
    return this.hostNetworkBondingServiceRefLoader.load(bondingUuid)
  }

  queryVSwitch = async (bond: Bond) => {
    return this.vSwitchDataloader.load({
      uuid: bond.uuid,
      physicalInterface: bond.bondingName,
      hostUuid: bond.hostUuid
    })
  }

  _queryVSwitch = async (
    params: { uuid: string; physicalInterface: string; hostUuid: string }[]
  ) => {
    const physicalInterfaces = _.uniq(params.map(it => it.physicalInterface))
    const hostUuids = _.uniq(params.map(it => it.hostUuid))
    const zqlObj = {
      tableName: 'l2network',
      condition: {
        physicalInterface: {
          [ZOp.in]: physicalInterfaces
        },
        type: 'virtualSwitch',
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'l2networkhostref',
              fields: ['l2NetworkUuid'],
              condition: {
                hostUuid: {
                  [ZOp.in]: hostUuids
                }
              }
            }
          }
        }
      }
    }
    const zqlStr = ZQL.stringify(zqlObj)
    const { results } = await this.zqlService.call(zqlStr)
    return params.map(param => {
      return (
        results?.[0]?.inventories.find(it => it.physicalInterface === param.physicalInterface) ??
        null
      )
    })
  }
}
