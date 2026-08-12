import type { FastifyReply, FastifyRequest } from 'fastify'

import { genUuid } from '../../utils'

export function mockAuthMiddleware(
  req: FastifyRequest['raw'],
  res: FastifyReply['raw'],
  next: () => void
): void {
  if (!req.headers['trace_id']) {
    req.headers['trace_id'] = genUuid()
  }
  req.headers['x-session-id'] = 'mock-session'
  req.headers['x-user-uuid'] = 'mock-admin'
  req.headers['x-user-name'] = 'mock-admin'
  res.setHeader('trace_id', req.headers['trace_id'] as string)
  res.setHeader('zs-version', 'mock')
  next()
}
