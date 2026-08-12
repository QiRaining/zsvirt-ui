import { WebhookCallbackService } from '@/api/zstack/base/webhook-callback.service'

describe('WebhookCallbackService', () => {
  let service: WebhookCallbackService

  beforeEach(() => {
    service = new WebhookCallbackService()
  })

  afterEach(() => {
    // 清理全局状态
    const globalAny: any = global
    globalAny.webhookCallbackServiceCallList = []
  })

  describe('set / get / remove', () => {
    it('set 后 get 返回 resolve 和 reject', () => {
      const resolve = jest.fn()
      const reject = jest.fn()

      service.set('action-1', resolve, reject)

      const entry = service.get('action-1')
      expect(entry.resolve).toBe(resolve)
      expect(entry.reject).toBe(reject)
    })

    it('remove 后 get 返回 undefined', () => {
      service.set('action-1', jest.fn(), jest.fn())
      service.remove('action-1')

      expect(service.get('action-1')).toBeUndefined()
    })

    it('重复 set 同一 actionId 合并属性', () => {
      const resolve1 = jest.fn()
      const reject1 = jest.fn()
      const resolve2 = jest.fn()
      const reject2 = jest.fn()

      service.set('action-1', resolve1, reject1)
      service.set('action-1', resolve2, reject2)

      const entry = service.get('action-1')
      expect(entry.resolve).toBe(resolve2)
      expect(entry.reject).toBe(reject2)
    })
  })

  describe('update', () => {
    it('更新已有 entry 的额外信息', () => {
      service.set('action-1', jest.fn(), jest.fn())
      service.update('action-1', { sessionId: 's1', method: 'POST' })

      const entry = service.get('action-1')
      expect(entry.sessionId).toBe('s1')
      expect(entry.method).toBe('POST')
    })

    it('对不存在的 entry 创建新记录', () => {
      service.update('action-2', { sessionId: 's2' })

      const entry = service.get('action-2')
      expect(entry.sessionId).toBe('s2')
    })
  })

  describe('success', () => {
    it('调用 resolve 并清理', () => {
      const resolve = jest.fn()
      service.set('action-1', resolve, jest.fn())

      service.success('action-1', { uuid: 'vm-1' })

      expect(resolve).toHaveBeenCalledWith({ uuid: 'vm-1' })
      expect(service.get('action-1')).toBeUndefined()
    })

    it('不存在的 actionId 不报错', () => {
      expect(() => service.success('nonexistent', {})).not.toThrow()
    })

    it('resolve 为空时不报错', () => {
      service.update('action-1', { sessionId: 's1' })
      expect(() => service.success('action-1', {})).not.toThrow()
    })
  })

  describe('fail', () => {
    it('调用 reject 并附加 apiError 名称', () => {
      const reject = jest.fn()
      service.set('action-1', jest.fn(), reject)

      const errorResp = { code: 'SYS.1000', description: 'fail' }
      service.fail('action-1', errorResp)

      expect(reject).toHaveBeenCalled()
      const arg = reject.mock.calls[0][0]
      expect(arg.name).toBe('apiError')
      expect(arg.code).toBe('SYS.1000')
      expect(service.get('action-1')).toBeUndefined()
    })

    it('resp 为 null 时创建默认 apiError', () => {
      const reject = jest.fn()
      service.set('action-1', jest.fn(), reject)

      service.fail('action-1', null)

      const arg = reject.mock.calls[0][0]
      expect(arg.name).toBe('apiError')
    })

    it('不存在的 actionId 不报错', () => {
      expect(() => service.fail('nonexistent', {})).not.toThrow()
    })
  })
})
