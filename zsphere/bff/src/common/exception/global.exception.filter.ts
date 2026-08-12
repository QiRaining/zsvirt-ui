/**
 * 全局异常句柄无法实现对特定action错误抓取、记录数据库和返回前端页面。所以放弃这条路径。
 *  */

import { Catch, ArgumentsHost, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { GqlContextType } from '@nestjs/graphql'
import { Response } from 'express'

import { Logger } from '../logger/logger.decorator'
import { ZSLoggerService } from '../logger/logger.service'

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  @Logger(AllExceptionsFilter.name) logger: ZSLoggerService
  catch(exception: any, host: ArgumentsHost) {
    const logger = new ZSLoggerService()
    let traceId = ''
    logger.setName('global exception')
    if (host.getType() === 'http') {
      const [req] = host.getArgs()
      traceId = req?.headers['trace_id']
    } else if (host.getType<GqlContextType>() === 'graphql') {
      const [_, args, context, info] = host.getArgs()
      traceId = context?.req.headers['trace_id']
      let error = {}
      try {
        if (exception.message) {
          error = {
            args: JSON.stringify(args)
            // info: JSON.stringify(info)
          }
        }
      } catch (e) {
        logger.error(`[${traceId}] args or info parse error`)
      }
      logger.error(`[${traceId}] ${exception.message}`, exception.stack, JSON.stringify(error))
    }
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR

    const message = exception instanceof Error ? exception.message : exception
    if (exception.status) {
      status = exception.status
    }

    response.writable &&
      response?.status?.call &&
      response.status(status).json({
        status,
        error: message,
        message:
          status === HttpStatus.INTERNAL_SERVER_ERROR
            ? 'Sorry we are experiencing technical problems.'
            : '',
        traceId: traceId
      })
  }
}
