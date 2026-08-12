import { Inject, Injectable } from '@nestjs/common'

import { QueryLogServerAction } from '@/api/zstack/QueryLogServerAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'

import { LogServer, LogServerQueryResp } from './log-server.model'

const parseJson = (value: unknown) => {
  if (!value || typeof value !== 'string') {
    return {}
  }

  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

const getLogType = (category?: string, type?: string, logType?: string) => {
  if (category === 'PlatformOperationLog' || type === 'FluentBit') {
    return 'platform'
  }

  return logType === 'platform' || logType === 'management' ? logType : 'management'
}

@Injectable()
export class LogServerService extends ActionService {
  @Inject() queryLogServerAction: QueryLogServerAction

  async query(params: QueryAction): Promise<LogServerQueryResp> {
    const results = await this.queryLogServerAction.call(params)
    const list = (results?.inventories ?? []).map((item: LogServer, index: number) => {
      const label = parseJson(item.labelValue)
      const rawConfiguration = label.configuration ?? item.configuration
      const envelope = parseJson(rawConfiguration)
      const configuration = parseJson(envelope.configuration)
      const category = label.category ?? item.category
      const type = label.type ?? item.type
      const level = label.level ?? item.level

      return {
        ...item,
        id: item.id ?? index + 1,
        name: label.name ?? item.name,
        uuid: label.uuid ?? item.uuid,
        description: label.description ?? item.description,
        category,
        type,
        level,
        configuration: rawConfiguration,
        hostname: configuration.host ?? configuration.hostname ?? item.hostname,
        port: configuration.port ?? item.port,
        facility: configuration.facility ?? item.facility,
        logType: getLogType(category, type, envelope.logType)
      }
    })

    return {
      list,
      total: results?.total ?? 0
    }
  }
}
