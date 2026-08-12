import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { CONTEXT } from '@nestjs/graphql'
import { Test, TestingModule } from '@nestjs/testing'

import { WebhookCallbackService } from '@/api/zstack/base/webhook-callback.service'
import { PubSubService } from '@/common/pub-sub/pub-sub.service'

import {
  createConfigMock,
  createContextMock,
  createHttpServiceMock,
  createLoggerMock,
  createPubSubMock,
  createWebhookCallbackMock
} from '../mocks'

jest.mock('@/common/logger/logger.decorator', () => {
  const { Inject } = jest.requireActual('@nestjs/common')
  return {
    Logger: (name = '') => Inject(`LoggerService${name}`),
    loggerNames: []
  }
})

import { ZQLService } from '@/api/zstack/base/zql-query'

describe('ZQLService', () => {
  let service: ZQLService
  let httpMock: ReturnType<typeof createHttpServiceMock>
  let configMock: ReturnType<typeof createConfigMock>
  let webhookMock: ReturnType<typeof createWebhookCallbackMock>

  /** 取 jest.fn() 调用记录，绕过 strict tuple 推断 */
  const calls = (fn: jest.Mock) => fn.mock.calls as any[][]

  beforeEach(async () => {
    httpMock = createHttpServiceMock()
    configMock = createConfigMock()
    webhookMock = createWebhookCallbackMock()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZQLService,
        { provide: HttpService, useValue: httpMock },
        { provide: ConfigService, useValue: configMock },
        { provide: CONTEXT, useValue: createContextMock() },
        { provide: PubSubService, useValue: createPubSubMock() },
        { provide: WebhookCallbackService, useValue: webhookMock },
        { provide: 'LoggerServiceZQLService', useValue: createLoggerMock() }
      ]
    }).compile()

    service = module.get<ZQLService>(ZQLService)
  })

  describe('call — 200 同步响应', () => {
    it('返回 resp.data', async () => {
      const mockData = {
        results: [{ inventories: [{ uuid: 'vm1', name: 'test' }], total: 1 }]
      }
      // ZQLService 用 .toPromise() 而非 firstValueFrom，mock 需兼容
      httpMock.get.mockReturnValueOnce({
        toPromise: () => Promise.resolve({ status: 200, data: mockData })
      } as any)

      const result = await service.call('query VmInstance')

      expect(result).toEqual(mockData)
    })

    it('请求 URL 包含 ZQL 编码后的查询', async () => {
      httpMock.get.mockReturnValueOnce({
        toPromise: () => Promise.resolve({ status: 200, data: { results: [] } })
      } as any)

      await service.call("query VmInstance where name='test vm'")

      const callUrl = calls(httpMock.get)[0][0]
      expect(callUrl).toContain('/zstack/v1/zql?zql=')
      expect(callUrl).toContain(encodeURIComponent("query VmInstance where name='test vm'"))
    })

    it('Authorization header 正确设置', async () => {
      httpMock.get.mockReturnValueOnce({
        toPromise: () => Promise.resolve({ status: 200, data: { results: [] } })
      } as any)

      await service.call('query VmInstance')

      const headers = calls(httpMock.get)[0][1].headers
      expect(headers['Authorization']).toBe('OAuth test-session-id')
    })

    it('外部传入 sessionId 优先', async () => {
      httpMock.get.mockReturnValueOnce({
        toPromise: () => Promise.resolve({ status: 200, data: { results: [] } })
      } as any)

      await service.call('query VmInstance', { sessionId: 'override-session' })

      const headers = calls(httpMock.get)[0][1].headers
      expect(headers['Authorization']).toBe('OAuth override-session')
    })

    it('200 时清理 webhook callback', async () => {
      httpMock.get.mockReturnValueOnce({
        toPromise: () => Promise.resolve({ status: 200, data: { results: [] } })
      } as any)

      await service.call('query VmInstance')

      expect(webhookMock.set).toHaveBeenCalled()
      expect(webhookMock.remove).toHaveBeenCalled()
    })
  })

  describe('call — 错误处理', () => {
    it('HTTP 错误抛出 ApolloError', async () => {
      httpMock.get.mockReturnValueOnce({
        toPromise: () =>
          Promise.reject({
            response: {
              data: { error: { code: 'SYS.1000', description: 'fail' } }
            }
          })
      } as any)

      await expect(service.call('query VmInstance')).rejects.toThrow()
    })

    it('SYS.1006 静默返回空结果', async () => {
      httpMock.get.mockReturnValueOnce({
        toPromise: () =>
          Promise.reject({
            response: {
              data: {
                error: { code: 'SYS.1006', description: 'no permission' }
              }
            }
          })
      } as any)

      const result = await service.call('query VmInstance')

      expect(result.results[0].inventories).toEqual([])
      expect(result.results[0].total).toBe(0)
    })
  })
})
