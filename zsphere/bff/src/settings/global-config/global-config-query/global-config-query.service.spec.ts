import { Op } from '@/api/zstack/base/query-base'

import { GlobalConfigQueryService } from './global-config-query.service'

describe('GlobalConfigQueryService.queryList', () => {
  const createService = ({
    uiConfigRows = []
  }: {
    uiConfigRows?: Array<{ dataValues: { name: string; value: string } }>
  } = {}) => {
    const zqlInventories = [
      {
        category: 'image',
        name: 'upload.max.idle.duration.in.seconds',
        value: '30'
      },
      {
        category: 'softwarePackage',
        name: 'upload.max.idle.duration.in.seconds',
        value: '30'
      }
    ]
    const zqlService = {
      call: jest.fn().mockResolvedValue({
        results: [{ inventories: zqlInventories }]
      })
    }
    const zsUIConfig = {
      findAll: jest.fn().mockResolvedValue(uiConfigRows)
    }
    const service = new GlobalConfigQueryService()
    Object.defineProperty(service, 'zqlService', {
      value: zqlService
    })
    Object.defineProperty(service, 'zsUIConfig', {
      value: zsUIConfig
    })

    return {
      service,
      zqlInventories,
      zsUIConfig
    }
  }

  it('keeps old behavior by querying UI config rows unless explicitly disabled', async () => {
    const uiConfigRows = [{ dataValues: { name: 'operation.max.history', value: '1' } }]
    const { service, zqlInventories, zsUIConfig } = createService({
      uiConfigRows
    })
    const expectedZqlInventories = zqlInventories.map(item => ({ ...item }))

    const result = await service.queryList({
      conditions: [
        {
          key: 'category',
          op: Op.in,
          values: ['image', 'softwarePackage']
        },
        {
          key: 'name',
          op: Op.in,
          values: ['upload.max.idle.duration.in.seconds']
        }
      ]
    })

    expect(zsUIConfig.findAll).toHaveBeenCalled()
    expect(result.list).toEqual([
      ...expectedZqlInventories,
      { ...uiConfigRows[0].dataValues, category: 'ui' }
    ])
    expect(result.total).toBe(3)
  })

  it('does not query UI config rows when includeUiConfig is false', async () => {
    const { service, zqlInventories, zsUIConfig } = createService()

    const result = await service.queryList({
      conditions: [
        {
          key: 'category',
          op: Op.in,
          values: ['image', 'softwarePackage']
        },
        {
          key: 'name',
          op: Op.in,
          values: ['upload.max.idle.duration.in.seconds']
        }
      ],
      includeUiConfig: false
    })

    expect(zsUIConfig.findAll).not.toHaveBeenCalled()
    expect(result.list).toEqual(zqlInventories)
    expect(result.total).toBe(2)
  })
})
