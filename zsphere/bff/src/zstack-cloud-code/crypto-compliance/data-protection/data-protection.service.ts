import { Inject, Injectable } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import DataLoader from 'dataloader'
import dayjs from 'dayjs'
import {
  subtract as _subtract,
  divide as _divide,
  floor as _floor,
  isNumber as _isNumber
} from 'lodash'
import { Op } from 'sequelize'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { CheckBatchDataIntegrityAction } from '@/api/zstack/CheckBatchDataIntegrityAction'
import { SecurityMachineEncryptAction } from '@/api/zstack/SecurityMachineEncryptAction'
import ZQL from '@/common/zql/index'
import { ZsActionApi } from '@/model/zs-action-api.model'
import { ZsRolePrivilege } from '@/model/zs-role-privilege.model'
import { ZsSession } from '@/model/zs-session.model'
import { ZsUIConfig } from '@/model/zs-ui-config.model'
import { genUuid } from '@/utils'

let enabled = false
let runningTask = false
let inited = false
let protectOldActionApiSpeed = 100
let protectOlduiPrivilegeSeed = 100

@Injectable()
export class DataProtectionService {
  @Inject(CONTEXT) private readonly context
  @InjectModel(ZsSession) private zsSession: typeof ZsSession
  @InjectModel(ZsActionApi) private zsActionApi: typeof ZsActionApi
  @InjectModel(ZsRolePrivilege) private zsRolePrivilege: typeof ZsRolePrivilege
  @InjectModel(ZsUIConfig) private zsUIConfig: typeof ZsUIConfig
  @Inject(ZQLService) private zqlService: typeof ZQLService
  @Inject() checkBatchDataIntegrityAction: CheckBatchDataIntegrityAction
  @Inject() securityMachineEncryptAction: SecurityMachineEncryptAction

  private checkDataIntegrityDataLoader

  constructor() {
    this.checkDataIntegrityDataLoader = new DataLoader(this._checkDataIntegrity)
  }

  get(): {
    enabled: boolean
    protectOldActionApiSpeed: number
    protectOlduiPrivilegeSeed: number
  } {
    console.log(`data protection: [${enabled}]`)
    return {
      enabled,
      protectOldActionApiSpeed,
      protectOlduiPrivilegeSeed
    }
  }

  set(value: boolean) {
    console.log(`set data protection: [${value}]`)
    enabled = value
    inited = true
  }

  async getSession() {
    const sessionId = this.context?.req?.headers?.['x-session-id'] ?? ''
    let condition
    if (sessionId) {
      condition = { sessionId }
    } else {
      condition = {
        identity: 'Admin'
      }
    }
    const session = await this.zsSession.findOne({
      where: condition
    })
    return session
  }

  async buildDataProtectRangeWhereOpt({ uiConfigName }: { uiConfigName: string }) {
    try {
      const result = await this.zsUIConfig.findOne({
        where: {
          name: uiConfigName
        }
      })

      const [startDays, endDays] = result.value.split(',')

      let _startDays = Number(startDays)
      const _endDays = Number(endDays)
      const between = Op.between

      if (!_isNumber(_startDays)) {
        _startDays = 0
      }

      if (_startDays === 0 || _startDays < _endDays) {
        return {}
      }
      return {
        createDate: {
          [between]: [
            dayjs().subtract(_startDays, 'days').toDate(),
            dayjs().subtract(_endDays, 'days').toDate()
          ] as any[]
        },
        startDays: _startDays,
        endDays: _endDays
      }
    } catch (error) {
      console.log('query ZsUIConfig failed: ', error)
      return {}
    }
  }

  calculateProtectOldDataSpeed(startProtectOldDataMilliseconds: number, count: number) {
    const currentMilliseconds = dayjs().valueOf()

    return _floor(
      _divide(_subtract(currentMilliseconds, startProtectOldDataMilliseconds), count),
      2
    )
  }

  async checkDataProtectionStatus(sessionId?: string): Promise<boolean> {
    if (!sessionId) {
      const session = await this.getSession()
      if (!session) {
        console.log('no valid session in check protect status')
        return false
      }
      sessionId = session.get('sessionId')
    }

    const mainJobId = this.context?.req?.headers?.['x-job-id'] ?? genUuid()

    const zql = {
      tableName: 'globalconfig',
      fields: ['value'],
      condition: {
        category: 'encrypt',
        name: 'encrypt.driver'
      }
    }

    try {
      const resp = await this.zqlService.call(ZQL.stringify(zql), null, mainJobId, sessionId)
      const value = resp?.results?.[0]?.inventories?.[0].value
      enabled = value && value !== 'default'
    } catch (e) {
      console.error(`[Error] check encrypt driver error: ${e}`)
    }
    return enabled
  }

  async protectDataAction(text: string, sessionId?: string) {
    if (!enabled) {
      return undefined
    }
    if (!sessionId) {
      const session = await this.getSession()
      if (!session) {
        console.log('no valid session in check protect status')
        return undefined
      }
      sessionId = session.get('sessionId')
    }
    try {
      const resp = await this.securityMachineEncryptAction.call(
        {
          text,
          algType: 'HMAC'
        },
        { sessionId }
      )
      console.log(`[DATA] [Text: ${text}] [project data: ${resp?.text}]`)
      return resp?.text
    } catch (e) {
      const error = JSON.parse(JSON.stringify(e.error))
      if (error.code === 'SM.3006') {
        // 手动（后端脚本）关闭密评合规，重置状态
        enabled = false
        runningTask = false
        inited = false
        protectOldActionApiSpeed = 100
        protectOlduiPrivilegeSeed = 100

        await this.updateZsUIConfig({ operationLogDays: 0 })
        return undefined
      }
      throw e
    }
  }

  async protectOldActionApiTask(sessionId?: string) {
    if (!enabled) {
      return undefined
    }

    const whereOpt = await this.buildDataProtectRangeWhereOpt({
      uiConfigName: 'cryptocompliance.dataprotection.operationLogDays'
    })

    const apis = await this.zsActionApi.findAndCountAll({
      where: {
        signedText: null,
        ...(whereOpt.createDate ? { createDate: whereOpt.createDate } : {})
      },
      limit: 50,
      order: [['createDate', 'desc']]
    })

    if (apis.count === 0) {
      runningTask = true
    }

    if (!sessionId) {
      const session = await this.getSession()
      if (!session) {
        console.log('no valid session in protect old action data')
        return undefined
      }
      sessionId = session.get('sessionId')
    }

    const startProtectRowDataMilliseconds = dayjs().valueOf()
    let protectedRowDataCount = 0

    for (let i = 0; i < apis.rows.length; i++) {
      const row = apis.rows?.[i]
      try {
        const resp = row.resp as any
        if (
          (row.name !== 'SubmitLongJobAction' &&
            ['Success', 'Failed', 'Canceled', 'Unknown'].indexOf(row.status) > -1) ||
          (row.name === 'SubmitLongJobAction' &&
            ['Succeeded', 'Failed', 'Canceled'].indexOf(resp?.state) > -1)
        ) {
          protectedRowDataCount++
          const signedText = await this.protectDataAction(
            JSON.stringify(row.req) + JSON.stringify(row.resp),
            sessionId
          )
          await row.update({
            signedText,
            lastOpDate: new Date()
          })
        }
      } catch (e) {
        console.error(`[ERROR] Protect old action api Task faild: ${e}`)
        return undefined
      }
    }

    if (protectedRowDataCount !== 0) {
      protectOldActionApiSpeed = this.calculateProtectOldDataSpeed(
        startProtectRowDataMilliseconds,
        protectedRowDataCount
      )
      protectedRowDataCount = 0
    }

    this.protectOldActionApiTask(sessionId)
  }

  async protectOlduiPrivilegeTask(sessionId?: string) {
    if (!enabled) {
      return undefined
    }

    const uiPrivileges = await this.zsRolePrivilege.findAndCountAll({
      where: {
        signedText: null
      },
      limit: 50,
      order: [['createDate', 'desc']]
    })

    if (uiPrivileges.count === 0) {
      runningTask = true
    }

    if (!sessionId) {
      const session = await this.getSession()
      if (!session) {
        console.log('no valid session in protect old action data')
        return undefined
      }
      sessionId = session.get('sessionId')
    }

    const startProtectRowDataMilliseconds = dayjs().valueOf()

    for (let i = 0; i < uiPrivileges.rows.length; i++) {
      const row = uiPrivileges.rows?.[i]
      try {
        const privilege = row.privilege as any
        const signedText = await this.protectDataAction(JSON.stringify(privilege), sessionId)
        await row.update({
          signedText,
          lastOpDate: new Date()
        })
      } catch (e) {
        console.error(`[ERROR] Protect old uiPrivilege Task faild: ${e}`)
        return undefined
      }
    }

    if (uiPrivileges.rows.length !== 0) {
      protectOlduiPrivilegeSeed = this.calculateProtectOldDataSpeed(
        startProtectRowDataMilliseconds,
        uiPrivileges.rows.length
      )
    }
    this.protectOlduiPrivilegeTask(sessionId)
  }

  async protectOldActionApi(sessionId?: string) {
    if (runningTask) {
      return undefined
    }
    if (!inited) {
      await this.checkDataProtectionStatus(sessionId)
    }
    if (enabled) {
      runningTask = true
      Promise.all([
        this.protectOldActionApiTask(sessionId),
        this.protectOlduiPrivilegeTask(sessionId)
      ])
    }
  }

  async updateZsUIConfig({ operationLogDays }: { operationLogDays: number }) {
    try {
      await this.zsUIConfig.update(
        { value: [operationLogDays, 0].join(',') },
        { where: { name: 'cryptocompliance.dataprotection.operationLogDays' } }
      )
    } catch (error) {
      console.log('update ZsUIConfig failed: ', error)
    }
  }

  async startDataProtect({
    operationLogDays,
    sessionId
  }: {
    operationLogDays: number
    sessionId?: string
  }) {
    this.set(true)
    await this.updateZsUIConfig({ operationLogDays })
    this.protectOldActionApi(sessionId)
  }

  async stopDataProtect() {
    this.set(false)
  }

  checkDataIntegrity(resourceUuid, resourceType) {
    if (!enabled) {
      return true
    }
    return this.checkDataIntegrityDataLoader.load({
      resourceUuid,
      resourceType
    })
  }

  _checkDataIntegrity = async params => {
    const resourceUuids = params?.map(it => it.resourceUuid)
    const resourceType = params?.[0]?.resourceType
    const resp = await this.checkBatchDataIntegrityAction.call({
      resourceUuids,
      resourceType
    })
    return params?.map(it => {
      return resp.resourceMap?.[it.resourceUuid] ?? false
    })
  }
}
