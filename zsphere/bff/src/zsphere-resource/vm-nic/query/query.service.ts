import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'
import { compact as _compact, reduce as _reduce } from 'lodash'

import {
  Condition as ICondition,
  Op,
  conditionsToObject,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetCandidateVmNicForSecurityGroupAction } from '@/api/zstack/GetCandidateVmNicForSecurityGroupAction'
import { GetCandidateVmNicsForPortMirrorAction } from '@/api/zstack/GetCandidateVmNicsForPortMirrorAction'
import { GetNicQosAction } from '@/api/zstack/GetNicQosAction'
import { GetPortForwardingAttachableVmNicsAction } from '@/api/zstack/GetPortForwardingAttachableVmNicsAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { QueryVmNicAction } from '@/api/zstack/QueryVmNicAction'
import { QueryVmNicInSecurityGroupAction } from '@/api/zstack/QueryVmNicInSecurityGroupAction'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { QueryL3NetworkService } from '@/network-resource/l3-network/query/query.service'

import { QueryVmNicArgs, VmNicQueryType } from '../vm-nic.model'

@Injectable()
export class QueryVmNicService {
  @Inject() queryVmNicAction: QueryVmNicAction
  @Inject() zqlService: ZQLService
  @Inject() getNicQosAction: GetNicQosAction
  @Inject() queryL3NetworkService: QueryL3NetworkService
  @Inject()
  getPortForwardingAttachableVmNicsAction: GetPortForwardingAttachableVmNicsAction
  @Inject()
  getCandidateVmNicForSecurityGroupAction: GetCandidateVmNicForSecurityGroupAction
  @Inject()
  queryVmNicInSecurityGroupAction: QueryVmNicInSecurityGroupAction
  @Inject()
  getCandidateVmNicsForPortMirrorAction: GetCandidateVmNicsForPortMirrorAction
  @Inject() querySystemTagAction: QuerySystemTagAction

  private vmAttachedNicMap: any = {}

  private queryIsBindPortMirrorSessionDataLoder
  private vmNicEipDataLoader
  private securityGroupDataLoder
  private resourceConfigDataloader
  private securityPolicyDataLoder
  private physicalNicDataLoder

  constructor() {
    this.queryIsBindPortMirrorSessionDataLoder = new DataLoader(this._queryIsBindPortMirrorSession)
    this.vmNicEipDataLoader = new DataLoader(this._getEip)
    this.securityGroupDataLoder = new DataLoader(this._securityGroup)
    this.resourceConfigDataloader = new DataLoader(this._getResourceConfig)
    this.securityPolicyDataLoder = new DataLoader(this._securityPolicy)
    this.physicalNicDataLoder = new DataLoader(this._getPhysicalNic)
  }

  async query(params: QueryVmNicArgs, isCount = false) {
    const { type, extraConditions = [] } = params
    let _extrazqlConditions
    const conditionsMap = conditionsToObject(extraConditions) as any

    const finalConditions: ICondition[] = []

    switch (type) {
      case VmNicQueryType.GetPortForwardingAttachableVmNics: {
        _extrazqlConditions = {
          uuid: {
            [ZOp.in]: `getapi(api='GetPortForwardingAttachableVmNics',output='inventories.uuid',ruleUuid='${conditionsMap.ruleUuid}')`
          },
          vmInstanceUuid: conditionsMap.vmInstanceUuid
        }
        break
      }
      case VmNicQueryType.CandidateVmNicForSecurityGroup: {
        _extrazqlConditions = {
          uuid: {
            [ZOp.in]: `getapi(api='GetCandidateVmNicForSecurityGroup',output='inventories.uuid',securityGroupUuid='${conditionsMap.securityGroupUuid}')`
          },
          [ZOp.and]: [
            {
              vmInstanceUuid: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'TemplatedVmInstance',
                    fields: ['uuid']
                  }
                }
              }
            },
            {
              vmInstanceUuid: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'TemplatedVmInstanceCache',
                    fields: ['cacheVmInstanceUuid']
                  }
                }
              }
            }
          ]
        }
        break
      }
      case VmNicQueryType.VmNicInSecurityGroup: {
        _extrazqlConditions = {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'VmNicSecurityGroupRef',
                fields: ['vmNicUuid'],
                condition: {
                  securityGroupUuid: conditionsMap.securityGroupUuid
                }
              }
            }
          }
        }
        break
      }
      case VmNicQueryType.PortMirrorCandidateVmNics:
        const portMirrorUuid = conditionsMap['portMirrorUuid']
        const type = conditionsMap['type']
        const vmUuid = conditionsToObject(params.conditions)['vmInstanceUuid']
        _extrazqlConditions = {
          uuid: {
            [ZOp.in]: `getapi(api='GetCandidateVmNicsForPortMirror',output='inventories.uuid',portMirrorUuid='${portMirrorUuid}',type='${type}')`
          },
          'vmInstance.uuid': vmUuid
        }
        break
      case VmNicQueryType.CandidateVmNicForAttachEip:
        return this.queryVmNicIPForEip(params)
      default:
        break
    }

    const zqlCondition = this.buildZqlCondition(
      params.conditions.concat(finalConditions),
      _extrazqlConditions
    )
    const zqlObject: ZqlObject = {
      tableName: 'VmNic',
      condition: zqlCondition,
      orderBy: params.sortBy,
      returnWith: {
        total: true
      },
      orderDirection: params.sortDirection,
      limit: params.limit,
      offset: params.start
    }

    if (isCount) {
      zqlObject.action = ZQLAction.COUNT
    }

    const zql = ZQL.stringify(zqlObject)
    const {
      results: [{ inventories = [], total }]
    } = await this.zqlService.call(zql)

    return {
      list: inventories,
      total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions, _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'ipv4',
      'ipv6'
    ])

    const specicalCondition = []

    if (_extraConditionMap.ipv4?.value) {
      specicalCondition.push({
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'UsedIp',
              fields: ['vmNicUuid'],
              condition: {
                ipVersion: 4,
                ip: {
                  [ZOp.like]: _extraConditionMap.ipv4.value
                }
              }
            }
          }
        }
      })
    }

    if (_extraConditionMap.ipv6?.value) {
      specicalCondition.push({
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'UsedIp',
              fields: ['vmNicUuid'],
              condition: {
                ipVersion: 6,
                ip: {
                  [ZOp.like]: _extraConditionMap.ipv6.value
                }
              }
            }
          }
        }
      })
    }

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async queryVmNicIPForEip(params: QueryAction) {
    /**
     * 
     *   getIpVersion (uuid) {
      let queryStr = `query usedIp where l3NetworkUuid = (query vip.l3NetworkUuid where uuid = (query eip.vipUuid where uuid = '${uuid}')) and ip = (query vip.ip where uuid = (query eip.vipUuid where uuid = '${uuid}'))`
      rpc.query('zql', {
        zql: encodeURIComponent(queryStr)
      })
      .then((resp) => {
        this.ipVersion = resp.results[0].inventories[0].ipVersion
      })
    },
        let zqlStr = "query L3Network.uuid where (networkServices.networkServiceType = 'Eip' and networkServices.networkServiceType not has ('SNAT') and uuid in ('" + `${l3NetworkUuidList.join("','")}` + "'))"


     *   let self = this
      self.vmUuid = uuid
      let nicList = _.cloneDeep(self.nicList)
      nicList = _.filter(nicList, (item) => item.vmInstanceUuid === uuid)
      // 判断所选云主机上的网卡所在的L3为扁平网络时并且该网卡类型为VF时，将该网卡过滤掉
      let l3NetworkUuidList = nicList && nicList.map(item => item.l3NetworkUuid)
      self.getL3NetWorkMsg(l3NetworkUuidList)
      .then((resp) => {
        let flatL3NetWorkUuidList = _.map(resp, it => it.uuid)
        nicList = _.filter(nicList, item => !(_.includes(flatL3NetWorkUuidList, item.l3NetworkUuid) && item.type === 'VF'))
        let ipVersion = self.ipVersion
        nicList && nicList.forEach((item) => {
          item.usedIps = _.filter(item.usedIps, (ip) => ip.ipVersion === ipVersion)
        })
        self.enabledNicList = nicList
        self.step = 1
      })
     */
    const { extraConditions } = params
    const conditionsMap = conditionsToObject(extraConditions)
    const vmInstanceUuid = conditionsMap['vmInstanceUuid']
    const eipUuid = conditionsMap['eipUuid']

    const zqlObject = {
      tableName: 'VmNic',
      condition: {
        vmInstanceUuid,
        uuid: {
          [ZOp.in]: {
            [ZOp.getapi]: {
              action: ZQLAction.GET_API,
              api: 'GetEipAttachableVmNics',
              output: 'inventories.uuid',
              condition: {
                vmUuid: vmInstanceUuid,
                eipUuid
              }
            }
          }
        },
        ipVersion: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'UsedIp',
              fields: ['ipVersion'],
              condition: {
                l3NetworkUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'vip',
                      fields: ['l3NetworkUuid'],
                      condition: {
                        uuid: {
                          [ZOp.in]: {
                            [ZOp.query]: {
                              tableName: 'eip',
                              fields: ['vipUuid'],
                              condition: {
                                uuid: eipUuid
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                ip: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'vip',
                      fields: ['ip'],
                      condition: {
                        uuid: {
                          [ZOp.in]: {
                            [ZOp.query]: {
                              tableName: 'eip',
                              fields: ['vipUuid'],
                              condition: {
                                uuid: eipUuid
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
          }
        },
        [ZOp.or]: [
          {
            l3NetworkUuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'L3Network',
                  fields: ['uuid'],
                  condition: {
                    [ZOp.and]: [
                      {
                        'networkServices.networkServiceType': 'Eip'
                      },
                      {
                        'networkServices.networkServiceType': {
                          [ZOp.notHas]: ['SNAT']
                        }
                      }
                    ],
                    uuid: {
                      [ZOp.in]: {
                        [ZOp.getapi]: {
                          action: ZQLAction.GET_API,
                          api: 'GetEipAttachableVmNics',
                          output: 'inventories.l3NetworkUuid',
                          condition: {
                            vmUuid: vmInstanceUuid,
                            eipUuid
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
            type: {
              [ZOp.ne]: 'VF'
            }
          }
        ]
      }
    }

    const zql = ZQL.stringify(QueryConditionTranslator.mergeQueryAction(params, zqlObject))

    console.log('zql : ', zql)

    /**
     *
     * query VmNic where vmInstanceUuid='49eebfbd098f49398c268d2d7579bfce' and ipVersion in (query UsedIp.ipVersion where l3NetworkUuid=(query vip.l3NetworkUuid where uuid=(query eip.vipUuid where uuid='b8a2a1b292e54a1cb209032346c0ac99')) and ip=(query vip.ip where uuid=(query eip.vipUuid where uuid='b8a2a1b292e54a1cb209032346c0ac99'))) and (l3NetworkUuid not in (query L3Network.uuid where (networkServices.networkServiceType='Eip' and networkServices.networkServiceType not has ('SNAT'))) or type!='VF')
     */
    const {
      results: [{ inventories: vmNics = [], total = 0 }]
    } = await this.zqlService.call(zql)

    const { inventories = [] } = await this.querySystemTagAction.call({
      conditions: [
        {
          key: 'resourceUuid',
          op: Op.eq,
          value: eipUuid
        },
        {
          key: 'resourceType',
          op: Op.eq,
          value: 'VmInstanceVO'
        }
      ]
    })

    inventories.forEach((item: any) => {
      if (item?.tag.indexOf('staticIp::') > -1) {
        const l3NetworkUuid = item.tag.split('::')[1]

        vmNics.forEach(vmNic => {
          vmNic.usedIps.forEach(ip => {
            if (ip.l3NetworkUuid === l3NetworkUuid) {
              ip.isStatic = true
            }
          })
        })
      }
    })

    // const vmNicIps = vmNics.reduce((_vmNicIps, vmNic) => {
    //   return [
    //     ..._vmNicIps,
    //     ...vmNic.usedIps.map((usedIp: any) => ({
    //       ip: usedIp.ip,
    //       name: vmNic.internalName,
    //       isStatic: usedIp.isStatic,
    //       vmNicIpUuid: usedIp.uuid,
    //       vmNicUuid: vmNic.uuid,
    //       mac: vmNic.mac
    //     }))
    //   ]
    // }, [])
    return {
      list: vmNics,
      total
    }
  }

  getResourceConfig(uuid) {
    return this.resourceConfigDataloader.load(uuid)
  }

  _getResourceConfig = async (uuids: string[]) => {
    const zqlObject = {
      tableName: 'ResourceConfig',
      condition: {
        resourceUuid: {
          [ZOp.in]: uuids
        },
        name: {
          [ZOp.in]: ['nicMultiQueueNum']
        },
        category: {
          [ZOp.in]: ['vm']
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    const resourceConfigList = _.get(results, ['0', 'inventories'])
    return uuids.map(uuid => {
      const resourceConfigs = resourceConfigList.filter(item => item.resourceUuid === uuid)
      if (!resourceConfigs?.length) {
        return null
      }
      const result = {}
      resourceConfigs.forEach(item => {
        result[item.name.replace(/\./g, '')] = item.value
      })
      return result
    })
  }

  async queryQosBandwidth(params) {
    const data = await this.getNicQosAction.call(params)
    return {
      inboundBandwidth: data.inboundBandwidth ?? 0,
      outboundBandwidth: data.outboundBandwidth ?? 0
    }
  }

  queryIsBindPortMirrorSession(uuid) {
    return this.queryIsBindPortMirrorSessionDataLoder.load(uuid)
  }

  _queryIsBindPortMirrorSession = async (uuids: string[]) => {
    const zqlObject = {
      tableName: 'portMirrorsession',
      fields: ['srcEndPoint', 'dstEndPoint'],
      condition: {
        [ZOp.or]: [
          {
            dstEndPoint: {
              [ZOp.in]: uuids
            }
          },
          {
            srcEndPoint: {
              [ZOp.in]: uuids
            }
          }
        ]
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    const inventories = resp.results[0].inventories
    return uuids.map(uuid => {
      const portMirrorsession = inventories.find(
        item => item.srcEndPoint === uuid || item.dstEndPoint === uuid
      )
      return portMirrorsession ? true : false
    })
  }

  getEip(uuid) {
    return this.vmNicEipDataLoader.load(uuid)
  }

  _getEip = async (uuids: string[]) => {
    const zql = ZQL.stringify({
      tableName: 'Eip',
      condition: {
        vmNicUuid: {
          [ZOp.in]: uuids
        }
      }
    })

    const { results } = await this.zqlService.call(zql)
    const eipList = _.get(results, ['0', 'inventories'])

    const eipMap = _.reduce(
      eipList,
      (obj, item) => {
        if (item.vmNicUuid) {
          // 一个网卡挂载多个EIP
          obj[item.vmNicUuid] = _.concat(_.get(obj, item.vmNicUuid, []), item)
        }
        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(eipMap, uuid, []))
  }

  private _securityGroup = async (vmNicUuids: string[]) => {
    const queryVmNicSGRefZql = ZQL.stringify({
      tableName: 'VmNicSecurityGroupRef',
      condition: {
        vmNicUuid: {
          [ZOp.in]: vmNicUuids
        }
      }
    })

    const { results: vmNicSgRefRts } = await this.zqlService.call(queryVmNicSGRefZql)
    const vmNicSgRefInventories = vmNicSgRefRts?.[0]?.inventories ?? []

    const vmNicSgRefMap = _reduce(
      vmNicSgRefInventories,
      (obj, curr) => {
        if (!obj[curr.vmNicUuid]) {
          obj[curr.vmNicUuid] = [curr]
        } else {
          obj[curr.vmNicUuid].push(curr)
        }
        return obj
      },
      {}
    )

    const sgUuidsList = vmNicUuids.map(
      vmNicUuid => vmNicSgRefMap[vmNicUuid]?.map(v => v.securityGroupUuid) ?? []
    )

    const sgUuids = sgUuidsList.reduce(
      (prev, curr) => [...prev, ...curr.reduce((p, v) => [...p, v], [])],
      []
    )

    const querySgZql = ZQL.stringify({
      tableName: 'SecurityGroup',
      condition: {
        uuid: {
          [ZOp.in]: sgUuids
        }
      }
    })

    const { results: sgResults } = await this.zqlService.call(querySgZql)
    const sgInventories = sgResults?.[0]?.inventories ?? []

    const sgList = sgUuidsList.map(() => [])

    sgUuidsList.forEach((uuids, i) => {
      sgInventories.forEach(item => {
        if (uuids.includes(item.uuid)) {
          const priority =
            (
              _compact(vmNicSgRefMap[vmNicUuids[i]]).find(
                (it: any) => it.securityGroupUuid === item.uuid
              ) as any
            )?.priority ?? 0

          sgList[i].push({
            ...item,
            priority
          })
        }
      })
    })

    return sgList
  }

  securityGroup(vmNicUuid: string) {
    return this.securityGroupDataLoder.load(vmNicUuid)
  }

  private _securityPolicy = async (vmNicUuids: string[]) => {
    const zql = ZQL.stringify({
      tableName: 'VmNicSecurityPolicy',
      condition: {
        vmNicUuid: {
          [ZOp.in]: vmNicUuids
        }
      }
    })

    const { results } = await this.zqlService.call(zql)

    const inventories = results?.[0]?.inventories ?? []

    const vmNicsecurityPolicyMap = _reduce(
      inventories,
      (obj, curr) => {
        if (!obj[curr.vmNicUuid]) {
          obj[curr.vmNicUuid] = curr
        }
        return obj
      },
      {}
    )

    return vmNicUuids.map(uuid => {
      const { ingressPolicy, egressPolicy } = vmNicsecurityPolicyMap[uuid] ?? {}

      return {
        ingressPolicy,
        egressPolicy
      }
    })
  }

  securityPolicy(vmNicUuid: string) {
    return this.securityPolicyDataLoder.load(vmNicUuid)
  }

  getPhysicalNic(vmInstanceUuid, l3NetworkUuid) {
    this.vmAttachedNicMap[l3NetworkUuid] = {
      vmInstanceUuid,
      l3NetworkUuid
    }
    return this.physicalNicDataLoder.load(l3NetworkUuid)
  }

  private _getPhysicalNic = async (l3NetworkUuids: string[]) => {
    const vmInstanceUuids = l3NetworkUuids.map(
      l3NetworkUuid => this.vmAttachedNicMap[l3NetworkUuid].vmInstanceUuid
    )
    const genZql = (l3NetworkUuid: string, vmInstanceUuid: string) => {
      return {
        tableName: 'HostNetworkInterface',
        fields: ['uuid', 'interfaceName', 'interfaceType', 'virtStatus'],
        condition: {
          [ZOp.and]: [
            {
              [ZOp.or]: [
                {
                  hostUuid: {
                    [ZOp.eq]: {
                      [ZOp.query]: {
                        tableName: 'vmInstance',
                        fields: ['hostUuid'],
                        condition: {
                          uuid: {
                            [ZOp.eq]: vmInstanceUuid
                          }
                        }
                      }
                    }
                  }
                },
                {
                  hostUuid: {
                    [ZOp.eq]: {
                      [ZOp.query]: {
                        tableName: 'vmInstance',
                        fields: ['lastHostUuid'],
                        condition: {
                          uuid: {
                            [ZOp.eq]: vmInstanceUuid
                          }
                        }
                      }
                    }
                  }
                }
              ]
            },
            {
              pciDeviceAddress: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'pciDevice',
                    fields: ['pciDeviceAddress'],
                    condition: {
                      uuid: {
                        [ZOp.in]: {
                          [ZOp.query]: {
                            tableName: 'ethernetVfPciDevice',
                            fields: ['parentUuid'],
                            condition: {
                              vmInstanceUuid: {
                                [ZOp.eq]: vmInstanceUuid
                              },
                              l3NetworkUuid: {
                                [ZOp.eq]: l3NetworkUuid
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
        },
        namedAs: l3NetworkUuid
      }
    }

    const zql = ZQL.multStringify(
      l3NetworkUuids.map((uuid, index) => genZql(uuid, vmInstanceUuids[index]))
    )

    const { results } = await this.zqlService.call(zql)

    const physicalNicMap = _reduce(
      results,
      (obj, it) => {
        obj[it.name] = _.get(it, 'inventories')
        return obj
      },
      {}
    )

    return l3NetworkUuids.map(l3NetworkUuid => {
      const physicalNic = physicalNicMap[l3NetworkUuid]
      if (physicalNic?.length) {
        return physicalNic[0]
      } else {
        return {}
      }
    })
  }
}
