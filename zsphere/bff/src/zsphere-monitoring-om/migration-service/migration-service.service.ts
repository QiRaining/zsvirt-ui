import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as _ from 'lodash'

import { extractAndRemoveExtraCondition, Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetZMigrateGatewayVmInstancesAction } from '@/api/zstack/GetZMigrateGatewayVmInstancesAction'
import { GetZMigrateInfosAction } from '@/api/zstack/GetZMigrateInfosAction'
import { QueryLongJobAction } from '@/api/zstack/QueryLongJobAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import {
  MigrationServicePackage,
  MigrationServiceInfo,
  UpgradeTaskInfo,
  ZMigrateGlobalConfig,
  ZMigrateRuntimeConfig,
  QueryGatewayVmInstanceResp,
  FirstGatewayVmInfo
} from './migration-service.model'
import { extractUpgradeVersionFromJobData } from './upgrade-task'

export enum GatewayVmQueryType {
  IncludeFirstGateway = 'includeFirstGateway'
}

@Injectable()
export class MigrationServiceService {
  @Inject() zqlService: ZQLService
  @Inject() configService: ConfigService
  @Inject() getZMigrateInfosAction: GetZMigrateInfosAction
  @Inject()
  getZMigrateGatewayVmInstancesAction: GetZMigrateGatewayVmInstancesAction
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() queryLongJobAction: QueryLongJobAction

  /**
   * 查询迁移服务安装包状态
   * 对应 API: 查询 SoftwarePackage 表中 type='ZMigrate' 的记录
   */
  async getMigrationServicePackage(): Promise<MigrationServicePackage | null> {
    const zql = ZQL.stringify({
      tableName: 'SoftwarePackage',
      condition: {
        type: 'ZMigrate'
      }
    })

    const zql2 = ZQL.stringify({
      tableName: 'SystemTag',
      fields: ['tag'],
      condition: {
        resourceType: 'SoftwarePackageVO',
        tag: {
          [ZOp.like]: 'ZMigrate%Image%'
        }
      }
    })
    const [zqlResult, systemTagResult] = await Promise.all([
      this.zqlService.call(zql),
      this.zqlService.call(zql2)
    ])

    const inventory = _.get(zqlResult, ['results', '0', 'inventories', '0'], null)

    if (!inventory) {
      return null
    }

    const systemTags: Array<{ tag: string }> = _.get(
      systemTagResult,
      ['results', '0', 'inventories'],
      []
    )
    let gatewayImageUuid = ''
    let linuxBootImageUuid = ''
    let windowsBootImageUuid = ''
    for (const item of systemTags) {
      const tag = item.tag ?? ''
      if (tag.startsWith('ZMigrateGatewayImage::')) {
        gatewayImageUuid = tag.split('::')[1] || ''
      } else if (tag.startsWith('ZMigrateLinuxBootImage::')) {
        linuxBootImageUuid = tag.split('::')[1] || ''
      } else if (tag.startsWith('ZMigrateWindowsBootImage::')) {
        windowsBootImageUuid = tag.split('::')[1] || ''
      }
    }

    return {
      uuid: inventory.uuid,
      name: inventory.name,
      status: inventory.status,
      type: inventory.type,
      installPath: inventory.installPath,
      version: inventory.installPath.match(/\d+\.\d+\.\d+/)?.[0] || '',
      gatewayImageUuid,
      linuxBootImageUuid,
      windowsBootImageUuid
    }
  }

  /**
   * 查询 zmigrate category 的全局配置
   * 通过 ZQL 查询 GlobalConfig category="zmigrate"
   * 包含：gateway.ssh.password, platform.region.uuid, platform.account.uuid
   */
  async getZMigrateGlobalConfigs(): Promise<ZMigrateGlobalConfig> {
    try {
      const zqlObject: ZqlObject = {
        tableName: 'GlobalConfig',
        condition: {
          category: 'zmigrate'
        }
      }

      const zql = ZQL.stringify(zqlObject)
      const { results } = await this.zqlService.call(zql)
      const inventories = results?.[0]?.inventories ?? []

      const configMap: Record<string, string> = {}
      for (const item of inventories) {
        configMap[item.name] = item.value
      }

      return {
        gatewaySshPassword: configMap['gateway.ssh.password'] ?? '',
        platformRegionUuid: configMap['platform.region.uuid'] ?? '',
        platformAccountUuid: configMap['platform.account.uuid'] ?? ''
      }
    } catch {
      return {}
    }
  }

  /**
   * 查询 zmigrate 网关宿主机 IP
   * 数据链路：
   *   1. 查 SystemTag: resourceType=VmInstanceVO, tag=ZMigrateManagementNodeVm
   *   2. 从 tag 的 resourceUuid 获取 VM UUID
   *   3. 调用 GetZMigrateGatewayVmInstances，在结果中 find 匹配的 VM
   *   4. 返回 vmNics[0].ip
   */
  async getZMigrateGatewayHostIp(): Promise<string> {
    try {
      const systemTagResult = await this.querySystemTagAction.call({
        conditions: [
          { key: 'resourceType', value: 'VmInstanceVO' },
          { key: 'tag', value: 'ZMigrateManagementNodeVm' }
        ]
      })

      const vmUuid = systemTagResult?.inventories?.[0]?.resourceUuid
      if (!vmUuid) return ''

      const gatewayResult = await this.getZMigrateGatewayVmInstancesAction.call({})
      const { gatewayVmInstances = [] } = gatewayResult || {}

      const matchedVm = gatewayVmInstances.find((vm: any) => vm.uuid === vmUuid)
      return matchedVm?.vmNics?.[0]?.ip || ''
    } catch {
      return ''
    }
  }

  /**
   * 获取最先创建的网关虚拟机信息（配置信息）
   * 按 createDate 升序排序，取第一个
   */
  async getFirstGatewayVmInfo(): Promise<FirstGatewayVmInfo | null> {
    try {
      const result = await this.getZMigrateGatewayVmInstancesAction.call({})
      const gatewayVmInstances = result?.gatewayVmInstances ?? []

      if (gatewayVmInstances.length === 0) {
        return null
      }

      const sorted = [...gatewayVmInstances].sort(
        (a: any, b: any) => new Date(a.createDate).getTime() - new Date(b.createDate).getTime()
      )
      const firstVm = sorted[0]

      return {
        uuid: firstVm.uuid,
        name: firstVm.name,
        state: firstVm.state,
        cpuNum: firstVm.cpuNum,
        memorySize: firstVm.memorySize,
        storageSize: (firstVm.allVolumes || []).reduce(
          (sum: number, v: any) => sum + (v.size || 0),
          0
        ),
        defaultIp: firstVm.vmNics?.[0]?.ip || '',
        createDate: firstVm.createDate,
        type: firstVm.type,
        hypervisorType: firstVm.hypervisorType,
        platform: firstVm.platform,
        hostUuid: firstVm.hostUuid
      }
    } catch {
      return null
    }
  }

  /**
   * 查询升级 LongJob 状态
   * 通过 QueryLongJobAction 查询 jobName='APIUploadAndExecuteSoftwareUpgradePackageMsg' 的记录
   * 按 createDate 降序排列，返回最近的升级任务列表
   */
  async getUpgradeTaskStatus(): Promise<{
    upgradeTasks: UpgradeTaskInfo[]
    hasRunningTask: boolean
  }> {
    try {
      const result = await this.queryLongJobAction.call(
        {
          conditions: [
            {
              key: 'jobName',
              value: 'APIUploadAndExecuteSoftwareUpgradePackageMsg'
            }
          ],
          sortBy: 'createDate',
          sortDirection: 'desc',
          limit: 1
        },
        {},
        false
      )

      const inventories = result?.inventories ?? []

      const upgradeTasks: UpgradeTaskInfo[] = inventories.map((job: any) => {
        let status: string
        switch (job.state) {
          case 'Running':
            status = 'running'
            break
          case 'Succeeded':
            status = 'success'
            break
          case 'Failed':
          case 'Canceled':
            status = 'failed'
            break
          default:
            status = 'running'
        }

        const version = extractUpgradeVersionFromJobData(job.jobData || '{}')

        return {
          uuid: job.uuid,
          version,
          status
        }
      })

      const hasRunningTask = upgradeTasks.some(t => t.status === 'running')

      return { upgradeTasks, hasRunningTask }
    } catch {
      return { upgradeTasks: [], hasRunningTask: false }
    }
  }

  /**
   * 查询迁移概览信息
   * 对应 API: APIGetZMigrateInfosMsg / APIGetZMigrateInfosReply
   * 包含：服务状态、版本、平台数、网关数、任务数、启动时间、升级任务等
   * 同时查询 zmigrate category 的全局配置和网关宿主机 IP
   */
  async getZMigrateInfos(): Promise<MigrationServiceInfo | null> {
    try {
      const [mainResult, configResult, hostIpResult, gatewayVmResult, upgradeResult] =
        await Promise.allSettled([
          this.getZMigrateInfosAction.call({}),
          this.getZMigrateGlobalConfigs(),
          this.getZMigrateGatewayHostIp(),
          this.getFirstGatewayVmInfo(),
          this.getUpgradeTaskStatus()
        ])

      // 主信息必须成功，否则整体返回 null
      const result = mainResult.status === 'fulfilled' ? mainResult.value : null
      if (!result) {
        return null
      }

      // 辅助信息部分失败时使用安全默认值，不影响整体
      const globalConfigs = configResult.status === 'fulfilled' ? configResult.value : {}
      const gatewayHostIp = hostIpResult.status === 'fulfilled' ? hostIpResult.value : ''
      const firstGatewayVm = gatewayVmResult.status === 'fulfilled' ? gatewayVmResult.value : null
      const upgradeStatus =
        upgradeResult.status === 'fulfilled'
          ? upgradeResult.value
          : { upgradeTasks: [], hasRunningTask: false }

      return {
        status: result.zmigrateVmInstanceStatus,
        version: result.version,
        platformCount: result.platformsCount ?? 0,
        gatewayCount: result.gatewaysCount ?? 0,
        taskCount: result.migrateJobsCount ?? 0,
        startTime: result.zmigrateStartTime ? new Date(result.zmigrateStartTime).toISOString() : '',
        globalConfigs,
        gatewayHostIp,
        firstGatewayVm,
        vddkUploaded: result.vddkUploaded ?? false,
        hasRunningTask: upgradeStatus.hasRunningTask,
        upgradeTasks: upgradeStatus.upgradeTasks
      }
    } catch {
      return null
    }
  }

  /** 轻量查询：供 ZSV core-shell 在挂载 ZMigration 前检查 VDDK。 */
  async getZMigrateVddkUploaded(): Promise<boolean> {
    const result = await this.getZMigrateInfosAction.call({})
    return result.vddkUploaded ?? false
  }

  /**
   * 轻量查询：仅返回 zmigrate micro-app 启动所需的运行时配置
   *
   * 与 getZMigrateInfos 的区别：
   * - 旧的 getZMigrateInfos 跑 5 个并发调用，慢点是：
   *   1. GetZMigrateInfosAction（聚合 Platform/Gateway/Job 数）— 主要瓶颈
   *   2. GetZMigrateGatewayVmInstances（Gateway VM 全量）
   *   3. QueryLongJob（升级任务）
   * - 本方法只跑 globalConfigs + gatewayHostIp 2 个轻量调用
   *
   * 客户端通过 gatewayHostIp 是否存在推导 installed 状态，
   * 不需要再去等 GetZMigrateInfosAction 返回 zmigrateVmInstanceStatus。
   */
  async getZMigrateRuntimeConfig(): Promise<ZMigrateRuntimeConfig | null> {
    try {
      const [configResult, hostIpResult] = await Promise.allSettled([
        this.getZMigrateGlobalConfigs(),
        this.getZMigrateGatewayHostIp()
      ])

      const globalConfigs = configResult.status === 'fulfilled' ? configResult.value : {}
      const gatewayHostIp = hostIpResult.status === 'fulfilled' ? hostIpResult.value : ''

      const zsMnServer = this.configService.get<string>('ZS_MN_SERVER') ?? ''

      return {
        gatewayHostIp,
        globalConfigs,
        zsMnServer
      }
    } catch {
      return null
    }
  }

  /**
   * 查询网关虚拟机列表
   * 对应 API: APIGetZMigrateGatewayVmInstancesMsg
   * 接口返回全量数组，手动分页
   */
  async queryGatewayVmList(params: IQueryAction): Promise<QueryGatewayVmInstanceResp> {
    const { conditions = [], start = 0, limit, type } = params

    const extraConditions = []
    const [, extraConditionMap] = extractAndRemoveExtraCondition(conditions, ['name', 'state'])
    if (extraConditionMap.name?.value) {
      const name = extraConditionMap.name.value.toLocaleLowerCase()
      extraConditions.push((val: any) => val.name?.toLocaleLowerCase().includes(name))
    }
    if (extraConditionMap.state?.values?.length) {
      const states = extraConditionMap.state.values
      extraConditions.push((val: any) => states.includes(val.state))
    }

    let gatewayVmInstances = []
    try {
      const result = await this.getZMigrateGatewayVmInstancesAction.call({})
      gatewayVmInstances = (result?.gatewayVmInstances ?? []).filter(
        (vm: any) => vm.state !== 'Destroyed'
      )
    } catch {
      gatewayVmInstances = []
    }

    // 按创建时间排序，找到最早创建的网关虚拟机（zm-mn，即迁移服务自身）
    const firstGatewayUuid =
      gatewayVmInstances.length > 0
        ? [...gatewayVmInstances].sort(
            (a: any, b: any) => new Date(a.createDate).getTime() - new Date(b.createDate).getTime()
          )[0]?.uuid
        : ''

    const includeFirstGateway = type === GatewayVmQueryType.IncludeFirstGateway

    // zm-mn 默认仅在概览中展示，服务管理列表中需过滤掉（ZSV-11935）。
    // 少数调用方只需要识别完整网关 VM 集合，可显式包含第一台网关 VM。
    const _inventories = gatewayVmInstances
      .filter((val: any) => includeFirstGateway || val.uuid !== firstGatewayUuid)
      .filter((val: any) => extraConditions.every(fn => fn(val)))

    const total = _inventories.length

    const list = _inventories.slice(start, limit ? start + limit : total).map((val: any) => ({
      uuid: val.uuid,
      name: val.name,
      state: val.state,
      cpuNum: val.cpuNum,
      memorySize: val.memorySize,
      storageSize: (val.allVolumes || []).reduce((sum: number, v: any) => sum + (v.size || 0), 0),
      defaultIp: val.vmNics?.[0]?.ip || '',
      createDate: val.createDate,
      lastOpDate: val.lastOpDate,
      clusterUuid: val.clusterUuid,
      hostUuid: val.hostUuid,
      zoneUuid: val.zoneUuid,
      hypervisorType: val.hypervisorType,
      type: val.type,
      platform: val.platform,
      architecture: val.architecture,
      isFirstGateway: val.uuid === firstGatewayUuid
    }))

    return { list, total }
  }
}
