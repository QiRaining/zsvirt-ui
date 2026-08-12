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
  createWebhookCallbackMock,
  mockHttpResponse,
  mockHttpError
} from '../mocks'

// 需要在 import 源码之前 mock 掉 decorator，保留 Inject 行为
jest.mock('@/common/logger/logger.decorator', () => {
  const { Inject } = jest.requireActual('@nestjs/common')
  return {
    Logger: (name = '') => Inject(`LoggerService${name}`),
    loggerNames: []
  }
})

import { ZsHttpService } from '@/common/trans/zs-http-service/zs-http-service.service'

describe('ZsHttpService', () => {
  let service: ZsHttpService
  let httpMock: ReturnType<typeof createHttpServiceMock>
  let configMock: ReturnType<typeof createConfigMock>
  let contextMock: ReturnType<typeof createContextMock>
  let pubSubMock: ReturnType<typeof createPubSubMock>
  let webhookMock: ReturnType<typeof createWebhookCallbackMock>
  let loggerMock: ReturnType<typeof createLoggerMock>

  /** 取 jest.fn() 调用记录，绕过 strict tuple 推断 */
  const calls = (fn: jest.Mock) => fn.mock.calls as any[][]

  beforeEach(async () => {
    httpMock = createHttpServiceMock()
    configMock = createConfigMock()
    contextMock = createContextMock()
    pubSubMock = createPubSubMock()
    webhookMock = createWebhookCallbackMock()
    loggerMock = createLoggerMock()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZsHttpService,
        { provide: HttpService, useValue: httpMock },
        { provide: ConfigService, useValue: configMock },
        { provide: CONTEXT, useValue: contextMock },
        { provide: PubSubService, useValue: pubSubMock },
        { provide: WebhookCallbackService, useValue: webhookMock },
        { provide: 'LoggerServiceZsHttpService', useValue: loggerMock }
      ]
    }).compile()

    service = module.get<ZsHttpService>(ZsHttpService)
  })

  // ─── stringify ───────────────────────────────────────────────────
  describe('stringify', () => {
    it('字符串原样返回', () => {
      expect(service.stringify('hello')).toBe('hello')
    })

    it('对象 JSON 序列化', () => {
      expect(service.stringify({ a: 1 })).toBe('{"a":1}')
    })

    it('数字转为字符串', () => {
      expect(service.stringify(123)).toBe('123')
    })
  })

  // ─── GET ─────────────────────────────────────────────────────────
  describe('get', () => {
    it('成功请求返回响应', async () => {
      const mockData = { inventories: [{ uuid: 'abc' }] }
      mockHttpResponse(httpMock, 'get', mockData)

      const result = await service.get('vm-instances')

      expect(httpMock.get).toHaveBeenCalledTimes(1)
      const callUrl = calls(httpMock.get)[0][0]
      expect(callUrl).toBe('http://127.0.0.1:8080/zstack/v1/vm-instances')
      expect(result.data).toEqual(mockData)
    })

    it('apiPath 前导斜杠被移除', async () => {
      mockHttpResponse(httpMock, 'get', {})

      await service.get('/vm-instances')

      const callUrl = calls(httpMock.get)[0][0]
      expect(callUrl).not.toContain('v1//')
      expect(callUrl).toContain('v1/vm-instances')
    })

    it('Authorization header 使用 context 中的 session', async () => {
      mockHttpResponse(httpMock, 'get', {})

      await service.get('vm-instances')

      const headers = calls(httpMock.get)[0][1].headers
      expect(headers['Authorization']).toBe('OAuth test-session-id')
    })

    it('外部传入 sessionId 优先于 context', async () => {
      mockHttpResponse(httpMock, 'get', {})

      await service.get('vm-instances', { sessionId: 'custom-session' })

      const headers = calls(httpMock.get)[0][1].headers
      expect(headers['Authorization']).toBe('OAuth custom-session')
    })

    it('X-Job-UUID header 被设置', async () => {
      mockHttpResponse(httpMock, 'get', {})

      await service.get('vm-instances', { apiId: 'my-api-id' })

      const headers = calls(httpMock.get)[0][1].headers
      expect(headers['X-Job-UUID']).toBe('my-api-id')
    })

    it('HTTP 错误抛出 ApolloError', async () => {
      mockHttpError(httpMock, 'get', {
        error: { code: 'SYS.1000', description: 'Internal error' }
      })

      await expect(service.get('vm-instances')).rejects.toThrow()
    })

    it('SYS.1006 错误静默返回空数组', async () => {
      mockHttpError(httpMock, 'get', {
        error: { code: 'SYS.1006', description: 'No permission' }
      })

      const result = await service.get('vm-instances')
      expect(result.data.inventories).toEqual([])
    })

    it('SYS.1006 但 apiPath 在白名单时仍然抛错', async () => {
      mockHttpError(httpMock, 'get', {
        error: { code: 'SYS.1006', description: 'No permission' }
      })

      await expect(service.get('twofactorauthentication/secret')).rejects.toThrow()
    })

    it('转发 X-Forwarded-For 和 User-Agent', async () => {
      mockHttpResponse(httpMock, 'get', {})

      await service.get('vm-instances')

      const headers = calls(httpMock.get)[0][1].headers
      expect(headers['X-Forwarded-For']).toBe('192.168.1.100')
      expect(headers['User-Agent']).toBe('jest-test')
    })
  })

  // ─── POST ────────────────────────────────────────────────────────
  describe('post', () => {
    it('成功请求返回响应', async () => {
      const mockData = { uuid: 'new-vm' }
      mockHttpResponse(httpMock, 'post', mockData)

      const result = await service.post('vm-instances', {
        params: { name: 'test-vm' }
      })

      expect(httpMock.post).toHaveBeenCalledTimes(1)
      expect(result.data).toEqual(mockData)
    })

    it('POST 请求包含 X-Web-Hook header', async () => {
      mockHttpResponse(httpMock, 'post', {})

      await service.post('vm-instances', {})

      const headers = calls(httpMock.post)[0][2].headers
      expect(headers['X-Web-Hook']).toBe('http://127.0.0.1:3000/webhook')
    })

    it('POST 请求透传 body 数据', async () => {
      mockHttpResponse(httpMock, 'post', {})
      const body = { params: { name: 'vm1' }, systemTags: ['tag1'] }

      await service.post('vm-instances', body)

      const sentData = calls(httpMock.post)[0][1]
      expect(sentData).toEqual(body)
    })

    it('HTTP 错误抛出 ApolloError', async () => {
      mockHttpError(httpMock, 'post', {
        error: { code: 'SYS.1000', description: 'fail' }
      })

      await expect(service.post('vm-instances', {})).rejects.toThrow()
    })
  })

  // ─── PUT ─────────────────────────────────────────────────────────
  describe('put', () => {
    it('成功请求', async () => {
      mockHttpResponse(httpMock, 'put', { success: true })

      const result = await service.put('vm-instances/abc', { name: 'new-name' })

      expect(httpMock.put).toHaveBeenCalledTimes(1)
      expect(result.data).toEqual({ success: true })
    })
  })

  // ─── DELETE ──────────────────────────────────────────────────────
  describe('delete', () => {
    it('成功请求', async () => {
      mockHttpResponse(httpMock, 'delete', { success: true })

      const result = await service.delete('vm-instances/abc')

      expect(httpMock.delete).toHaveBeenCalledTimes(1)
      expect(result.data).toEqual({ success: true })
    })
  })

  // ─── _isWebhookCallbackData ──────────────────────────────────────
  describe('_isWebhookCallbackData', () => {
    it('有 apiTimeout 和 location 返回 true', () => {
      expect(
        service._isWebhookCallbackData({
          apiTimeout: 30000,
          location: '/api/tasks/1'
        })
      ).toBe(true)
    })

    it('缺少 apiTimeout 返回 false', () => {
      expect(service._isWebhookCallbackData({ location: '/api/tasks/1' })).toBe(false)
    })

    it('null 返回 false', () => {
      expect(service._isWebhookCallbackData(null)).toBe(false)
    })
  })

  // ─── API Inspector ───────────────────────────────────────────────
  describe('API Inspector 开启时', () => {
    beforeEach(() => {
      configMock.get.mockImplementation((key: string) => {
        if (key === 'API_INSPECTOR') {
          return 'true'
        }
        if (key === 'ZS_MN_SERVER') {
          return 'http://127.0.0.1:8080'
        }
        if (key === 'HOST') {
          return '127.0.0.1'
        }
        if (key === 'PORT') {
          return '3000'
        }
        return undefined
      })
    })

    it('GET 请求触发 apiInspector 发布', async () => {
      mockHttpResponse(httpMock, 'get', {})

      await service.get('vm-instances')

      expect(pubSubMock.apiInspector).toHaveBeenCalled()
      const call = calls(pubSubMock.apiInspector)[0][0]
      expect(call.payload.method).toBe('GET')
      expect(call.payload.type).toBe('Request')
    })

    it('POST 请求触发 webhookCallback update', async () => {
      mockHttpResponse(httpMock, 'post', {})

      await service.post('vm-instances', {})

      expect(webhookMock.update).toHaveBeenCalled()
    })
  })
})
