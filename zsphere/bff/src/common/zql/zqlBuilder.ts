import { difference, isEmpty } from 'lodash'

import ZQLAction from './zaction'
import type ZQLFn from './zfn'
import ZOp, { ZOpMap } from './zop'

export interface PlainObject {
  [propName: string]: any
}

export interface ZwatchObject {
  namespace?: string
  resultName?: string
  metricName?: string
  startTime?: number
  endTime?: number
  offsetAheadOfCurrentTime?: number
  period?: number
  labels?: string[]
  functions?: string[]
  valueConditions?: string[]
  limit?: number
  start?: number
}

export interface GetApiObject {
  api: string
  output: string
  condition?: PlainObject
}

export interface ReturnWithObject {
  total?: boolean
  zwatch?: ZwatchObject[]
}

export interface ZqlObject {
  action?: ZQLAction
  fnName?: ZQLFn
  tableName?: string
  fields?: string | string[]
  sumBy?: string
  condition?: PlainObject
  returnWith?: ReturnWithObject
  restrictBy?: PlainObject
  groupBy?: string | string[]
  orderBy?: string
  orderDirection?: 'desc' | 'asc'
  limit?: number
  offset?: number
  namedAs?: string
  keyword?: string
}

interface ParseCondition {
  key: any
  value: any
  name: string
  baseOp: ZOp
  logicOp: null
  [key: string]: any
}

enum ZQL_CONSTANT {
  sumBy = 'sumBy',
  returnWith = 'returnWith',
  restrictBy = 'restrictBy',
  groupBy = 'groupBy',
  orderBy = 'orderBy',
  orderDirection = 'orderDirection',
  limit = 'limit',
  offset = 'offset',
  namedAs = 'namedAs'
}

interface IZQL {
  stringify: (obj: ZqlObject) => string
  multStringify: (zqlObjectList: ZqlObject[]) => string
}

const ZQLExport: IZQL = class ZQL {
  // zql 必选字段
  private static requiredMap = {
    [ZQLAction.QUERY]: ['tableName'],
    [ZQLAction.SUM]: ['tableName', 'fields', 'sumBy'],
    [ZQLAction.COUNT]: ['tableName'],
    [ZQLAction.GET_API]: ['api', 'output'],
    [ZQLAction.SEARCH]: ['keyword']
  }

  // zql extra关键字
  private static zqlExtraKeyWordMap = new Map([
    [ZQL_CONSTANT.sumBy, ' by '],
    [ZQL_CONSTANT.groupBy, ' group by '],
    [ZQL_CONSTANT.orderBy, ' order by '],
    [ZQL_CONSTANT.orderDirection, ''],
    [ZQL_CONSTANT.limit, ' limit '],
    [ZQL_CONSTANT.offset, ' offset '],
    [ZQL_CONSTANT.namedAs, ' named as '],
    [ZQL_CONSTANT.restrictBy, ' restrict by '],
    [ZQL_CONSTANT.returnWith, ' return with ']
  ])

  /**
   * zqlTemplate 输入解析
   *  会检查 required 字段
   */
  private static zqlTemplateParser = (strings, ...keys): ((...values: any[]) => string) => {
    return (...values) => {
      const dict = values[values.length - 1] || {}
      ZQL.utils.checkKeysRequired(Object.keys(dict), dict)
      const result = [strings[0]]
      keys.forEach((key, i) => {
        0
        if (!ZQL.zqlExtraKeyWordMap.has(key)) {
          // 解析通用的 query tableName fields condition
          const value = Number.isInteger(key) ? values[key] : ZQL.parseCommonZqlKey(key, dict) || ''
          result.push(value, strings[i + 1])
        } else {
          // 解析zqlExtraKeyWordMap中的关键字
          const extra = ZQL.parseExtraZqlKeyWords(key, dict, strings[i + 1])
          !!extra ? result.push(extra) : null
        }
      })
      return result.join('')
    }
  }

  // 用于处理query
  private static zqlQueryTemplate: (...values: any[]) => string =
    ZQL.zqlTemplateParser`query ${'fnName'}${'fnName?.('}${'tableName'}${'fields?..'}${'fields'}${'fnName?.)'} ${'condition?.where'} ${'condition'} ${'restrictBy'} ${'returnWith'} ${'groupBy'} ${'orderBy'} ${'orderDirection'} ${'limit'} ${'offset'} ${'namedAs'}`

  // 用于处理count
  private static zqlCountTemplate: (...values: any[]) => string =
    ZQL.zqlTemplateParser`count ${'fnName'}${'fnName?.('}${'tableName'}${'fields?..'}${'fields'}${'fnName?.)'} ${'condition?.where'} ${'condition'} ${'groupBy'} ${'orderBy'} ${'orderDirection'} ${'limit'} ${'offset'} ${'namedAs'}`

  // 用于处理sum
  private static zqlSumTemplate: (...values: any[]) => string =
    ZQL.zqlTemplateParser`sum ${'tableName'}.${'fields'} ${'sumBy'} ${'condition?.where'} ${'condition'} ${'orderBy'} ${'orderDirection'} ${'limit'} ${'offset'} ${'namedAs'}`

  private static zqlGetApiTemplate: (...values: any[]) => string =
    ZQL.zqlTemplateParser`getapi(api='${'api'}',output='${'output'}',${'condition'})`

  private static zqlSearchTemplate: (...values: any[]) => string =
    ZQL.zqlTemplateParser`search '${'keyword'}' ${'tableName?.from'} ${'tableName'} ${'restrictBy'}`

  public static stringify(zqlObject: ZqlObject, options?: any) {
    let __zqlResult = null
    const { action = ZQLAction.QUERY } = zqlObject
    switch (action) {
      case ZQLAction.QUERY:
        __zqlResult = `${ZQL.zqlQueryTemplate(zqlObject).replace(/\s+/g, ' ').trim()};`
        break
      case ZQLAction.SUM:
        __zqlResult = `${ZQL.zqlSumTemplate(zqlObject).replace(/\s+/g, ' ').trim()};`
        break
      case ZQLAction.COUNT:
        __zqlResult = `${ZQL.zqlCountTemplate(zqlObject).replace(/\s+/g, ' ').trim()};`
        break
      case ZQLAction.GET_API:
        __zqlResult = `${ZQL.zqlGetApiTemplate(zqlObject)
          .replace(/\s+/g, ' ')
          .replace(/ in \(/g, '=list(')
          .trim()};`
        break
      case ZQLAction.SEARCH:
        __zqlResult = `${ZQL.zqlSearchTemplate(zqlObject).replace(/\s+/g, ' ').trim()};`
        break
    }
    // 后端语句中暂时不支持[分号]，所以全部移除
    if (true || options?.removeSemicolon) {
      __zqlResult = __zqlResult.slice(0, -1)
    }

    return __zqlResult
  }

  public static multStringify(zqlObjectList: ZqlObject[]) {
    const __resultList = []
    for (const zqlObject of zqlObjectList) {
      __resultList.push(ZQL.stringify(zqlObject))
    }
    const result = __resultList.join(';')
    return result
  }

  /**
   *  解析通用的 query tableName fields condition
   *  对于 condition 部分执行 ParseCondition
   */
  private static parseCommonZqlKey = (name: string, dict: PlainObject): string => {
    if (/^(.+?)\?\.(.+?)$/.test(name)) {
      // 处理可选项 a?.b
      //  如果 a 关键字存在，显示 b 字符串，否则过滤掉
      const [, nameKey = '', nameValue = ''] = /^(.+?)\?\.(.+?)$/.exec(name) || []
      if (!ZQL.utils.isEmpty(dict[nameKey])) {
        return nameValue
      }
      return ''
    }
    if (Array.isArray(dict[name])) {
      // 处理列表传入的情况
      return dict[name].join(',')
    }
    if (name === 'condition') {
      return ZQL.ParseCondition(dict[name])
    }
    if (ZQL.utils.isEmpty(dict[name])) {
      return ''
    }
    return dict[name]
  }

  /**
   * 解析zqlExtraKeyWordMap中的关键字
   */
  private static parseExtraZqlKeyWords = (key: ZQL_CONSTANT, dict, nextStr) => {
    const _keyword = ZQL.zqlExtraKeyWordMap.get(key)
    const _value = dict[key]
    let _result = ''
    if (!!_value) {
      switch (key) {
        case ZQL_CONSTANT.returnWith:
          const returnWithStr = ZQL.parseReturnWith(_value)
          if (!!returnWithStr) {
            _result = [_keyword, returnWithStr].join('')
          }
          break

        case ZQL_CONSTANT.groupBy:
          if (Array.isArray(_value) && _value?.length) {
            _result = [_keyword, _value.join(',')].join('')
          }
          _result = [_keyword, _value].join('')
          break

        case ZQL_CONSTANT.restrictBy:
          const restrictByStr = ZQL.parseRestrictBy(_value)
          if (!!restrictByStr) {
            _result = [_keyword, restrictByStr].join('')
          }
          break

        case ZQL_CONSTANT.orderDirection:
          _result = ` ${_value} `
          break

        case ZQL_CONSTANT.namedAs:
          _result = [_keyword, ` '${_value}'`].join('')
          break

        default:
          _result = [_keyword, _value, nextStr].join('')
          break
      }
    }
    return _result
  }

  /**
   * 子查询的处理
   */
  private static _parseSubQuery = condition => {
    return `(${ZQL.stringify(condition, { removeSemicolon: true })})`
  }

  private static _parseGetApi = condition => {
    return `(${ZQL.stringify(condition, {
      removeSemicolon: true
    })})`.replace(/ and /g, ',')
  }

  /**
   * 普通 condition 的处理
   */
  private static _parseBaseQuery = (props: ParseCondition) => {
    const { key, value, name, baseOp = ZOp.eq, logicOp, ...restProps } = props

    return `${name || key}${ZQL.utils.getOpValue(baseOp)}${
      restProps.valueOrigin ? value : ZQL.utils.parseValue(value)
    }`
  }

  /**
   * 处理逻辑类运算符的 condition
   *  and 和 or
   */
  private static _parseLogicCondition = (props: ParseCondition) => {
    const { key, value, name, baseOp = ZOp.eq, logicOp, ...restProps } = props

    const res: string[] = []
    const keyMap = Object.keys(value)

    for (const itemKey of keyMap) {
      const itemValue = value[itemKey]
      res.push(
        ZQL.switchConditionKeyParser({
          key: itemKey,
          name,
          value: itemValue,
          baseOp,
          logicOp
        })
      )
    }

    return `${
      restProps.removeParentheses || res.length <= 1 ? '' : '('
    }${res.join(` ${ZQL.utils.getOpValue(logicOp)} `)}${
      restProps.removeParentheses || res.length <= 1 ? '' : ')'
    }`
  }

  /**
   * 根据 value 的类型，处理并切换不同的解析函数
   *  如果是普通对象，执行 _parseLogicCondition
   *  如果是正则对象、运算符，处理后执行 _parseBaseQuery
   */
  private static switchConditionValueParser = (props: ParseCondition) => {
    let { key, value, name, baseOp = ZOp.eq, logicOp, ...restProps } = props

    if (ZQL.utils.isOp(value) && ZOpMap.get(value).type !== 'basic') {
      baseOp = null
    } else if (typeof value === 'object') {
      if (
        value instanceof RegExp &&
        (baseOp === ZOp.like ||
          baseOp === ZOp.notLike ||
          baseOp === ZOp.exactLike ||
          ZOp.exactNotLike)
      ) {
        value = `${/^\/(.+?)\/[^/]*$/i.exec(`${value}`)?.[1]}`
      } else if (baseOp !== ZOp.is && baseOp !== ZOp.not) {
        return ZQL._parseLogicCondition({
          key,
          name,
          value,
          baseOp,
          logicOp
        })
      }
    }

    return ZQL._parseBaseQuery({
      key,
      name,
      value,
      baseOp,
      logicOp,
      ...restProps
    })
  }

  /**
   * 根据 key 的类型，处理并切换不同的解析函数
   *  如果是逻辑类运算符，处理后执行 _parseLogicCondition
   *  如果是普通类运算符，处理后执行 switchConditionValueParser
   */
  private static switchConditionKeyParser = (props: ParseCondition) => {
    let { key, value, name, baseOp = ZOp.eq, logicOp, ...restProps } = props
    let valueOrigin = false
    const isIn = ZQL.utils.getOpValue(key) === ZOpMap.get(ZOp.in).value
    const isNotIn = ZQL.utils.getOpValue(key) === ZOpMap.get(ZOp.notIn).value

    const isHas = ZQL.utils.getOpValue(key) === ZOpMap.get(ZOp.has).value
    const isNotHas = ZQL.utils.getOpValue(key) === ZOpMap.get(ZOp.notHas).value

    const isLike = ZQL.utils.getOpValue(key) === ZOpMap.get(ZOp.like).value
    const isNotLike = ZQL.utils.getOpValue(key) === ZOpMap.get(ZOp.notLike).value

    const isExactLike = ZQL.utils.getOpValue(key) === ZOpMap.get(ZOp.exactLike).value
    const isNotExactLike = ZQL.utils.getOpValue(key) === ZOpMap.get(ZOp.exactNotLike).value

    const isGetApi = ZQL.utils.getOpValue(key) === ZOpMap.get(ZOp.getapi).value

    if (ZQL.utils.isOp(key)) {
      if (ZQL.utils.isLogicOp(key)) {
        return ZQL._parseLogicCondition({
          key,
          name,
          value,
          baseOp,
          logicOp: key,
          removeParentheses: restProps.removeParentheses
        })
      } else if (isIn || isNotIn || isHas || isNotHas) {
        if (Array.isArray(value)) {
          value = `('${value.join("','")}')`
        }
        if (isIn) {
          baseOp = ZOp.in
        }
        if (isNotIn) {
          baseOp = ZOp.notIn
        }
        if (isHas) {
          baseOp = ZOp.has
        }
        if (isNotHas) {
          baseOp = ZOp.notHas
        }
        valueOrigin = true
      } else if (isLike || isNotLike) {
        value = `'%${value}%'`
        if (isLike) {
          baseOp = ZOp.like
        }
        if (isNotLike) {
          baseOp = ZOp.notLike
        }
        valueOrigin = true
      } else if (isExactLike || isNotExactLike) {
        if (isExactLike) {
          baseOp = ZOp.like
        }
        if (isNotExactLike) {
          baseOp = ZOp.notLike
        }
        valueOrigin = true
      } else if (ZQL.utils.getOpType(key) === 'zql') {
        value = ZQL._parseSubQuery(value)
        valueOrigin = true
      } else if (isGetApi) {
        value = ZQL._parseGetApi(value)
        valueOrigin = true
      } else {
        baseOp = key
      }
    } else {
      name = key
    }

    return ZQL.switchConditionValueParser({
      key,
      name,
      value,
      baseOp,
      logicOp,
      valueOrigin
    })
  }

  /**
   * 解析 condition 字段
   */
  private static ParseCondition = (condition: PlainObject) => {
    if (ZQL.utils.isEmpty(condition)) {
      return ''
    }
    return ZQL.switchConditionKeyParser({
      key: ZOp.and,
      value: condition,
      name: '',
      baseOp: ZOp.eq,
      logicOp: null,
      removeParentheses: true
    })
  }

  /**
   * 解析 restrictBy
   */
  private static parseRestrictBy = conditionLike => {
    if (!!conditionLike) {
      const strs = ZQL.ParseCondition(conditionLike)
      return ` (${strs.replace(/ and /g, ', ')})`
    }
    return ''
  }

  /**
   * 解析 returnWith
   */
  private static parseReturnWith = ({ total, zwatch = [] }) => {
    if (!total && zwatch.length <= 0) {
      throw new Error(`[return with]: please input total or zwatch, or both.`)
    }
    const resultList = []
    if (total) {
      if (zwatch.length) {
        resultList.push('total')
      } else {
        return ` (total)`
      }
    }
    zwatch.forEach(item => {
      const {
        namespace,
        resultName,
        metricName,
        startTime,
        endTime,
        offsetAheadOfCurrentTime,
        period,
        labels = [],
        functions = [],
        valueConditions = [],
        limit,
        start
      } = item
      let _tempList = []
      if (resultName) {
        _tempList.push(`resultName='${resultName}'`)
      }
      if (namespace) {
        _tempList.push(`namespace='${namespace}'`)
      }
      if (metricName) {
        _tempList.push(`metricName='${metricName}'`)
      }
      if (startTime) {
        _tempList.push(`startTime=${startTime}`)
      }
      if (endTime) {
        _tempList.push(`endTime=${endTime}`)
      }
      if (offsetAheadOfCurrentTime) {
        _tempList.push(`offsetAheadOfCurrentTime=${offsetAheadOfCurrentTime}`)
      }
      if (period) {
        _tempList.push(`period=${period}`)
      }
      if (labels.length) {
        _tempList = _tempList.concat(labels.map(label => `labels='${label}'`))
      }
      if (functions.length) {
        _tempList = _tempList.concat(functions.map(fn => `functions=${fn}`))
      }
      if (valueConditions.length > 0) {
        _tempList = _tempList.concat(
          valueConditions.map(valueCondition => `valueConditions='${valueCondition}'`)
        )
      }

      if (limit !== undefined || start !== undefined) {
        //pagination(limit=\"12\",start=\"12\")
        const obj = { limit, start }
        const pagination = Object.keys(obj)
          .filter(key => obj[key] !== undefined)
          .map(key => {
            return `${key}="${obj[key]}"`
          })
          .join(',')
        _tempList.push(`functions=pagination(${pagination})`)
      }
      resultList.push(`zwatch{${_tempList.join(',')}}`)
    })
    if (resultList.length) {
      return ` (${resultList.join(', ')})`
    }
    return ''
  }

  /**
   * 一些工具函数
   */
  private static utils = {
    checkKeysRequired: (keys: string[], zqlObject): void => {
      const { action = ZQLAction.QUERY } = zqlObject
      const missingArr = difference(ZQL.requiredMap[action], keys)
      if (missingArr.length) {
        throw new Error(`[${action}]:  these fields [${missingArr}] in zql are required`)
      }
    },
    /**
     * 字符串引号添加
     */
    parseValue: (str: any): string => {
      if (ZOpMap.has(str) && ZOpMap.get(str).type !== 'basic') {
        return ZQL.utils.getOpValue(str)
      }
      if (typeof str === 'string') {
        return `'${str}'`
      }
      return str
    },
    isOp: (op): boolean => {
      if (!op) {
        return false
      }
      return ZOpMap.has(op)
    },
    isLogicOp: (op): boolean => {
      return ZOpMap.get(op)?.type === 'logic'
    },
    getOpValue: (op): string => {
      if (!op) {
        return ''
      }
      if (ZOpMap.has(op)) {
        return ZOpMap.get(op)?.value || ''
      }
      return ''
    },
    getOpType: (op): string => {
      if (ZOpMap.has(op)) {
        return ZOpMap.get(op)?.type || ''
      }
      return ''
    },
    isEmpty: (obj: any): boolean => {
      return isEmpty(obj)
    }
  }
}

export default ZQLExport
