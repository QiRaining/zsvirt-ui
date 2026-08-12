import { Op } from '../../../api/zstack/base/query-base'
import { QueryConditionTranslator } from '../index'

// yarn test test-queryConditionTranslator-translate

describe('zql builder', () => {
  beforeEach(async () => {})

  describe('【query】', () => {
    it('1. 空数组in的转换', () => {
      const zqlObject = QueryConditionTranslator.translate([
        {
          key: 'uuid',
          op: Op.in,
          values: []
        }
      ])
      const Rs = {
        uuid: {
          in: []
        }
      }
      const Rs1 = {
        uuid: {
          in: undefined
        }
      }
      expect(zqlObject).toEqual(Rs)
      expect(zqlObject).not.toEqual(Rs1)
    })

    it('2. 非空数组in的转换', () => {
      const zqlObject = QueryConditionTranslator.translate([
        {
          key: 'uuid',
          op: Op.in,
          values: ['123']
        }
      ])
      const Rs = {
        uuid: {
          in: ['123']
        }
      }
      const Rs1 = {
        uuid: {
          in: ['1234']
        }
      }
      expect(zqlObject).toEqual(Rs)
      expect(zqlObject).not.toEqual(Rs1)
    })

    it('3. 转换——等于', () => {
      const zqlObject = QueryConditionTranslator.translate([
        {
          key: 'uuid',
          op: Op.eq,
          value: '123'
        }
      ])
      const Rs = {
        uuid: {
          eq: '123'
        }
      }
      expect(zqlObject).toEqual(Rs)
    })

    it('4. 转换——等于——undefined', () => {
      const zqlObject = QueryConditionTranslator.translate([
        {
          key: 'uuid',
          op: Op.eq,
          value: undefined
        }
      ])
      const Rs = {
        uuid: {
          eq: null
        }
      }
      expect(zqlObject).toEqual(Rs)
    })

    it('5. 转换——等于——空', () => {
      const zqlObject = QueryConditionTranslator.translate([
        {
          key: 'uuid',
          op: Op.eq,
          value: ''
        }
      ])
      const Rs = {
        uuid: {
          eq: ''
        }
      }
      expect(zqlObject).toEqual(Rs)
    })

    it('6. 转换——ne', () => {
      const zqlObject = QueryConditionTranslator.translate([
        {
          key: 'uuid',
          op: Op.ne,
          value: '123'
        }
      ])
      const Rs = {
        uuid: {
          ne: '123'
        }
      }
      expect(zqlObject).toEqual(Rs)
    })

    it('7. 转换——ne——undefined', () => {
      const zqlObject = QueryConditionTranslator.translate([
        {
          key: 'uuid',
          op: Op.ne,
          value: undefined
        }
      ])
      const Rs = {
        uuid: {
          ne: null
        }
      }
      expect(zqlObject).toEqual(Rs)
    })

    it('8. 转换——ne——空', () => {
      const zqlObject = QueryConditionTranslator.translate([
        {
          key: 'uuid',
          op: Op.ne,
          value: ''
        }
      ])
      const Rs = {
        uuid: {
          ne: ''
        }
      }
      expect(zqlObject).toEqual(Rs)
    })

    it('9. 转换——is——空', () => {
      const zqlObject = QueryConditionTranslator.translate([
        {
          key: 'uuid',
          op: Op.is
        }
      ])
      const Rs = {
        uuid: {
          is: null
        }
      }
      expect(zqlObject).toEqual(Rs)
    })

    it('10. 转换——not——空', () => {
      const zqlObject = QueryConditionTranslator.translate([
        {
          key: 'uuid',
          op: Op.not
        }
      ])
      const Rs = {
        uuid: {
          not: null
        }
      }
      expect(zqlObject).toEqual(Rs)
    })

    it('11. 转换——not——空', () => {
      const zqlObject = QueryConditionTranslator.translate([
        {
          key: 'status',
          op: Op.ne,
          value: 'NotInstantiated'
        },
        {
          key: 'status',
          op: Op.ne,
          value: 'Deleted'
        }
      ])
      const Rs = {
        status: {
          ne: 'NotInstantiated'
        }
      }
      console.log(JSON.stringify(zqlObject))
      expect(zqlObject).toEqual(Rs)
    })
  })
})
