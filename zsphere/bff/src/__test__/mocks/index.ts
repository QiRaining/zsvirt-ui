/**
 * ZSV BFF 测试公共 Mock 工厂
 *
 * 所有 Service 集成测试共享这些 mock，避免每个 spec 重复定义。
 */

// ─── ConfigService Mock ────────────────────────────────────────────
export function createConfigMock(overrides: Record<string, any> = {}) {
  const config = {
    ZS_MN_SERVER: 'http://127.0.0.1:8080',
    HOST: '127.0.0.1',
    PORT: '3000',
    LOG_QUERY: 'false',
    API_INSPECTOR: 'false',
    ...overrides
  }
  return {
    get: jest.fn((key: string) => config[key])
  }
}

// ─── GraphQL CONTEXT Mock ──────────────────────────────────────────
export function createContextMock(headers: Record<string, string> = {}) {
  return {
    req: {
      headers: {
        'x-session-id': 'test-session-id',
        'x-job-id': 'test-job-id',
        'x-real-ip': '192.168.1.100',
        'x-forwarded-for': '192.168.1.100',
        'user-agent': 'jest-test',
        trace_id: 'test-trace-id',
        ...headers
      }
    }
  }
}

// ─── Logger Mock ───────────────────────────────────────────────────
export function createLoggerMock() {
  return {
    debug: jest.fn(),
    debugJson: jest.fn(),
    error: jest.fn(),
    errorJson: jest.fn(),
    warn: jest.fn(),
    log: jest.fn()
  }
}

// ─── PubSubService Mock ────────────────────────────────────────────
export function createPubSubMock() {
  return {
    apiInspector: jest.fn(),
    publish: jest.fn(),
    subscribe: jest.fn()
  }
}

// ─── WebhookCallbackService Mock ───────────────────────────────────
export function createWebhookCallbackMock() {
  return {
    set: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    success: jest.fn(),
    fail: jest.fn()
  }
}

// ─── HttpService (axios) Mock ──────────────────────────────────────
import { of, throwError } from 'rxjs'

export function createHttpServiceMock() {
  return {
    get: jest.fn(() => of({ status: 200, data: {} })),
    post: jest.fn(() => of({ status: 200, data: {} })),
    put: jest.fn(() => of({ status: 200, data: {} })),
    delete: jest.fn(() => of({ status: 200, data: {} }))
  }
}

/**
 * 让 HttpService mock 的某方法返回指定数据
 */
export function mockHttpResponse(
  httpMock: ReturnType<typeof createHttpServiceMock>,
  method: 'get' | 'post' | 'put' | 'delete',
  data: any,
  status = 200
) {
  httpMock[method].mockReturnValueOnce(of({ status, data }))
}

/**
 * 让 HttpService mock 的某方法抛出 HTTP 错误
 */
export function mockHttpError(
  httpMock: ReturnType<typeof createHttpServiceMock>,
  method: 'get' | 'post' | 'put' | 'delete',
  errorData: any,
  statusCode = 500
) {
  httpMock[method].mockReturnValueOnce(
    throwError(() => ({
      response: { data: errorData, status: statusCode }
    }))
  )
}
