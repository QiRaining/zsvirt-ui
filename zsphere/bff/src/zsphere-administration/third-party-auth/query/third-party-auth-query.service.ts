import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { get as _get, reduce as _reduce } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryLdapServerAction } from '@/api/zstack/QueryLdapServerAction'
import { QueryResourceConfigAction } from '@/api/zstack/QueryResourceConfigAction'
import ZQL, { ZOp, ZQLAction, QueryConditionTranslator } from '@/common/zql/index'

@Injectable()
export class ThirdPartyAuthQueryService {
  @Inject()
  zqlService: ZQLService
  @Inject()
  queryLdapServerAction: QueryLdapServerAction
  @Inject()
  queryResourceConfigAction: QueryResourceConfigAction

  private bindResourcerefDataLoader
  private systemTagDataLoader
  private resourceConfigDataLoader

  constructor() {
    this.bindResourcerefDataLoader = new DataLoader(this._getBindResourceref)
    this.systemTagDataLoader = new DataLoader(this._getSystemTagInfo)
    this.resourceConfigDataLoader = new DataLoader(this._getResourceConfig)
  }

  async query(param) {
    const _extrazqlConditions = {}

    const zqlCondition = QueryConditionTranslator.translate(param.conditions, _extrazqlConditions)
    const zqlObject = {
      tableName: 'LdapServer',
      condition: zqlCondition,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const data = results?.[0] ?? {}
    const { inventories: list = [], total = 0 } = data
    return { list, total }
  }

  getBindResourceref(uuid) {
    return this.bindResourcerefDataLoader.load(uuid)
  }

  _getBindResourceref = async (uuids = []) => {
    const zql = ZQL.stringify({
      tableName: 'AccountThirdPartyAccountSourceRef',
      condition: {
        accountSourceUuid: {
          [ZOp.in]: uuids
        }
      }
    })

    const { results } = await this.zqlService.call(zql)
    const inventories = results[0]?.inventories ?? []

    const resourceMap = _reduce(
      inventories,
      (obj, it) => {
        if (!obj[it.accountSourceUuid]) {
          obj[it.accountSourceUuid] = [it]
        } else {
          obj[it.accountSourceUuid].push(it)
        }
        return obj
      },
      {}
    )

    return uuids.map(uuid => ({
      userCount: resourceMap[uuid]?.length ?? 0
    }))
  }

  getResourceConfig(uuid) {
    return this.resourceConfigDataLoader.load(uuid)
  }

  _getResourceConfig = async (uuids = []) => {
    const nameList = ['ldap.auto.sync.interval', 'enable.ldap.auto.sync']
    const zql = ZQL.stringify({
      tableName: 'resourceConfig',
      condition: {
        resourceUuid: {
          [ZOp.in]: uuids
        },
        category: 'iam2Ldap',
        name: {
          [ZOp.in]: nameList
        }
      }
    })
    const resp = await this.zqlService.call(zql)
    const list = _get(resp, ['results', 0, 'inventories'], [])
    return uuids.map(uuid => {
      const _list = list.filter(tag => tag.resourceUuid === uuid)

      const findSyncInterval = _list.find(it => it.name === nameList[0])
      const syncInterval = findSyncInterval?.value

      const findAutoSync = _list.find(it => it.name === nameList[1])
      const autoSync = findAutoSync?.value

      return {
        autoSync,
        syncInterval
      }
    })
  }

  getSystemTagInfo(uuid) {
    return this.systemTagDataLoader.load(uuid)
  }

  _getSystemTagInfo = async (uuids = []) => {
    const zql = ZQL.stringify({
      tableName: 'SystemTag',
      condition: {
        resourceType: 'LdapServerVO',
        resourceUuid: {
          [ZOp.in]: uuids
        },
        [ZOp.or]: [
          {
            tag: {
              [ZOp.like]: 'ldapCleanBindingFilter'
            }
          },
          {
            tag: {
              [ZOp.like]: 'ldapAllowListFilter'
            }
          },
          {
            tag: {
              [ZOp.like]: 'ldapServerType'
            }
          },
          {
            tag: {
              [ZOp.like]: 'ldapUrls'
            }
          },
          {
            tag: {
              [ZOp.like]: 'organizationSyncConfiguration'
            }
          },
          {
            tag: {
              [ZOp.like]: 'ldapUseAsLoginName'
            }
          },
          {
            tag: {
              [ZOp.like]: 'virtualIDSyncConfiguration'
            }
          }
        ]
      }
    })
    const resp = await this.zqlService.call(zql)
    const tagList = _get(resp, ['results', 0, 'inventories'], [])
    return uuids.map(uuid => {
      const _tagList = tagList.filter(tag => tag.resourceUuid === uuid) || []

      let ldapCleanBindingFilter = ''
      let ldapCleanBindingFilterUuid = ''
      const findLdapCleanBindingFilter = _tagList.find(
        it => it?.tag?.indexOf('ldapCleanBindingFilter') > -1
      )
      if (findLdapCleanBindingFilter) {
        ldapCleanBindingFilter = _get(findLdapCleanBindingFilter?.tag?.split('::'), 1, '')
        ldapCleanBindingFilterUuid = findLdapCleanBindingFilter?.uuid
      }

      let ldapAllowListFilter = ''
      let ldapAllowListFilterUuid = ''
      const findLdapAllowListFilter = _tagList.find(
        it => it?.tag?.indexOf('ldapAllowListFilter') > -1
      )
      if (findLdapAllowListFilter) {
        ldapAllowListFilter = _get(findLdapAllowListFilter?.tag?.split('::'), 1, '')
        ldapAllowListFilterUuid = findLdapAllowListFilter?.uuid
      }

      let ldapServerType = ''
      let ldapServerTypeUuid = ''
      const findLdapServerType = _tagList.find(it => it?.tag?.indexOf('ldapServerType') > -1)
      if (findLdapServerType) {
        ldapServerType = findLdapServerType?.tag
        ldapServerTypeUuid = findLdapServerType?.uuid
      }

      let ldapUseAsLoginName = ''
      let ldapUseAsLoginNameUuid = ''
      const findLdapUseAsLoginName = _tagList.find(
        it => it?.tag?.indexOf('ldapUseAsLoginName') > -1
      )
      if (findLdapUseAsLoginName) {
        ldapUseAsLoginName = _get(findLdapUseAsLoginName?.tag?.split('::'), 1, '')
        ldapUseAsLoginNameUuid = findLdapUseAsLoginName?.uuid
      }

      let standbyServerIP = ''
      let standbyServerPort = ''
      let ldapUrlsUuid = ''
      const findLdapUrls = _tagList.find(it => it?.tag?.indexOf('ldapUrls') > -1)
      if (findLdapUrls) {
        const tandbyServerInfo = _get(findLdapUrls?.tag?.split('://'), 1, '')
        standbyServerIP = _get(tandbyServerInfo?.split(':'), 0, '-')
        standbyServerPort = _get(tandbyServerInfo?.split(':'), 1, '-')
        ldapUrlsUuid = findLdapUrls?.uuid
      }

      const virtualIDSyncConfiguration = {}
      const userDefinedSyncConifgProps = []
      let virtualIDSyncConfigurationUuid = ''
      const findVirtualIDSyncConfig = _tagList.find(
        it => it?.tag?.indexOf('virtualIDSyncConfiguration') > -1
      )
      if (findVirtualIDSyncConfig) {
        const jsonObj = _get(findVirtualIDSyncConfig?.tag?.split('::'), 1, '')
        const list = JSON.parse(jsonObj)?.rules ?? []
        if (list?.length) {
          const mapping = list.reduce((R, el) => {
            R[el.name] = el.attribute
            return R
          }, {})
          const propsList = ['name', 'fullname', 'phone', 'mail', 'identifier', 'description']
          for (const key in mapping) {
            if (propsList.includes(key)) {
              virtualIDSyncConfiguration[key] = mapping[key]
            } else {
              userDefinedSyncConifgProps.push({
                key,
                value: mapping[key]
              })
            }
          }
        }
        virtualIDSyncConfigurationUuid = findVirtualIDSyncConfig?.uuid
      }

      let organizationSyncConfiguration = {}
      let organizationSyncConfigurationUuid = ''
      const findOrgSyncConfig = _tagList.find(
        it => it?.tag?.indexOf('organizationSyncConfiguration') > -1
      )
      if (findOrgSyncConfig) {
        const jsonObj = _get(findOrgSyncConfig?.tag?.split('::'), 1, '')
        const parseObj = JSON.parse(jsonObj)
        const list = parseObj?.rules ?? []
        if (list?.length) {
          const finder = attr => {
            const find = list?.find(it => it.name === attr)
            return find?.attribute
          }
          organizationSyncConfiguration = {
            name: finder('name'),
            description: finder('description'),
            strategy: parseObj?.strategy
          }
        }
        organizationSyncConfigurationUuid = findOrgSyncConfig?.uuid
      }

      return {
        ldapCleanBindingFilter,
        ldapCleanBindingFilterUuid,
        ldapAllowListFilter,
        ldapAllowListFilterUuid,
        ldapServerType,
        ldapServerTypeUuid,
        organizationSyncConfiguration,
        organizationSyncConfigurationUuid,
        ldapUseAsLoginName,
        ldapUseAsLoginNameUuid,
        standbyServerIP,
        standbyServerPort,
        ldapUrlsUuid,
        virtualIDSyncConfiguration,
        virtualIDSyncConfigurationUuid,
        userDefinedSyncConifgProps
      }
    })
  }
}
