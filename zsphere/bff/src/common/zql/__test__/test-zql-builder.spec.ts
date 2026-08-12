import ZQL, { ZQLAction, ZQLFn, ZOp } from '../index'

describe('zql builder', () => {
  beforeEach(async () => {})
  /**
   * 【--------query开始---------】
   */
  describe('【query】', () => {
    it('1. 最基础的查询', () => {
      const zql = ZQL.stringify({
        tableName: 'table1'
      })
      const Rs = 'query table1'
      expect(zql).toBe(Rs)
    })

    it('2. 单个字段的查询', () => {
      const zql = ZQL.stringify({
        tableName: 'table',
        fields: 'f1'
      })
      const Rs = 'query table.f1'
      expect(zql).toBe(Rs)
    })

    it('3. 多个字段的查询', () => {
      const zql = ZQL.stringify({
        tableName: 'table',
        fields: ['f1', 'f2']
      })
      const Rs = 'query table.f1,f2'
      expect(zql).toBe(Rs)
    })

    it('4. 带有单个查询条件的查询', () => {
      const zql = ZQL.stringify({
        tableName: 'table',
        fields: ['f1', 'f2'],
        condition: {
          a: 1
        }
      })
      const Rs = 'query table.f1,f2 where a=1'
      expect(zql).toBe(Rs)
    })

    it('5. 带有多个查询条件的查询（and）', () => {
      const zql = ZQL.stringify({
        tableName: 'table',
        fields: ['f1', 'f2'],
        condition: {
          a: 1,
          b: '2'
        }
      })
      const Rs = "query table.f1,f2 where a=1 and b='2'"
      expect(zql).toBe(Rs)
    })

    it('6. 带有多个查询条件的查询（or）', () => {
      const zql = ZQL.stringify({
        tableName: 'table',
        fields: ['f1', 'f2'],
        condition: {
          [ZOp.or]: {
            a: 1,
            b: 2
          }
        }
      })
      const Rs = 'query table.f1,f2 where (a=1 or b=2)'
      expect(zql).toBe(Rs)
    })

    it('7. 带有多个查询条件的查询（= / !=）', () => {
      const zql = ZQL.stringify({
        tableName: 'table',
        fields: ['f1'],
        condition: {
          a: 1,
          b: {
            [ZOp.ne]: '2'
          },
          c: {
            [ZOp.eq]: 4
          }
        }
      })
      const Rs = "query table.f1 where a=1 and b!='2' and c=4"
      expect(zql).toBe(Rs)
    })

    it('8. 带有多个查询条件的查询（like / not like）', () => {
      const zql = ZQL.stringify({
        tableName: 'table',
        fields: ['f1'],
        condition: {
          a: 1,
          b: {
            [ZOp.like]: '2'
          },
          c: {
            [ZOp.notLike]: '0000'
          }
        }
      })
      const Rs = "query table.f1 where a=1 and b like '%2%' and c not like '%0000%'"
      expect(zql).toBe(Rs)
    })

    it('9. 带有多个查询条件的查询（in / not in）', () => {
      const zql = ZQL.stringify({
        tableName: 'VmInstance',
        condition: {
          uuid: {
            [ZOp.in]: [
              '0653508b6e5e48c1b182de7e0e482dc0',
              '0653508b6e5e48c1b182de7e0e482dc0',
              '61c8a243ae134092b6f8500536623ced'
            ]
          }
        }
      })
      const Rs =
        "query VmInstance where uuid in ('0653508b6e5e48c1b182de7e0e482dc0','0653508b6e5e48c1b182de7e0e482dc0','61c8a243ae134092b6f8500536623ced')"
      expect(zql).toBe(Rs)
    })

    it('10. 带有多个查询条件的查询（is null / is not null）', () => {
      const zql = ZQL.stringify({
        tableName: 'iam2ticketflow',
        fields: ['collectionUuid'],
        condition: {
          parentFlowUuid: {
            [ZOp.is]: null
          },
          flowUuid: {
            [ZOp.not]: null
          },
          approverUuid: 'xxxx1',
          status: 'Pending'
        }
      })
      const Rs =
        "query iam2ticketflow.collectionUuid where parentFlowUuid is null and flowUuid is not null and approverUuid='xxxx1' and status='Pending'"
      expect(zql).toBe(Rs)
    })

    it('11. 带有多个查询条件的查询（has / not has）', () => {
      const zql = ZQL.stringify({
        tableName: 'vminstance',
        condition: {
          __systemTag__: {
            [ZOp.has]: ['ha', 'inhibitHA']
          },
          'vmNics.ipVersion': {
            [ZOp.notHas]: ['4']
          }
        }
      })
      const Rs =
        "query vminstance where __systemTag__ has ('ha','inhibitHA') and vmNics.ipVersion not has ('4')"
      expect(zql).toBe(Rs)
    })

    it('12. 子查询', () => {
      const zql = ZQL.stringify({
        tableName: 'table',
        fields: ['f1'],
        condition: {
          a: 1,
          b: {
            [ZOp.query]: {
              tableName: 'table2',
              fields: ['uuid'],
              condition: {
                c: 'c'
              }
            }
          }
        }
      })
      const Rs = "query table.f1 where a=1 and b=(query table2.uuid where c='c')"
      expect(zql).toBe(Rs)
    })

    it('13. 复杂子查询', () => {
      const zql = ZQL.stringify({
        tableName: 'vminstance',
        condition: {
          state: {
            [ZOp.ne]: 'Destroyed'
          },
          type: 'UserVm',
          hypervisorType: 'ESX',
          zoneUuid: 'ea33e376f2d34e2fb785108ba2ad98f2',
          [ZOp.or]: [
            {
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'AccountResourceRef',
                    fields: ['resourceUuid'],
                    condition: {
                      resourceType: 'VmInstanceVO',
                      accountUuid: {
                        [ZOp.in]: {
                          [ZOp.query]: {
                            tableName: 'account',
                            fields: ['uuid'],
                            condition: {
                              name: {
                                [ZOp.like]: 'weiqi'
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
              uuid: {
                [ZOp.query]: {
                  tableName: 'AccountResourceRef',
                  fields: ['resourceUuid'],
                  condition: {
                    resourceType: 'VmInstanceVO',
                    accountUuid: {
                      [ZOp.in]: {
                        [ZOp.query]: {
                          tableName: 'IAM2ProjectAccountRef',
                          fields: ['accountUuid'],
                          condition: {
                            projectUuid: {
                              [ZOp.in]: {
                                [ZOp.query]: {
                                  tableName: 'IAM2Project',
                                  fields: ['uuid'],
                                  condition: {
                                    name: {
                                      [ZOp.like]: 'weiqi'
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
              }
            }
          ]
        },
        returnWith: {
          total: true
        },
        orderBy: 'createDate',
        orderDirection: 'desc',
        limit: 20,
        offset: 0
      })
      const Rs =
        "query vminstance where state!='Destroyed' and type='UserVm' and hypervisorType='ESX' and zoneUuid='ea33e376f2d34e2fb785108ba2ad98f2' and (uuid in (query AccountResourceRef.resourceUuid where resourceType='VmInstanceVO' and accountUuid in (query account.uuid where name like '%weiqi%')) or uuid=(query AccountResourceRef.resourceUuid where resourceType='VmInstanceVO' and accountUuid in (query IAM2ProjectAccountRef.accountUuid where projectUuid in (query IAM2Project.uuid where name like '%weiqi%')))) return with (total) order by createDate desc limit 20"
      expect(zql).toBe(Rs)
    })

    it('14. function', () => {
      const zql = ZQL.stringify({
        fnName: ZQLFn.distinct,
        tableName: 'schedulerjobhistory',
        fields: ['schedulerJobGroupUuid'],
        condition: {
          resultDump: 'Running'
        }
      })
      const Rs =
        "query distinct(schedulerjobhistory.schedulerJobGroupUuid) where resultDump='Running'"
      expect(zql).toBe(Rs)

      // max
      const zqlmax = ZQL.stringify({
        fnName: ZQLFn.max,
        tableName: 'AlarmRecords',
        fields: ['createTime'],
        condition: {
          resultDump: 'Running'
        }
      })
      const Rsmax = "query max(AlarmRecords.createTime) where resultDump='Running'"
      expect(zqlmax).toBe(Rsmax)
    })

    it('15. 复杂例子', () => {
      const zql = ZQL.stringify({
        tableName: 'vminstance',
        condition: {
          [ZOp.or]: [
            {
              [ZOp.and]: {
                name: 'webvm',
                'vmnics.ip': '192.168.0.10'
              }
            },
            {
              [ZOp.and]: {
                'vmnics.ip': '192.168.0.10',
                [ZOp.or]: {
                  cpuNum: {
                    [ZOp.gte]: 8
                  },
                  clusterUuid: {
                    [ZOp.in]: [
                      'fe13b725c80e45709f0414c266a80239',
                      '73ca1ca7603d454f8fa7f3bb57097f80'
                    ]
                  }
                }
              }
            }
          ]
        },
        restrictBy: {
          'zone.uuid': {
            [ZOp.ne]: 'fec2889fef2d49b1967c7e39025f4eb4'
          },
          'zone.name': {
            [ZOp.like]: 'east-'
          }
        },
        returnWith: {
          total: true,
          zwatch: [
            {
              resultName: 'zwatch1',
              metricName: 'CPUUsedUtilization',
              offsetAheadOfCurrentTime: 3600,
              period: 10,
              labels: ['CPUNum=10', 'CPUNum=100'],
              functions: ['limit(limit=10)', 'top(num=2)']
            },
            {
              resultName: 'zwatch2',
              metricName: 'CPUUsedUtilization',
              offsetAheadOfCurrentTime: 3600,
              period: 10,
              labels: ['CPUNum=10', 'CPUNum=100'],
              functions: ['limit(limit=10)', 'top(num=2)']
            }
          ]
        },
        orderBy: 'cpuNum',
        orderDirection: 'asc',
        limit: 100,
        offset: 10,
        namedAs: 'vmFilters'
      })
      const Rs = `query vminstance where ((name='webvm' and vmnics.ip='192.168.0.10') or (vmnics.ip='192.168.0.10' and (cpuNum>=8 or clusterUuid in ('fe13b725c80e45709f0414c266a80239','73ca1ca7603d454f8fa7f3bb57097f80')))) restrict by (zone.uuid!='fec2889fef2d49b1967c7e39025f4eb4', zone.name like '%east-%') return with (total, zwatch{resultName='zwatch1',metricName='CPUUsedUtilization',offsetAheadOfCurrentTime=3600,period=10,labels='CPUNum=10',labels='CPUNum=100',functions=limit(limit=10),functions=top(num=2)}, zwatch{resultName='zwatch2',metricName='CPUUsedUtilization',offsetAheadOfCurrentTime=3600,period=10,labels='CPUNum=10',labels='CPUNum=100',functions=limit(limit=10),functions=top(num=2)}) order by cpuNum asc limit 100 offset 10 named as 'vmFilters'`
      expect(zql).toBe(Rs)
    })

    it('15, in 数组为空查询', () => {
      const zql = ZQL.stringify({
        tableName: 'table1',
        condition: {
          uuid: {
            [ZOp.in]: []
          }
        },
        returnWith: {
          total: true
        }
      })
      const Rs = `query table1 where uuid in ('') return with (total)`
      expect(zql).toBe(Rs)
    })

    it('16, not in 数组为空查询', () => {
      const zql = ZQL.stringify({
        tableName: 'table1',
        condition: {
          uuid: {
            [ZOp.notIn]: []
          }
        },
        returnWith: {
          total: true
        }
      })
      const Rs = `query table1 where uuid not in ('') return with (total)`
      expect(zql).toBe(Rs)
    })
  })

  /**
   * 【--------count开始--------】
   */
  describe('【count】', () => {
    it('1. 普通查询', () => {
      const zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'host'
      })
      const Rs = 'count host'
      expect(zql).toBe(Rs)
    })

    it('2. where条件查询', () => {
      const zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'vminstance',
        condition: {
          type: 'UserVm'
        }
      })
      const Rs = "count vminstance where type='UserVm'"
      expect(zql).toBe(Rs)
    })

    it('3. 嵌套查询', () => {
      const zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'vminstance',
        condition: {
          type: 'UserVm',
          lastHostUuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'host',
                fields: ['uuid'],
                condition: {
                  __systemTag__: {
                    [ZOp.eq]: 'cpuModelName::aarch64'
                  }
                }
              }
            }
          }
        },
        groupBy: 'uuid',
        orderBy: 'createDate',
        orderDirection: 'desc',
        limit: 1,
        offset: 10,
        namedAs: 'vminstanceCount'
      })
      const Rs =
        "count vminstance where type='UserVm' and lastHostUuid in (query host.uuid where __systemTag__='cpuModelName::aarch64') group by uuid order by createDate desc limit 1 offset 10 named as 'vminstanceCount'"
      expect(zql).toBe(Rs)
    })
  })

  /**
   * 【--------sum开始--------】
   */
  describe('【sum】', () => {
    it('1. 普通sum', () => {
      const zql = ZQL.stringify({
        action: ZQLAction.SUM,
        tableName: 'instanceoffering',
        fields: 'cpuNum',
        sumBy: 'uuid'
      })
      const Rs = 'sum instanceoffering.cpuNum by uuid'
      expect(zql).toBe(Rs)
    })

    it('2. sum by', () => {
      const zql = ZQL.stringify({
        action: ZQLAction.SUM,
        tableName: 'instanceoffering',
        fields: 'cpuNum',
        sumBy: 'uuid'
      })
      const Rs = 'sum instanceoffering.cpuNum by uuid'
      expect(zql).toBe(Rs)
    })

    it('3. 带条件的sum', () => {
      const zql = ZQL.stringify({
        action: ZQLAction.SUM,
        tableName: 'hostcapacity',
        fields: 'cpuSockets',
        sumBy: 'uuid',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'host',
                fields: ['uuid'],
                condition: {
                  hypervisorType: 'ESX'
                }
              }
            }
          }
        }
      })
      const Rs =
        "sum hostcapacity.cpuSockets by uuid where uuid in (query host.uuid where hypervisorType='ESX')"
      expect(zql).toBe(Rs)
    })

    it('4. 多个字段的sum', () => {
      const zql = ZQL.stringify({
        action: ZQLAction.SUM,
        tableName: 'volume',
        fields: ['actualSize', 'size'],
        sumBy: 'type',
        condition: {
          'primaryStorage.zoneUuid': 'xxx',
          'primaryStorage.type': {
            [ZOp.in]: ['LocalStorage', 'Ceph', 'SharedBlock']
          }
        }
      })
      const Rs =
        "sum volume.actualSize,size by type where primaryStorage.zoneUuid='xxx' and primaryStorage.type in ('LocalStorage','Ceph','SharedBlock')"
      expect(zql).toBe(Rs)
    })
  })

  /**
   * 【--------group by开始--------】
   */
  describe('【group by】', () => {
    it('do', () => {
      const zql = ZQL.stringify({
        tableName: 'vminstance',
        groupBy: ['name', 'memorySize']
      })
      const Rs = 'query vminstance group by name,memorySize'
      expect(zql).toBe(Rs)
    })
  })

  /**
   * 【--------limit / offset开始--------】
   */
  describe('【limit / offset】', () => {
    it('do', () => {
      const zql = ZQL.stringify({
        tableName: 'host',
        limit: 10,
        offset: 6
      })
      const Rs = 'query host limit 10 offset 6'
      expect(zql).toBe(Rs)
    })
  })

  /**
   * 【--------order by开始--------】
   */
  describe('【order by】', () => {
    it('do', () => {
      const zql = ZQL.stringify({
        tableName: 'host',
        orderBy: 'createTime',
        orderDirection: 'asc'
      })
      const Rs = 'query host order by createTime asc'
      expect(zql).toBe(Rs)
    })
  })

  /**
   * 【--------named as开始--------】
   */
  describe('【named as】', () => {
    it('do', () => {
      const zql = ZQL.stringify({
        tableName: 'volumebackup',
        condition: {
          status: 'Ready',
          'backupStorage.__systemTag__': {
            [ZOp.in]: ['onlybackup', 'allowbackup']
          }
        },
        orderBy: 'createDate',
        orderDirection: 'desc',
        limit: 1,
        offset: 10,
        namedAs: 'backupData'
      })
      const Rs =
        "query volumebackup where status='Ready' and backupStorage.__systemTag__ in ('onlybackup','allowbackup') order by createDate desc limit 1 offset 10 named as 'backupData'"
      expect(zql).toBe(Rs)
    })
  })

  /**
   * 【--------restrict by开始--------】
   */
  describe('【restrict by】', () => {
    it('1. 单个', () => {
      const zql = ZQL.stringify({
        tableName: 'hostcapacity',
        fields: 'cpuNum',
        restrictBy: {
          'l2network.uuid': {
            [ZOp.in]: ['xxxxx1', 'xxxxx2']
          }
        },
        orderBy: 'cpuNum',
        orderDirection: 'desc',
        limit: 1
      })
      const Rs =
        "query hostcapacity.cpuNum restrict by (l2network.uuid in ('xxxxx1','xxxxx2')) order by cpuNum desc limit 1"
      expect(zql).toBe(Rs)
    })

    it('2. 多个', () => {
      const zql = ZQL.stringify({
        tableName: 'hostcapacity',
        fields: 'cpuNum',
        restrictBy: {
          'l2network.uuid': {
            [ZOp.in]: ['xxxxx1', 'xxxxx2']
          },
          'zone.name': {
            [ZOp.like]: 'east-'
          }
        },
        orderBy: 'cpuNum',
        orderDirection: 'desc',
        limit: 1
      })
      const Rs =
        "query hostcapacity.cpuNum restrict by (l2network.uuid in ('xxxxx1','xxxxx2'), zone.name like '%east-%') order by cpuNum desc limit 1"
      expect(zql).toBe(Rs)
    })
  })

  /**
   * 【--------return with开始--------】
   */
  describe('【return with】', () => {
    it('1. total', () => {
      const zql = ZQL.stringify({
        tableName: 'vminstance',
        condition: {
          cpuNum: {
            [ZOp.gt]: 8
          }
        },
        returnWith: {
          total: true
        },
        limit: 1
      })
      const Rs = 'query vminstance where cpuNum>8 return with (total) limit 1'
      expect(zql).toBe(Rs)
    })

    it('2. 单个zwatch', () => {
      const zql = ZQL.stringify({
        tableName: 'vminstance',
        condition: {
          cpuNum: {
            [ZOp.gt]: 8
          }
        },
        returnWith: {
          zwatch: [
            {
              metricName: 'CPUUsedUtilization',
              offsetAheadOfCurrentTime: 3600,
              period: 10,
              labels: ['CPUNum=10', 'CPUNum=100'],
              functions: ['limit(limit=10)', 'top(num=2)']
            }
          ]
        }
      })
      const Rs =
        "query vminstance where cpuNum>8 return with (zwatch{metricName='CPUUsedUtilization',offsetAheadOfCurrentTime=3600,period=10,labels='CPUNum=10',labels='CPUNum=100',functions=limit(limit=10),functions=top(num=2)})"
      expect(zql).toBe(Rs)
    })

    it('3. total和zwatch联合', () => {
      const zql = ZQL.stringify({
        tableName: 'vminstance',
        condition: {
          cpuNum: {
            [ZOp.gt]: 8
          }
        },
        returnWith: {
          total: true,
          zwatch: [
            {
              metricName: 'CPUUsedUtilization',
              offsetAheadOfCurrentTime: 3600,
              period: 10,
              labels: ['CPUNum=10', 'CPUNum=100'],
              functions: ['limit(limit=10)', 'top(num=2)']
            }
          ]
        }
      })
      const Rs =
        "query vminstance where cpuNum>8 return with (total, zwatch{metricName='CPUUsedUtilization',offsetAheadOfCurrentTime=3600,period=10,labels='CPUNum=10',labels='CPUNum=100',functions=limit(limit=10),functions=top(num=2)})"
      expect(zql).toBe(Rs)
    })

    it('4. 多个zwatch', () => {
      const zql = ZQL.stringify({
        tableName: 'vminstance',
        fields: ['name'],
        condition: {
          cpuNum: {
            [ZOp.gt]: 8
          }
        },
        returnWith: {
          zwatch: [
            {
              resultName: 'zwatch1',
              metricName: 'CPUUsedUtilization',
              offsetAheadOfCurrentTime: 3600,
              period: 10,
              labels: ['CPUNum=10', 'CPUNum=100'],
              functions: ['limit(limit=10)', 'top(num=2)']
            },
            {
              resultName: 'zwatch2',
              metricName: 'CPUUsedUtilization',
              offsetAheadOfCurrentTime: 3600,
              period: 10,
              labels: ['CPUNum=10', 'CPUNum=100'],
              functions: ['limit(limit=10)', 'top(num=2)']
            }
          ]
        }
      })
      const Rs =
        "query vminstance.name where cpuNum>8 return with (zwatch{resultName='zwatch1',metricName='CPUUsedUtilization',offsetAheadOfCurrentTime=3600,period=10,labels='CPUNum=10',labels='CPUNum=100',functions=limit(limit=10),functions=top(num=2)}, zwatch{resultName='zwatch2',metricName='CPUUsedUtilization',offsetAheadOfCurrentTime=3600,period=10,labels='CPUNum=10',labels='CPUNum=100',functions=limit(limit=10),functions=top(num=2)})"
      expect(zql).toBe(Rs)
    })
  })

  /**
   * 【-------- search 开始--------】
   */
  describe('【search】', () => {
    it('1. 简单搜索', () => {
      const zql = ZQL.stringify({
        action: ZQLAction.SEARCH,
        keyword: 'vm'
      })
      const Rs = "search 'vm'"
      expect(zql).toBe(Rs)
    })
    it('2. 搜索加区域', () => {
      const zql = ZQL.stringify({
        action: ZQLAction.SEARCH,
        keyword: 'vm',
        restrictBy: {
          'zone.uuid': {
            [ZOp.eq]: 'fec2889fef2d49b1967c7e39025f4eb4'
          }
        }
      })
      const Rs = "search 'vm' restrict by (zone.uuid='fec2889fef2d49b1967c7e39025f4eb4')"
      expect(zql).toBe(Rs)
    })
    it('3. 搜索加资源类型和区域', () => {
      const zql = ZQL.stringify({
        action: ZQLAction.SEARCH,
        keyword: 'vm',
        tableName: 'vmInstance',
        restrictBy: {
          'zone.uuid': {
            [ZOp.eq]: 'fec2889fef2d49b1967c7e39025f4eb4'
          }
        }
      })
      const Rs =
        "search 'vm' from vmInstance restrict by (zone.uuid='fec2889fef2d49b1967c7e39025f4eb4')"
      expect(zql).toBe(Rs)
    })
  })

  /**
   * 【----- getapi 开始------】
   */
  describe('【getapi】', () => {
    it('1. getapi 转换——cluster', () => {
      const zql = ZQL.stringify({
        action: ZQLAction.QUERY,
        tableName: 'cluster',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.getapi]: {
                action: ZQLAction.GET_API,
                api: 'GetCandidateZonesClustersHostsForCreatingVm',
                output: 'clusters.uuid',
                condition: {
                  imageUuid: '99f31eb0d9f5439a9e0dff2475910305',
                  l3NetworkUuids: {
                    [ZOp.in]: ['49e2507a4a154f5d91c47467accd0dbb']
                  },
                  instanceOfferingUuid: 'f5440e35f1f44693a97278255ddfde4f',
                  rootDiskOfferingUuid: '0d3f112e8b7c48faba1b96dcfccaeb76',
                  cpuNum: 1,
                  memorySize: 104857600
                }
              }
            }
          }
        }
      })

      /**
admin >>>ZQLQuery zql="query cluster where uuid in (getapi(api='GetCandidateZonesClustersHostsForCreatingVm',output='clusters.uuid',imageUuid='99f31eb0d9f5439a9e0dff2475910305',l3NetworkUuids=list('49e2507a4a154f5d91c47467accd0dbb'),instanceOfferingUuid='f5440e35f1f44693a97278255ddfde4f',rootDiskOfferingUuid='0d3f112e8b7c48faba1b96dcfccaeb76',cpuNum=1,memorySize=104857600))"
{
    "results": [
        {
            "inventories": [
                {
                    "architecture": "x86_64",
                    "createDate": "May 14, 2021 3:06:14 PM",
                    "description": "",
                    "hypervisorType": "KVM",
                    "lastOpDate": "May 14, 2021 3:06:14 PM",
                    "name": "Cluster-1",
                    "state": "Enabled",
                    "type": "zstack",
                    "uuid": "1175848986114c12bf91ff6705491729",
                    "zoneUuid": "a2096e04e0ef489eb78ac3449ea52381"
                }
            ]
        }
    ],
    "success": true
}
       */

      const Rs =
        "query cluster where uuid in (getapi(api='GetCandidateZonesClustersHostsForCreatingVm',output='clusters.uuid',imageUuid='99f31eb0d9f5439a9e0dff2475910305',l3NetworkUuids=list('49e2507a4a154f5d91c47467accd0dbb'),instanceOfferingUuid='f5440e35f1f44693a97278255ddfde4f',rootDiskOfferingUuid='0d3f112e8b7c48faba1b96dcfccaeb76',cpuNum=1,memorySize=104857600))"
      expect(zql).toBe(Rs)
    })

    it('2. getapi 转换——pcidevicespec', () => {
      const zql = ZQL.stringify({
        tableName: 'pcidevicespec',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.getapi]: {
                action: ZQLAction.GET_API,
                api: 'GetPciDeviceSpecCandidates',
                output: 'inventories.uuid',
                condition: {
                  clusterUuids: {
                    [ZOp.in]: ['123', '456']
                  },
                  type: '3D_Controller'
                }
              }
            }
          }
        }
      })
      const Rs =
        "query pcidevicespec where uuid in (getapi(api='GetPciDeviceSpecCandidates',output='inventories.uuid',clusterUuids=list('123','456'),type='3D_Controller'))"
      expect(zql).toBe(Rs)
    })
  })
})
