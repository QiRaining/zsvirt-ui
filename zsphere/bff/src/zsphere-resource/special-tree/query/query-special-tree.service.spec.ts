import { QuerySpecialTreeService } from './query-special-tree.service'

describe('QuerySpecialTreeService', () => {
  const buildService = () => {
    const service = new QuerySpecialTreeService()
    const zqlService = {
      call: jest.fn().mockResolvedValue({
        results: [
          {
            inventories: [
              { uuid: 'zone-a', name: 'Zone A', createDate: 'Jun 11, 2026 1:49:36 PM' },
              { uuid: 'zone-b', name: 'Zone B', createDate: 'May 12, 2026 1:49:36 PM' }
            ]
          },
          {
            inventories: [
              {
                uuid: 'cluster-b',
                name: 'Cluster B',
                zoneUuid: 'zone-a',
                createDate: 'Jun 11, 2026 1:49:36 PM'
              },
              {
                uuid: 'cluster-a',
                name: 'Cluster A',
                zoneUuid: 'zone-a',
                createDate: 'May 12, 2026 1:49:36 PM'
              }
            ]
          },
          {
            inventories: [
              {
                uuid: 'host-b',
                name: 'Host B',
                clusterUuid: 'cluster-a',
                managementIp: '10.0.0.2',
                createDate: 'Jun 11, 2026 1:49:36 PM'
              },
              {
                uuid: 'host-a',
                name: 'Host A',
                clusterUuid: 'cluster-a',
                managementIp: '10.0.0.1',
                createDate: 'May 12, 2026 1:49:36 PM'
              }
            ]
          },
          {
            inventories: [
              {
                uuid: 'vm-b',
                name: 'VM B',
                hostUuid: 'host-a',
                createDate: 'Jun 11, 2026 1:49:36 PM'
              },
              {
                uuid: 'vm-a',
                name: 'VM A',
                hostUuid: 'host-a',
                createDate: 'May 12, 2026 1:49:36 PM'
              }
            ]
          },
          { inventories: [] }
        ]
      })
    }

    service.zqlService = zqlService as any

    return { service, zqlService }
  }

  it('sorts cluster host tree results by createDate in bff without passing order params to zql', async () => {
    const { service, zqlService } = buildService()

    const result = await (service.queryList as any)({
      orderBy: 'createDate',
      orderDirection: 'desc'
    })

    expect(zqlService.call).toHaveBeenCalledWith(expect.stringContaining('createDate'))
    expect(zqlService.call).not.toHaveBeenCalledWith(
      expect.stringContaining('order by createDate desc')
    )
    expect(result.list[0].children.map(cluster => cluster.name)).toEqual(['Cluster B', 'Cluster A'])
    expect(result.list[0].children[1].children.map(host => host.name)).toEqual(['Host B', 'Host A'])
    expect(result.list[0].children[1].children[1].children.map(vm => vm.name)).toEqual([
      'VM B',
      'VM A'
    ])
  })

  it('sorts ISO createDate values as valid dates', async () => {
    const service = new QuerySpecialTreeService()
    const zqlService = {
      call: jest.fn().mockResolvedValue({
        results: [
          {
            inventories: [
              { uuid: 'zone-old', name: 'Zone Old', createDate: 'Jun 10, 2026 1:49:36 PM' },
              { uuid: 'zone-new', name: 'Zone New', createDate: '2026-06-11T13:49:36Z' }
            ]
          },
          { inventories: [] },
          { inventories: [] },
          { inventories: [] },
          { inventories: [] }
        ]
      })
    }

    service.zqlService = zqlService as any

    const result = await (service.queryList as any)({
      orderBy: 'createDate',
      orderDirection: 'desc'
    })

    expect(result.list.map(zone => zone.name)).toEqual(['Zone New', 'Zone Old'])
  })

  it('queries vm template tree names from VmInstance instead of TemplatedVmInstance', async () => {
    const service = new QuerySpecialTreeService()
    const zqlService = {
      call: jest
        .fn()
        .mockResolvedValueOnce({
          results: [{ inventories: [{ uuid: 'template-vm-1' }] }]
        })
        .mockResolvedValueOnce({
          results: [
            {
              inventories: [
                { uuid: 'zone-1', name: 'Zone 1', createDate: 'Jun 10, 2026 1:49:36 PM' }
              ]
            },
            {
              inventories: [
                {
                  uuid: 'template-vm-1',
                  name: 'Template 1',
                  zoneUuid: 'zone-1',
                  createDate: 'Jun 11, 2026 1:49:36 PM'
                }
              ]
            }
          ]
        })
    }

    service.zqlService = zqlService as any

    const result = await (service.queryVmTemplateTreeList as any)()
    const templateQuery = zqlService.call.mock.calls[1][0]

    expect(templateQuery).toContain('query VmInstance.name,uuid,zoneUuid,createDate')
    expect(templateQuery).toContain('query TemplatedVmInstance.uuid')
    expect(templateQuery).not.toContain('query TemplatedVmInstance.name')
    expect(result.list[0].children[0].title).toBe('Template 1')
  })
})
