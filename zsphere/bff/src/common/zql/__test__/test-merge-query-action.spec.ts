import { Op } from '../../../api/zstack/base/query-base'
import { QueryAction, SortDirectionValidValues } from '../../model/action-query.model'
import { QueryConditionTranslator } from '../queryConditionTranslator'
import ZOp from '../zop'
import { ZqlObject } from '../zqlBuilder'

describe('mergeQueryAction: 合并queryaction 到 ZqlObject', () => {
  test(`queryaction 合并 ZqlObject：合并所有的key，忽略不需要的key`, () => {
    const queryAction: QueryAction = {
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: 'uuid1'
        },
        {
          key: 'name',
          op: Op.ne,
          value: 'name1'
        }
      ],
      extraConditions: [
        {
          key: 'zoneUuid',
          op: Op.ne,
          value: 'zoneUuid1'
        }
      ],
      limit: 100,
      start: 10,
      count: true,
      groupBy: 'zoneUuid',
      replyWithCount: true,
      sortBy: 'createDate',
      sortDirection: SortDirectionValidValues.desc,
      fields: ['uuid', 'name'],
      type: 'Normal'
    }
    const zqlObject: ZqlObject = {
      tableName: 'l2Network',
      condition: {
        l3NetworkUuid: 'l3NetworkUuid1',
        [ZOp.or]: [
          {
            useFor: {
              [ZOp.notIn]: ['Eip']
            }
          },
          {
            useFor: {
              [ZOp.is]: null
            }
          }
        ]
      }
    }
    const res = QueryConditionTranslator.mergeQueryAction(queryAction, zqlObject)

    expect(res).toStrictEqual({
      tableName: 'l2Network',
      fields: ['uuid', 'name'],
      returnWith: {
        total: true
      },
      groupBy: 'zoneUuid',
      orderBy: 'createDate',
      orderDirection: SortDirectionValidValues[SortDirectionValidValues.desc],
      limit: 100,
      offset: 10,
      condition: {
        uuid: 'uuid1',
        name: {
          [ZOp.ne]: 'name1'
        },
        l3NetworkUuid: 'l3NetworkUuid1',
        [ZOp.or]: [
          {
            useFor: {
              [ZOp.notIn]: ['Eip']
            }
          },
          {
            useFor: {
              [ZOp.is]: null
            }
          }
        ]
      }
    })

    expect(res).not.toContain({
      extraConditions: [
        {
          key: 'zoneUuid',
          op: Op.ne,
          value: 'zoneUuid1'
        }
      ],
      type: 'Normal'
    })
  })

  it(`queryaction 重复key合并 :
  conditions:[
    {key:'uuid',op:Op.in,values:[1]},
    {key:'uuid',op:Op.in,values:[2]}
  ]`, () => {
    const queryAction: QueryAction = {
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: 'uuid1'
        },
        {
          key: 'uuid',
          op: Op.eq,
          value: 'uuid2'
        },
        {
          key: 'uuid',
          op: Op.ne,
          value: 'uuid3'
        },
        {
          key: 'uuid',
          op: Op.notIn,
          values: ['uuid4', 'uuid5']
        },
        {
          key: 'name',
          op: Op.ne,
          value: 'name1'
        },
        {
          key: 'name',
          op: Op.eq,
          value: 'name2'
        },
        {
          key: 'l3NetworkUuid',
          op: Op.eq,
          value: 'l3NetworkUuid_action'
        }
      ],
      extraConditions: [
        {
          key: 'zoneUuid',
          op: Op.ne,
          value: 'zoneUuid1'
        }
      ],
      limit: 100,
      start: 10,
      count: true,
      groupBy: 'zoneUuid',
      replyWithCount: true,
      sortBy: 'createDate',
      sortDirection: SortDirectionValidValues.desc,
      fields: ['uuid', 'name'],
      type: 'Normal'
    }
    const zqlObject: ZqlObject = {
      tableName: 'l2Network',
      condition: {
        l3NetworkUuid: 'l3NetworkUuid1__zqlObject',
        zoneUuid: 'zoneUuid1',
        uuid: 'uuid__zqlObject',
        [ZOp.or]: [
          {
            useFor: {
              [ZOp.notIn]: ['Eip']
            }
          },
          {
            useFor: {
              [ZOp.is]: null
            }
          }
        ]
      }
    }
    const res = QueryConditionTranslator.mergeQueryAction(queryAction, zqlObject)

    expect(res).toStrictEqual({
      tableName: 'l2Network',
      fields: ['uuid', 'name'],
      returnWith: {
        total: true
      },
      groupBy: 'zoneUuid',
      orderBy: 'createDate',
      orderDirection: SortDirectionValidValues[SortDirectionValidValues.desc],
      limit: 100,
      offset: 10,
      condition: {
        [ZOp.and]: [
          {
            uuid: 'uuid1'
          },
          {
            uuid: 'uuid2'
          },
          {
            uuid: {
              [ZOp.ne]: 'uuid3'
            }
          },
          {
            uuid: {
              [ZOp.notIn]: ['uuid4', 'uuid5']
            }
          },
          {
            name: {
              [ZOp.ne]: 'name1'
            }
          },
          {
            name: 'name2'
          },
          {
            l3NetworkUuid: 'l3NetworkUuid1__zqlObject'
          },
          {
            l3NetworkUuid: 'l3NetworkUuid_action'
          },
          {
            uuid: 'uuid__zqlObject'
          }
        ],
        zoneUuid: 'zoneUuid1',
        [ZOp.or]: [
          {
            useFor: {
              [ZOp.notIn]: ['Eip']
            }
          },
          {
            useFor: {
              [ZOp.is]: null
            }
          }
        ]
      }
    })
  })

  it(`queryaction 重复key合并，zqlObject And :
  conditions:[
    {key:'uuid',op:Op.in,values:[1]},
    {key:'uuid',op:Op.in,values:[2]}
  ]`, () => {
    const queryAction: QueryAction = {
      conditions: [
        {
          key: 'name',
          op: Op.eq,
          value: 'name1'
        },
        {
          key: 'uuid',
          op: Op.eq,
          value: 'uuid1'
        },
        {
          key: 'uuid',
          op: Op.ne,
          value: 'uuid3'
        },
        {
          key: 'uuid',
          op: Op.notIn,
          values: ['uuid4', 'uuid5']
        },
        {
          key: 'l3NetworkUuid',
          op: Op.notIn,
          values: ['l3NetworkUuid1']
        }
      ]
    }
    const zqlObject: ZqlObject = {
      tableName: 'l2Network',
      condition: {
        l3NetworkUuid: 'l3NetworkUuid1__zqlObject',
        zoneUuid: 'zoneUuid1',
        [ZOp.and]: [
          {
            uuid: 'uuid1__zqlObject'
          }
        ]
      }
    }
    const res = QueryConditionTranslator.mergeQueryAction(queryAction, zqlObject)

    expect(res).toStrictEqual({
      tableName: 'l2Network',
      condition: {
        [ZOp.and]: [
          {
            uuid: 'uuid1'
          },
          {
            uuid: {
              [ZOp.ne]: 'uuid3'
            }
          },
          {
            uuid: {
              [ZOp.notIn]: ['uuid4', 'uuid5']
            }
          },
          {
            l3NetworkUuid: 'l3NetworkUuid1__zqlObject'
          },
          {
            l3NetworkUuid: {
              [ZOp.notIn]: ['l3NetworkUuid1']
            }
          },
          {
            uuid: 'uuid1__zqlObject'
          }
        ],
        zoneUuid: 'zoneUuid1',
        name: 'name1'
      }
    })
  })
})
