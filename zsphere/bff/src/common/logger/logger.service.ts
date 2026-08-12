import type { LoggerService } from '@nestjs/common'
import { Injectable, Scope, Logger } from '@nestjs/common'
import dayjs from 'dayjs'
const { performance } = require('perf_hooks')
@Injectable({
  scope: Scope.TRANSIENT
})
export class ZSLoggerService extends Logger implements LoggerService {
  private name?: string
  private logger
  private setInfo(message: string, ...others) {
    if ((message as any) instanceof Object) {
      message = JSON.stringify(message)
    }
    return `[${this.name}][${dayjs().format('YYYY-MM-DD_HH:mm:ss')}] [${
      process.env.INSTANCE_ID
    }] ${message} ${others.join(' ')}`
  }
  private setJson(message: any, others: any) {
    const info = Object.assign(
      {
        timestamp: dayjs().format('YYYY-MM-DD_HH:mm:ss'),
        name: this.name,
        instanceID: process.env.INSTANCE_ID
      },
      message,
      others
    )
    return JSON.stringify(info)
  }
  public setName(name) {
    this.name = name
  }

  constructor(context?: string) {
    super(context)
    this.logger = new Logger(context)
  }
  log(message: any, context?: string) {
    return this.logger.log(this.setInfo(message), context)
  }
  error(message: any, trace?: string, context?: string) {
    return this.logger.error(this.setInfo(message, '[error]'), trace, context)
  }
  warn(message: any, context?: string) {
    return this.logger.warn(this.setInfo(message, '[warning]'), context)
  }
  debug(message: any, context?: string) {
    return this.logger.debug(this.setInfo(message, '[debug]'), context)
  }
  collect(message: any, context?: string) {
    return this.logger.collect(this.setInfo(message, '[collect]'), context)
  }
  verbose(message: any, context?: string) {
    return this.logger.verbose(this.setInfo(message), context)
  }
  timing(message?: any, context?: string) {
    return this.logger.log(`${this.setInfo(message || '')} [timing: ${performance.now()}]`, context)
  }
  debugJson(message: any) {
    return console.debug(this.setJson(message, { level: 'debug' }))
  }
  errorJson(message: any, trace?: string) {
    return console.error(this.setJson(message, { level: 'error' }), trace)
  }
  warnJson(message: any) {
    return console.warn(this.setJson(message, { level: 'warning' }))
  }
}
