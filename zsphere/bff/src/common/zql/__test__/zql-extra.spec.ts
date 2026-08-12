import ZQL, { ZQLAction, ZQLFn, ZOp } from '../index'

describe('ZQL.multStringify', () => {
  it('多个 query 用分号拼接', () => {
    const zql = ZQL.multStringify([{ tableName: 'VmInstance' }, { tableName: 'Host' }])
    expect(zql).toBe('query VmInstance;query Host')
  })

  it('混合 query 和 count', () => {
    const zql = ZQL.multStringify([
      { tableName: 'VmInstance', fields: ['uuid', 'name'] },
      {
        action: ZQLAction.COUNT,
        tableName: 'VmInstance',
        condition: { type: 'UserVm' }
      }
    ])
    expect(zql).toBe("query VmInstance.uuid,name;count VmInstance where type='UserVm'")
  })

  it('带 namedAs 的多语句', () => {
    const zql = ZQL.multStringify([
      { tableName: 'VmInstance', namedAs: 'vms' },
      { tableName: 'Host', namedAs: 'hosts' }
    ])
    expect(zql).toBe("query VmInstance named as 'vms';query Host named as 'hosts'")
  })

  it('单个元素不带分号', () => {
    const zql = ZQL.multStringify([{ tableName: 'VmInstance' }])
    expect(zql).toBe('query VmInstance')
  })

  it('空数组返回空字符串', () => {
    const zql = ZQL.multStringify([])
    expect(zql).toBe('')
  })

  it('三个 sum 语句', () => {
    const zql = ZQL.multStringify([
      {
        action: ZQLAction.SUM,
        tableName: 'volume',
        fields: 'size',
        sumBy: 'type'
      },
      {
        action: ZQLAction.SUM,
        tableName: 'volume',
        fields: 'actualSize',
        sumBy: 'type'
      },
      {
        action: ZQLAction.SUM,
        tableName: 'hostcapacity',
        fields: 'cpuSockets',
        sumBy: 'uuid'
      }
    ])
    expect(zql).toBe(
      'sum volume.size by type;sum volume.actualSize by type;sum hostcapacity.cpuSockets by uuid'
    )
  })
})

describe('ZQL.stringify 边界场景', () => {
  it('condition 为空对象不输出 where', () => {
    const zql = ZQL.stringify({ tableName: 'VmInstance', condition: {} })
    expect(zql).toBe('query VmInstance')
  })

  it('fields 为空数组不输出字段', () => {
    const zql = ZQL.stringify({ tableName: 'VmInstance', fields: [] })
    expect(zql).toBe('query VmInstance')
  })

  it('returnWith 没有 total 也没有 zwatch 应抛错', () => {
    expect(() =>
      ZQL.stringify({
        tableName: 'VmInstance',
        returnWith: { total: false, zwatch: [] }
      })
    ).toThrow('[return with]')
  })

  it('sum 缺少必选字段应抛错', () => {
    expect(() =>
      ZQL.stringify({
        action: ZQLAction.SUM,
        tableName: 'volume'
        // 缺少 fields 和 sumBy
      } as any)
    ).toThrow('required')
  })

  it('search 缺少 keyword 应抛错', () => {
    expect(() =>
      ZQL.stringify({
        action: ZQLAction.SEARCH
        // 缺少 keyword
      } as any)
    ).toThrow('required')
  })

  it('count 带 function', () => {
    const zql = ZQL.stringify({
      action: ZQLAction.COUNT,
      fnName: ZQLFn.distinct,
      tableName: 'VmInstance',
      fields: ['clusterUuid']
    })
    expect(zql).toBe('count distinct(VmInstance.clusterUuid)')
  })

  it('exactLike 操作符', () => {
    const zql = ZQL.stringify({
      tableName: 'VmInstance',
      condition: {
        name: {
          [ZOp.exactLike]: "'test%'"
        }
      }
    })
    expect(zql).toContain('like')
    expect(zql).toContain('test%')
  })

  it('多层嵌套子查询', () => {
    const zql = ZQL.stringify({
      tableName: 'VmInstance',
      condition: {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'AccountResourceRef',
              fields: ['resourceUuid'],
              condition: {
                accountUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'Account',
                      fields: ['uuid'],
                      condition: { name: 'admin' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
    expect(zql).toContain('uuid in (query AccountResourceRef.resourceUuid')
    expect(zql).toContain('accountUuid in (query Account.uuid')
    expect(zql).toContain("name='admin'")
  })

  it('returnWith zwatch 带 pagination', () => {
    const zql = ZQL.stringify({
      tableName: 'VmInstance',
      returnWith: {
        zwatch: [
          {
            metricName: 'CPUUsedUtilization',
            offsetAheadOfCurrentTime: 3600,
            period: 10,
            limit: 50,
            start: 0
          }
        ]
      }
    })
    expect(zql).toContain('functions=pagination(limit="50",start="0")')
  })

  it('returnWith zwatch 带 valueConditions', () => {
    const zql = ZQL.stringify({
      tableName: 'VmInstance',
      returnWith: {
        zwatch: [
          {
            metricName: 'CPUUsedUtilization',
            offsetAheadOfCurrentTime: 3600,
            period: 10,
            valueConditions: ['value>80']
          }
        ]
      }
    })
    expect(zql).toContain("valueConditions='value>80'")
  })

  it('groupBy 字符串形式', () => {
    const zql = ZQL.stringify({
      tableName: 'VmInstance',
      groupBy: 'clusterUuid'
    })
    expect(zql).toBe('query VmInstance group by clusterUuid')
  })

  it('offset 为 0 被 falsy 过滤（已知行为，offset=0 不输出）', () => {
    const zql = ZQL.stringify({
      tableName: 'VmInstance',
      limit: 20,
      offset: 0
    })
    // 注意: offset=0 因为 !!0 === false 不会输出，这是一个已知的边界问题
    expect(zql).toBe('query VmInstance limit 20')
  })
})
