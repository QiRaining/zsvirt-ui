import { mockAuthMiddleware } from '../mock-auth.middleware'

describe('mockAuthMiddleware', () => {
  it('injects fake session + user headers and delegates trace_id', () => {
    const req: any = { headers: {} }
    const res: any = { setHeader: jest.fn() }
    const next = jest.fn()
    mockAuthMiddleware(req, res, next)
    expect(req.headers['x-session-id']).toBe('mock-session')
    expect(req.headers['x-user-uuid']).toBe('mock-admin')
    expect(req.headers['trace_id']).toBeDefined()
    expect(res.setHeader).toHaveBeenCalledWith('trace_id', req.headers['trace_id'])
    expect(next).toHaveBeenCalled()
  })
})
