import { Op } from '../../../api/zstack/base/query-base'
import {
  QueryConditionTranslator,
  mergeZqlObject,
  arrayToMap,
  arrayToArrayMap
} from '../queryConditionTranslator'
import ZOp from '../zop'

describe('QueryConditionTranslator', () => {
  describe('translate', () => {
    it('单条件 eq 转换', () => {
      const result = QueryConditionTranslator.translate([{ key: 'name', value: 'test', op: Op.eq }])
      expect(result).toEqual({
        [ZOp.and]: [{ name: { [Op.eq]: 'test' } }]
      })
    })

    it('多条件转换为 and 数组', () => {
      const result = QueryConditionTranslator.translate([
        { key: 'name', value: 'test', op: Op.eq },
        { key: 'state', value: 'Running', op: Op.eq }
      ])
      expect(result[ZOp.and]).toHaveLength(2)
      expect(result[ZOp.and][0]).toEqual({ name: { [Op.eq]: 'test' } })
      expect(result[ZOp.and][1]).toEqual({ state: { [Op.eq]: 'Running' } })
    })

    it('like 操作符', () => {
      const result = QueryConditionTranslator.translate([{ key: 'name', value: 'vm', op: Op.like }])
      expect(result[ZOp.and][0]).toEqual({ name: { [Op.like]: 'vm' } })
    })

    it('默认 op 为 eq', () => {
      const result = QueryConditionTranslator.translate([{ key: 'uuid', value: 'abc123' }])
      expect(result[ZOp.and][0]).toEqual({ uuid: { [Op.eq]: 'abc123' } })
    })

    it('带 extraConditions 合并', () => {
      const extra = { type: 'UserVm' }
      const result = QueryConditionTranslator.translate(
        [{ key: 'name', value: 'test', op: Op.eq }],
        extra
      )
      expect(result[ZOp.and]).toContainEqual(extra)
    })

    it('空 conditions 无 extra 返回空对象', () => {
      const result = QueryConditionTranslator.translate([])
      expect(result).toEqual({})
    })
  })
})

describe('mergeZqlObject', () => {
  it('合并两个无冲突的 zqlObject', () => {
    const result = mergeZqlObject(
      { tableName: 'VmInstance', fields: ['uuid', 'name'] },
      { fields: ['state'], condition: { type: 'UserVm' } }
    )
    expect(result.tableName).toBe('VmInstance')
    expect(result.fields).toEqual(expect.arrayContaining(['uuid', 'name', 'state']))
    expect(result.condition).toEqual({ type: 'UserVm' })
  })

  it('字段去重', () => {
    const result = mergeZqlObject({ fields: ['uuid', 'name'] }, { fields: ['name', 'state'] })
    expect(result.fields).toEqual(['uuid', 'name', 'state'])
  })

  it('相同 key 的条件合并为 and', () => {
    const result = mergeZqlObject({ condition: { name: 'a' } }, { condition: { name: 'b' } })
    expect(result.condition[ZOp[ZOp.and]]).toBeDefined()
  })

  it('null 输入不报错', () => {
    expect(() => mergeZqlObject(null, null)).not.toThrow()
  })
})

describe('arrayToMap', () => {
  it('按 uuid 映射', () => {
    const arr = [
      { uuid: 'a', name: 'Alice' },
      { uuid: 'b', name: 'Bob' }
    ]
    const map = arrayToMap(arr)
    expect(map.a).toEqual({ uuid: 'a', name: 'Alice' })
    expect(map.b).toEqual({ uuid: 'b', name: 'Bob' })
  })

  it('自定义 key', () => {
    const arr = [{ id: 'x', value: 1 }]
    const map = arrayToMap(arr, 'id')
    expect(map.x).toEqual({ id: 'x', value: 1 })
  })

  it('空数组返回空对象', () => {
    expect(arrayToMap([])).toEqual({})
  })
})

describe('arrayToArrayMap', () => {
  it('相同 key 的元素分组', () => {
    const arr = [
      { uuid: 'a', v: 1 },
      { uuid: 'a', v: 2 },
      { uuid: 'b', v: 3 }
    ]
    const map = arrayToArrayMap(arr)
    expect(map.a).toHaveLength(2)
    expect(map.b).toHaveLength(1)
  })

  it('空数组返回空对象', () => {
    expect(arrayToArrayMap([])).toEqual({})
  })
})
