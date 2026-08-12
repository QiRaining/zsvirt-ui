import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { Injectable, Inject } from '@nestjs/common'
import Dataloader from 'dataloader'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetKmsServerCertFromKmsAction } from '@/api/zstack/GetKmsServerCertFromKmsAction'
import { ParseNkpRestoreAction } from '@/api/zstack/ParseNkpRestoreAction'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { parseCert } from '@/zsphere-administration/cert-manage/utils/openssl'

import { ParseNkpRestoreQuery, TrustState } from './kms-provider.model'

@Injectable()
export class KmsProviderQueryService {
  @Inject() zqlService!: ZQLService
  @Inject() parseNkpRestoreAction!: ParseNkpRestoreAction
  @Inject() getKmsServerCertFromKmsAction!: GetKmsServerCertFromKmsAction

  private defaultUuidLoader: Dataloader<string, string>

  constructor() {
    this.defaultUuidLoader = new Dataloader(this._queryDefaultUuid)
  }

  async queryList(param: IQueryAction) {
    const zqlCondition = QueryConditionTranslator.translate(param.conditions)

    const zqlObject = {
      tableName: 'KeyProvider',
      condition: zqlCondition,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      returnWith: { total: true }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const list = (results?.[0]?.inventories ?? []).map((item: any) => ({
      ...item,
      serverCertExpiredDate: item.serverCertInfo?.expiredDate
    }))
    const total = results?.[0]?.total ?? 0
    return { list, total }
  }

  async countKmsProviders() {
    const zql = ZQL.stringify({
      tableName: 'KeyProvider',
      action: ZQLAction.COUNT
    })
    const { results } = await this.zqlService.call(zql)
    return results?.[0]?.total ?? 0
  }

  async queryAvailableKeyProviders() {
    const { list } = await this.queryList({
      limit: 1000,
      start: 0,
      conditions: []
    })

    // 获取默认 provider UUID
    const defaultUuid = await this.queryDefaultUuid('')
    if (!defaultUuid) {
      return []
    }

    return list.filter((p: any) => {
      if (p.uuid !== defaultUuid) {
        return false
      }
      if (p.type === 'NKP') {
        return p.backedUp === true
      }
      if (p.type === 'KMS') {
        return p.connected === true && p.trustState === TrustState.MUTUAL_TRUSTED
      }
      return false
    })
  }

  async queryDefaultUuid(uuid: string) {
    return await this.defaultUuidLoader.load(uuid)
  }

  _queryDefaultUuid = async (uuids: readonly string[]) => {
    const zql = ZQL.stringify({
      tableName: 'GlobalConfig',
      condition: {
        name: 'default.keyProviderUuid',
        category: 'keyProvider'
      }
    })
    const { results } = await this.zqlService.call(zql)
    const defaultUuid = results?.[0]?.inventories?.[0]?.value as string
    return uuids.map(() => defaultUuid)
  }

  async countEncryptedResourceKeyRef(uuids: string[]) {
    const { results } = await this.zqlService.call(
      ZQL.stringify({
        tableName: 'VmInstance',
        action: ZQLAction.COUNT,
        condition: {
          type: 'UserVM',
          state: {
            [ZOp.ne]: 'Destroyed'
          },
          [ZOp.and]: [
            {
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.and]: {
                    [ZOp.query]: {
                      tableName: 'templatedVminstance',
                      fields: ['uuid']
                    }
                  }
                }
              }
            },
            {
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.and]: {
                    [ZOp.query]: {
                      tableName: 'templatedVminstanceCache',
                      fields: ['cacheVmInstanceUuid']
                    }
                  }
                }
              }
            },
            {
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'Tpm',
                    fields: ['vmInstanceUuid'],
                    condition: {
                      uuid: {
                        [ZOp.in]: {
                          [ZOp.query]: {
                            tableName: 'EncryptedResourceKeyRef',
                            fields: ['resourceUuid'],
                            condition: {
                              resourceType: 'TpmVO',
                              providerUuid: {
                                [ZOp.in]: uuids
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
        }
      })
    )
    return results?.[0]?.total ?? 0
  }

  async parseNkpRestore(params: ParseNkpRestoreQuery) {
    return this.parseNkpRestoreAction.call(params)
  }

  async getKmsServerCertFromKms(uuid: string) {
    const resp = await this.getKmsServerCertFromKmsAction.call({ uuid })
    if (!resp?.serverCertPem) {
      return resp
    }
    const tempCertPath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'zstack-ui-server-')),
      'cert.pem'
    )
    fs.writeFileSync(tempCertPath, resp.serverCertPem)
    const kmsCertInfo = await parseCert(tempCertPath)
    fs.rmSync(path.dirname(tempCertPath), { recursive: true, force: true })
    return { ...resp, kmsCertInfo }
  }

  async queryKmsIdentityList(param: IQueryAction) {
    const zqlCondition = QueryConditionTranslator.translate(param.conditions)

    const zqlObject = {
      tableName: 'KmsIdentity',
      condition: zqlCondition,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      returnWith: { total: true }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const list = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0
    return { list, total }
  }
}
