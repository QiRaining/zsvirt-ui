import { Injectable, NestMiddleware } from '@nestjs/common'
import { FastifyRequest, FastifyReply } from 'fastify'

import { genUuid } from './utils'
@Injectable()
export class AppMiddleWare implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    if (!req.headers['trace_id']) {
      req.headers['trace_id'] = genUuid()
      res.setHeader('zs-version', 'dev')
    }
    res.setHeader('trace_id', req.headers['trace_id'])
    next()
  }
}
