import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import dayjs from 'dayjs'
import {
  isEmpty as _isEmpty,
  reduce as _reduce,
  remove as _remove,
  cloneDeep as _cloneDeep,
  add as _add,
  subtract as _subtract,
  filter as _filter,
  compact as _compact,
  divide as _divide,
  multiply as _multiply,
  round as _round,
  floor as _floor,
  max as _max,
  last as _last,
  sumBy as _sumBy
} from 'lodash'
import { Op } from 'sequelize'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetTaskProgressAction } from '@/api/zstack/GetTaskProgressAction'
import { QueryAccessControlRuleAction } from '@/api/zstack/QueryAccessControlRuleAction'
import { QueryImageAction } from '@/api/zstack/QueryImageAction'
import ZQL, { ZOp, ZQLAction } from '@/common/zql/index'
import { ZsActionApi } from '@/model/zs-action-api.model'
import { ZsLongJob } from '@/model/zs-long-job.model'
import { ZsRolePrivilege } from '@/model/zs-role-privilege.model'
import { GlobalConfigQueryService } from '@/settings/global-config/global-config-query/global-config-query.service'

import { DataProtectionService } from '../data-protection/data-protection.service'
import { SecretResourcePoolModel } from '../secret-resource-pool/secret-resource-pool.model'
import {
  EnableCryptoComplianceProgressItem,
  EnableCryptoComplianceProgressItemState,
  EnableCryptoComplianceProgressItemType,
  GetDataProtectionRelatedSummaryInput,
  GlobalConfigAndRcPoolInput,
  GlobalConfigAndSecretResourcePool,
  QueryEnableCryptoComplianceProgressInput,
  QueryGlobalConfigAndSecretResourcePoolArgs
} from './platform-crypto-cmpl.model'

@Injectable()
export class PlatformCryptoCmplService {
  @Inject() private readonly zqlService: ZQLService
  @Inject() private readonly globalConfigQueryService: GlobalConfigQueryService
  @Inject() private readonly dataProtectionService: DataProtectionService
  @Inject() private readonly getTaskProgressAction: GetTaskProgressAction
  @Inject() private readonly queryImageAction: QueryImageAction
  @Inject()
  private readonly queryAccessControlRuleAction: QueryAccessControlRuleAction
  @InjectModel(ZsActionApi) private zsActionApi: typeof ZsActionApi
  @InjectModel(ZsRolePrivilege) private zsRolePrivilege: typeof ZsRolePrivilege
  @InjectModel(ZsLongJob) private zsLongJob: typeof ZsLongJob

  private readonly EnableCryptoCmplGlobalConfigValueCollection = [
    'true',
    SecretResourcePoolModel.InfoSec,
    SecretResourcePoolModel.AiSiNo,
    SecretResourcePoolModel.FlkSec,
    SecretResourcePoolModel.HaiTai
  ]

  async getGlobalConfigAndRcPool(queryArgs: GlobalConfigAndRcPoolInput) {
    const { stateGloCfg, resourceGloCfg } = queryArgs

    const { value } = await this.globalConfigQueryService.getGlobalConfig(
      stateGloCfg.category,
      stateGloCfg.name
    )

    /**
     * 证书登录 @value true
     * 数据保护 @value InfoSec, AiSiNo
     */
    if (this.EnableCryptoCmplGlobalConfigValueCollection.includes(value)) {
      return this.getResourceGloCfg(resourceGloCfg)
    }
    return { state: false }
  }

  async getResourceGloCfg(resourceGloCfg) {
    const { value: secretResourcePoolUuid } = await this.globalConfigQueryService.getGlobalConfig(
      resourceGloCfg.category,
      resourceGloCfg.name
    )

    const zql = ZQL.stringify({
      tableName: 'SecretResourcePool',
      condition: {
        uuid: secretResourcePoolUuid
      }
    })

    const { results } = await this.zqlService.call(zql)

    return {
      state: true,
      secretResourcePool: results[0].inventories[0]
    }
  }

  private async _globalConfigAndSecretResourcePool(
    queryArgs: QueryGlobalConfigAndSecretResourcePoolArgs
  ) {
    const globalConfigZql = ZQL.stringify({
      tableName: 'GlobalConfig',
      condition: {
        [ZOp.or]: queryArgs.globalConfigs.map(({ category, name }) => [
          { [ZOp.and]: [{ category, name }] }
        ])
      }
    })

    const { results: globalConfigResults } = await this.zqlService.call(globalConfigZql)
    const globalConfigInventories = globalConfigResults?.[0]?.inventories ?? []

    const globalConfigInventoriesMap = _reduce(
      globalConfigInventories,
      (obj, curr) => {
        const key = curr.category + curr.name
        if (!obj[key]) {
          obj[key] = curr
        }
        return obj
      },
      {}
    )

    const _globalConfigInventories = _cloneDeep(globalConfigInventories)
    /**
     * 这里写死，后续增加新的类型，需要调@value
     * 证书登录: @defaultValue false    @value true
     * 数据保护: @defaultValue default  @value infoSec、AiSiNo、HaiTai
     */
    const enabledCount = _remove(_globalConfigInventories, (it: any) =>
      this.EnableCryptoCmplGlobalConfigValueCollection.includes(it.value)
    ).length

    // 长度为2，证明证书登陆和数据保护都开启了
    if (enabledCount === 2 && !_isEmpty(_globalConfigInventories)) {
      const resourceUuids = _globalConfigInventories.map(it => it.value)

      const secretResourcePoolZql = ZQL.stringify({
        tableName: 'SecretResourcePool',
        condition: {
          uuid: {
            [ZOp.in]: resourceUuids
          }
        }
      })

      const { results: secretResourcePoolResults } =
        await this.zqlService.call(secretResourcePoolZql)
      const secretResourcePoolInventories = secretResourcePoolResults?.[0]?.inventories ?? []

      const secretResourcePoolInventoriesMap = _reduce(
        secretResourcePoolInventories,
        (obj, curr) => {
          if (!obj[curr.uuid]) {
            obj[curr.uuid] = curr
          }
          return obj
        },
        {}
      )

      globalConfigInventories.forEach((it: any) => {
        const secretResourcePool = secretResourcePoolInventoriesMap[it.value]

        if (secretResourcePool) {
          const key = it.category + it.name

          globalConfigInventoriesMap[key].secretResourcePool = secretResourcePool
        }
      })

      const list = Object.values(globalConfigInventoriesMap)

      return {
        list,
        total: list.length
      }
    }

    return {
      list: [],
      total: 0
    }
  }

  globalConfigAndSecretResourcePoolList(queryArgs: QueryGlobalConfigAndSecretResourcePoolArgs) {
    return this._globalConfigAndSecretResourcePool(queryArgs)
  }

  async isEnableCryptoCmpl(secretResourcePoolUuid: string) {
    const queryArgs = {
      globalConfigs: [
        {
          category: 'cryptoAuthentication',
          name: 'crypto.authLogin.enable'
        },
        {
          category: 'securityMachine',
          name: 'crypto.authLogin.resourcePoolUuid'
        },
        {
          category: 'encrypt',
          name: 'encrypt.driver'
        },
        {
          category: 'securityMachine',
          name: 'crypto.dataProtect.resourcePoolUuid'
        }
      ]
    }

    const { list } = await this.globalConfigAndSecretResourcePoolList(queryArgs)

    const secretResourcePoolUuids = (list as Array<GlobalConfigAndSecretResourcePool>)
      .filter(it => it.secretResourcePool)
      .map(it => it.secretResourcePool.uuid)

    return secretResourcePoolUuids.includes(secretResourcePoolUuid)
  }

  async queryEnableCryptoComplianceProgress({
    actionId,
    apiId: startDataProtectionApiId
  }: QueryEnableCryptoComplianceProgressInput) {
    try {
      // 获取前端加密逻辑进度
      const { protectOldActionApiSpeed, protectOlduiPrivilegeSeed } =
        this.dataProtectionService.get()

      const whereOpt = await this.dataProtectionService.buildDataProtectRangeWhereOpt({
        uiConfigName: 'cryptocompliance.dataprotection.operationLogDays'
      })

      const protectOldDataProgressList: EnableCryptoComplianceProgressItem[] = [
        {
          percent: 0,
          state: EnableCryptoComplianceProgressItemState.unProtect,
          type: EnableCryptoComplianceProgressItemType.zsActionAPi,
          time: dayjs().valueOf()
        },
        {
          percent: 0,
          state: EnableCryptoComplianceProgressItemState.unProtect,
          type: EnableCryptoComplianceProgressItemType.zsRolePrivilege,
          time: dayjs().valueOf()
        }
      ]
      // 获取前端加密逻辑进度 actionApi
      const actionApis = await this.zsActionApi.findAndCountAll({
        where: whereOpt.createDate ? { createDate: whereOpt.createDate } : {}
      })

      const signedActionApiToProtectCount = _compact(
        actionApis.rows.filter(row => row.signedText)
      ).length

      const protectActionApisNeedMilliseconds = _round(
        _multiply(
          _subtract(actionApis.count, signedActionApiToProtectCount),
          protectOldActionApiSpeed
        )
      )

      // 获取前端加密逻辑进度 zsRolePrivilege
      const rolePrivileges = await this.zsRolePrivilege.findAndCountAll()

      const signedRolePrivilegeToProtectCount = _compact(
        rolePrivileges.rows.filter(row => row.signedText)
      ).length

      const protectRolePrivilegesNeedMilliseconds = _round(
        _multiply(
          _subtract(rolePrivileges.count, signedRolePrivilegeToProtectCount),
          protectOlduiPrivilegeSeed
        )
      )

      const protectOldDataNeedMilliseconds = _max([
        protectActionApisNeedMilliseconds,
        protectRolePrivilegesNeedMilliseconds
      ])

      const getPercent = (count: number, total: number): number => {
        if (total === 0) {
          return 100
        }
        return _floor(_multiply(_divide(count, total), 100), 2)
      }

      // 获取前端加密逻辑进度
      const _protectOldDataProgressList: EnableCryptoComplianceProgressItem[] =
        protectOldDataProgressList.map(it => {
          if (it.type === EnableCryptoComplianceProgressItemType.zsActionAPi) {
            return {
              ...it,
              percent: getPercent(signedActionApiToProtectCount, actionApis.count),
              state:
                signedActionApiToProtectCount === actionApis.count
                  ? EnableCryptoComplianceProgressItemState.protected
                  : EnableCryptoComplianceProgressItemState.protecting
            }
          }

          if (it.type === EnableCryptoComplianceProgressItemType.zsRolePrivilege) {
            return {
              ...it,
              percent: getPercent(signedRolePrivilegeToProtectCount, rolePrivileges.count),
              state:
                signedRolePrivilegeToProtectCount === rolePrivileges.count
                  ? EnableCryptoComplianceProgressItemState.protected
                  : EnableCryptoComplianceProgressItemState.protecting
            }
          }

          return it
        })

      // 获取后端加密逻辑进度
      const uiLongJob = await this.zsLongJob.findOne({
        where: {
          clientJobUuid: actionId
        }
      })

      const isRunning = ['RUNNING'].includes(uiLongJob.state)
      const isFailed = ['FAILED', 'SUSPENDED'].includes(uiLongJob.state)
      const isSucceed = ['SUCCESS'].includes(uiLongJob.state)

      const { inventories } = await this.getTaskProgressAction.call({
        apiId: startDataProtectionApiId,
        all: true
      })

      const dataProtectionTaskProgressList = _filter(
        _compact(inventories),
        it => it.type === 'Progress'
      )
        .map(it => ({ ...it, content: Number(it.content) }))
        .sort((a, b) => a.content - b.contentd)

      let protectAuditsNeedMilliseconds = 0

      const _dataProtectionTaskProgressList: EnableCryptoComplianceProgressItem[] =
        dataProtectionTaskProgressList.map(({ arguments: _arguments, content, time }) => {
          try {
            const { content: latestTaskProgressContent } = _last(dataProtectionTaskProgressList)

            let state = EnableCryptoComplianceProgressItemState.unProtect
            if (isRunning && content === latestTaskProgressContent) {
              state = EnableCryptoComplianceProgressItemState.protecting
            } else if (
              (isRunning && content < latestTaskProgressContent) ||
              isSucceed ||
              (isFailed && content < latestTaskProgressContent)
            ) {
              state = EnableCryptoComplianceProgressItemState.protected
            } else {
              state = EnableCryptoComplianceProgressItemState.protectFailed
            }

            // 单独处理 审计日志
            if (content === 30) {
              let totalCount = 0
              let signedCount = 0
              let encryptAuditsSpeed = 20

              const currentArguments: any = JSON.parse(_arguments)

              totalCount = currentArguments?.totalCount
              signedCount = currentArguments?.signedCount
              encryptAuditsSpeed =
                Number(currentArguments?.encryptSpeedInMillis) ?? encryptAuditsSpeed

              // 计算加密审计日志的时间
              protectAuditsNeedMilliseconds = _add(
                _round(_multiply(_subtract(totalCount, signedCount), encryptAuditsSpeed)),
                5000 // 增加5s，是为了估算后端加密非审计日志的时间
              )

              return {
                percent: content,
                state,
                totalCount,
                signedCount,
                type: EnableCryptoComplianceProgressItemType.APIStartDataProtectionMsg,
                time: Number(time)
              }
            }

            return {
              percent: content,
              state: content === 100 ? EnableCryptoComplianceProgressItemState.protected : state,
              type: EnableCryptoComplianceProgressItemType.APIStartDataProtectionMsg,
              time: Number(time)
            }
          } catch (e) {}
        })

      const _progressList = _protectOldDataProgressList.concat(_dataProtectionTaskProgressList)
      return {
        progressList: _progressList,
        encryptMilliseconds: _max([protectOldDataNeedMilliseconds, protectAuditsNeedMilliseconds])
      }
    } catch (e) {
      return {
        progressList: [],
        encryptMilliseconds: 0
      }
    }
  }

  async getDataProtectionRelatedSummary({
    operationLogDays,
    auditsDays
  }: GetDataProtectionRelatedSummaryInput) {
    let zql = null
    let resp = null
    let [
      operationLogCount, // 操作日志
      auditsCount, // 审计日志
      importConfigCount, // 重要配置文件
      accessControlRuleCount, // 平台登录策略
      rolePolicyStatementCount, // 平台API权限
      rolePrivilegesCount, // 平台界面权限
      imageCount, // 平台镜像
      snapshotCount, // 平台快照
      passwordCount, // 平台口令
      sensitiveDataCount // 平台敏感数据
    ] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    // 操作日志
    try {
      const between = Op.between
      const whereOpt =
        operationLogDays === 0
          ? {}
          : {
              createDate: {
                [between]: [
                  dayjs().subtract(operationLogDays, 'days').toDate(),
                  dayjs().subtract(0, 'days').toDate()
                ] as any[]
              }
            }

      const actionApis = await this.zsActionApi.findAndCountAll({
        where: {
          ...whereOpt
        }
      })
      operationLogCount = actionApis.count ?? 0
    } catch (e) {}

    // 审计日志
    try {
      const auditsCondition =
        auditsDays === 0
          ? {}
          : {
              createTime: {
                [ZOp.gte]: dayjs().subtract(auditsDays, 'days').toDate().valueOf()
              }
            }

      zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'Audits',
        condition: auditsCondition
      })
      resp = await this.zqlService.call(zql)
      auditsCount = resp?.results?.[0]?.total ?? 0
    } catch (e) {}

    // 重要配置文件
    importConfigCount = 1

    // 平台登录策略
    try {
      resp = await this.queryAccessControlRuleAction.call({
        count: true
      })
      accessControlRuleCount = _add(resp?.total ?? 0, 12)
    } catch (e) {}

    // 平台API权限
    try {
      zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'RolePolicyStatement'
      })
      resp = await this.zqlService.call(zql)
      rolePolicyStatementCount = resp?.results?.[0]?.total ?? 0
    } catch (e) {
      console.log('e is', e)
    }

    // 平台界面权限
    try {
      const rolePrivileges = await this.zsRolePrivilege.findAndCountAll()

      rolePrivilegesCount = rolePrivileges.count
    } catch (e) {}

    // 平台镜像
    try {
      resp = await this.queryImageAction.call({
        count: true
      })
      imageCount = resp?.total ?? 0
    } catch (e) {}

    // 平台快照
    try {
      zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'VolumeSnapshot'
      })
      resp = await this.zqlService.call(zql)
      snapshotCount = resp?.results?.[0]?.total ?? 0
    } catch (e) {}

    // 平台口令
    try {
      zql = ZQL.multStringify([
        {
          action: ZQLAction.COUNT,
          tableName: 'CephBackupStorageMon'
        },
        {
          action: ZQLAction.COUNT,
          tableName: 'CephPrimaryStorageMon'
        },
        {
          action: ZQLAction.COUNT,
          tableName: 'KVMHost'
        },
        {
          action: ZQLAction.COUNT,
          tableName: 'SftpBackupStorage'
        },
        {
          action: ZQLAction.COUNT,
          tableName: 'AppBuildSystem'
        },
        {
          action: ZQLAction.COUNT,
          tableName: 'VCenter'
        },
        {
          action: ZQLAction.COUNT,
          tableName: 'IscsiServer'
        }
      ])

      resp = await this.zqlService.call(zql)
      passwordCount = _sumBy(_compact(resp?.results), 'total')
    } catch (e) {}

    return {
      operationLogCount,
      auditsCount,
      importConfigCount,
      accessControlRuleCount,
      rolePolicyStatementCount,
      rolePrivilegesCount,
      imageCount,
      snapshotCount,
      passwordCount,
      sensitiveDataCount
    }
  }
}
