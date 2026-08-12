jest.mock('@/api/zstack/base/query-base', () => ({
  extractAndRemoveExtraCondition: jest.fn(() => [[], {}]),
  Op: {}
}))

jest.mock('@/api/zstack/base/zql-query', () => ({
  ZQLService: class ZQLService {}
}))

jest.mock('@/api/zstack/GetZMigrateGatewayVmInstancesAction', () => ({
  GetZMigrateGatewayVmInstancesAction: class GetZMigrateGatewayVmInstancesAction {}
}))

jest.mock('@/api/zstack/GetZMigrateInfosAction', () => ({
  GetZMigrateInfosAction: class GetZMigrateInfosAction {}
}))

jest.mock('@/api/zstack/QueryLongJobAction', () => ({
  QueryLongJobAction: class QueryLongJobAction {}
}))

jest.mock('@/api/zstack/QuerySystemTagAction', () => ({
  QuerySystemTagAction: class QuerySystemTagAction {}
}))

jest.mock('@/common/zql/index', () => ({
  __esModule: true,
  default: { stringify: jest.fn(() => 'query') },
  ZOp: { like: 'like' }
}))

import { GatewayVmQueryType, MigrationServiceService } from '../migration-service.service'

const gatewayVmInstances = [
  {
    uuid: 'first-gateway-vm',
    name: 'zm-mn',
    state: 'Running',
    createDate: '2024-01-01T00:00:00Z',
    allVolumes: [{ size: 1024 }],
    vmNics: [{ ip: '192.0.2.10' }]
  },
  {
    uuid: 'service-gateway-vm',
    name: 'gateway-vm',
    state: 'Running',
    createDate: '2024-01-02T00:00:00Z',
    allVolumes: [{ size: 2048 }],
    vmNics: [{ ip: '192.0.2.11' }]
  },
  {
    uuid: 'destroyed-gateway-vm',
    name: 'destroyed-gateway-vm',
    state: 'Destroyed',
    createDate: '2024-01-03T00:00:00Z',
    allVolumes: [{ size: 4096 }],
    vmNics: [{ ip: '192.0.2.12' }]
  }
]

const createService = () => {
  const service = new MigrationServiceService()
  service.getZMigrateGatewayVmInstancesAction = {
    call: jest.fn().mockResolvedValue({ gatewayVmInstances })
  } as any
  return service
}

describe('MigrationServiceService VDDK status', () => {
  it('returns a focused VDDK status for the core-shell guard', async () => {
    const service = createService()
    service.getZMigrateInfosAction = {
      call: jest.fn().mockResolvedValue({ vddkUploaded: true })
    } as any

    await expect(service.getZMigrateVddkUploaded()).resolves.toBe(true)
  })

  it('includes vddkUploaded in the migration overview', async () => {
    const service = createService()
    service.getZMigrateInfosAction = {
      call: jest.fn().mockResolvedValue({
        zmigrateVmInstanceStatus: 'Running',
        version: '5.1.0',
        vddkUploaded: true
      })
    } as any
    service.getZMigrateGlobalConfigs = jest.fn().mockResolvedValue({})
    service.getZMigrateGatewayHostIp = jest.fn().mockResolvedValue('192.0.2.10')
    service.getFirstGatewayVmInfo = jest.fn().mockResolvedValue(null)
    service.getUpgradeTaskStatus = jest.fn().mockResolvedValue({
      upgradeTasks: [],
      hasRunningTask: false
    })

    await expect(service.getZMigrateInfos()).resolves.toMatchObject({
      vddkUploaded: true
    })
  })
})

describe('MigrationServiceService.queryGatewayVmList', () => {
  it('filters the first gateway VM by default for the service management list', async () => {
    const service = createService()

    const result = await service.queryGatewayVmList({ replyWithCount: true })

    expect(result.list?.map(item => item.uuid)).toEqual(['service-gateway-vm'])
  })

  it('keeps the first gateway VM when callers need the full gateway VM set', async () => {
    const service = createService()

    const result = await service.queryGatewayVmList({
      replyWithCount: false,
      type: GatewayVmQueryType.IncludeFirstGateway
    })

    expect(result.list?.map(item => item.uuid)).toEqual(['first-gateway-vm', 'service-gateway-vm'])
    expect(result.list?.[0]?.isFirstGateway).toBe(true)
  })
})
