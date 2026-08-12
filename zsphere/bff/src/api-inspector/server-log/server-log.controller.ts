import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

/* tslint:disable */
import { Controller, Get, Header, Inject, Param } from '@nestjs/common'

// import { Cache } from 'cache-manager'
// import { CacheService, Cache } from '@/common/cache'
import { ManagementNodeService } from '@/zsphere-administration/management-node/management-node.service'

import { ServerLogService } from './server-log.service'

@Controller('api/server-log')
export class ServerLogController {
  // @Inject(CACHE_MANAGER) private cacheManager
  @Inject() private serverLogService: ServerLogService
  @Inject() private managementNodeService: ManagementNodeService
  private zstackUserHomePath

  constructor() {
    try {
      this.zstackUserHomePath = execSync('realpath ~zstack').toString().trim()
    } catch (error) {
      console.log(error)
    }
  }

  @Get('/zstack-ui-server/:filterString')
  @Header('content-type', 'text/plain')
  async getUiServerLog(@Param('filterString') filterString: string) {
    if (!filterString) {
      return 'filterString is required'
    }
    const logPath = process.env.LOGGING_PATH
      ? path.join(process.env.LOGGING_PATH, 'zstack-ui-server.log')
      : path.join(this.zstackUserHomePath, 'zstack-ui/logs/zstack-ui-server.log')
    try {
      if (fs.existsSync(logPath)) {
        const out = execSync(
          `cat "${logPath}" | grep "${filterString?.replace(/"/g, '\\"')}"`
        ).toString()
        return out
      } else {
        return `${logPath} not existed`
      }
    } catch (error) {
      return error.status === 1 ? 'No relevant logs found' : `error: ${error}`
    }
  }

  @Get('/nginx-access/:filterString')
  @Header('content-type', 'text/plain')
  async getUiNginxAccessLog(@Param('filterString') filterString: string) {
    if (!filterString) {
      return 'filterString is required'
    }
    const logPath = path.join(this.zstackUserHomePath, 'zstack-ui/logs/nginx-access.log')
    try {
      if (fs.existsSync(logPath)) {
        const out = execSync(
          `cat "${logPath}" | grep "${filterString?.replace(/"/g, '\\"')}"`
        ).toString()
        return out
      } else {
        return `${logPath} not existed`
      }
    } catch (error) {
      return error.status === 1 ? 'No relevant logs found' : `error: ${error}`
    }
  }

  @Get('/mn-log/:filterString')
  async getMnLog(@Param('filterString') filterString: string) {
    return this.execMnLog(filterString)
  }

  execMnLog(filterString: string, remoteIp?: string) {
    if (!filterString) {
      return 'filterString is required'
    }
    const logPath = path.join(this.zstackUserHomePath, 'apache-tomcat/logs/management-server.log')
    try {
      const _filterString = filterString?.replace(/"/g, '\\"')
      const out = execSync(
        `${remoteIp ? `sudo /bin/ssh root@${remoteIp} ` : ''}cat ${logPath} | grep ${_filterString}`
      ).toString()
      if (out.indexOf('[ID:') > -1) {
        const idString = out.substring(out.indexOf('[ID:') + 5)

        const commaIndex = idString.indexOf(',')

        const id = commaIndex !== -1 ? idString.substring(0, commaIndex) : idString
        return execSync(
          `${
            remoteIp ? `sudo /bin/ssh root@${remoteIp} ` : ''
          }cat ${logPath} | grep -e ${_filterString} -e ${id}`
        ).toString()
      } else {
        return out
      }
    } catch (error) {
      return error.status === 1 ? 'No relevant logs found' : `error: ${error}`
    }
  }

  @Get('/double-mn-log/:filterString')
  async getDoubleMnLog(@Param('filterString') filterString: string) {
    if (!filterString) {
      return 'filterString is required'
    }
    const mnInfo = await this.managementNodeService.queryNodeInfo()
    const result = await Promise.all(
      mnInfo.list.map(
        async (it, index) => await this.execMnLog(filterString, index === 0 ? undefined : it.ip)
      )
    )
    return mnInfo.list.map((it, index) => ({
      ip: it.ip,
      log: result[index],
      ownsVip: it.ownsVip
    }))
  }
}
