import { Injectable, Inject } from '@nestjs/common'

import { Condition as ICondition, Op } from '@/api/zstack/base/query-base'
import {
  GetAlarmDataAction,
  GetAlarmDataActionParam as IGetAlarmDataActionParam
} from '@/api/zstack/GetAlarmDataAction'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import {
  GetAssignResourceAlarmDataInput as IGetAssignResourceAlarmDataInput,
  AssignResourceAlarmData as IAssignResourceAlarmData
} from '@/maintenance/alarm-data/alarm-data.model'

@Injectable()
export class AlarmDataService {
  @Inject() apiGetAlarmDataAction: GetAlarmDataAction

  async get(param: IQueryAction) {
    const queryParam: IGetAlarmDataActionParam = {
      conditions: this.translateQueryCondition(param.conditions)
    }
    const resp = await this.apiGetAlarmDataAction.call(queryParam)
    return resp.histories
  }

  async getAssignResourceAlarmDataInput(input: IGetAssignResourceAlarmDataInput) {
    const baseCondition = input.conditions
    const typeList = ['Important', 'Normal', 'Emergent']
    const result = {}
    await Promise.all(
      typeList.map(type => {
        const queryParam: IGetAlarmDataActionParam = {
          conditions: this.translateQueryCondition(
            baseCondition.concat([{ value: type, key: 'emergencyLevel', op: Op.eq }])
          ),
          startTime: input.startTime,
          endTime: input.endTime,
          count: true
        }
        return this.apiGetAlarmDataAction.call(queryParam).then(
          resp => {
            result[type] = resp.total
          },
          () => {
            result[type] = 0
          }
        )
      })
    )
    return result
  }

  translateQueryCondition(conditions: ICondition[]) {
    const q = []
    for (const _ of conditions) {
      if (typeof _ === 'object') {
        const { value, key, op = Op.eq, values = [] } = _
        let _value = ''
        const isValidate = key && value
        if (isValidate) {
          _value = encodeURIComponent(value)
        }
        let _values = ''
        const isOk = key && values.length
        if (isOk) {
          _values = values.map(it => encodeURIComponent(it)).join(',')
        }
        const opActionCallback = {
          [Op.gt]: () => isValidate && q.push(`${key}>${_value}`),
          [Op.lt]: () => isValidate && q.push(`${key}<${_value}`),
          [Op.gte]: () => isValidate && q.push(`${key}>=${_value}`),
          [Op.lte]: () => isValidate && q.push(`${key}<=${_value}`),
          [Op.eq]: () => isValidate && q.push(`${key}=${_value}`),
          [Op.ne]: () => isValidate && q.push(`${key}!=${_value}`),
          [Op.like]: () => isValidate && q.push(`${key}~=%25${_value}%25`),
          [Op.notLike]: () => isValidate && q.push(`${key}!~=%25${_value}%25`),
          [Op.in]: () => isOk && q.push(`${key}?=${_values}`),
          [Op.notIn]: () => isOk && q.push(`${key}!?=${_values}`),
          [Op.is]: () => key && q.push(`${key}=null`),
          [Op.not]: () => key && q.push(`${key}!=null`)
        }
        opActionCallback[op]()
      }
    }
    return q
  }
}
