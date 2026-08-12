import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL, { ZOp } from '@/common/zql/index'

import { GuestToolsState } from '../vm-instance.model'

interface Param {
  [key: string]: {
    hostUuid: string
    guestOsType: string
    platform: string
  }
}

@Injectable()
export class ToolsDataloader {
  @Inject() zqlService: ZQLService
  private ToolsDataloader
  private params: Param = {}

  constructor() {
    this.ToolsDataloader = new DataLoader(this._query)
  }

  query(uuid, params: Param[any]) {
    this.params[uuid] = params
    return this.ToolsDataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const tagResp = await this.zqlService.call(
      ZQL.stringify({
        tableName: 'SystemTag',
        condition: {
          resourceUuid: {
            [ZOp.in]: Object.values(this.params).map(item => item.hostUuid)
          },
          resourceType: 'HostVO',
          tag: {
            [ZOp.like]: 'hostCpuModelName::'
          }
        }
      })
    )
    const tagList = tagResp?.results?.[0]?.inventories

    const toolResp = await this.zqlService.call(
      ZQL.stringify({
        tableName: 'GuestToolsState',
        condition: {
          vmInstanceUuid: {
            [ZOp.in]: uuids
          }
        }
      })
    )
    const toolList = toolResp?.results?.[0]?.inventories

    return uuids.map(uuid => {
      let toolsState = GuestToolsState.Unsupport
      const { hostUuid, guestOsType, platform } = this.params[uuid]
      const tag = tagList.find(_tag => _tag.resourceUuid === hostUuid)
      if (
        tag &&
        tag.tag?.indexOf('aarch64') < 0 &&
        (['Windows', 'WindowsVirtio', 'Linux'].includes(platform) || guestOsType === 'FreeBSD')
      ) {
        toolsState = GuestToolsState.Uninstall
        const tool = toolList.find(_tool => _tool.vmInstanceUuid === uuid)
        if (
          ['NotRunning', 'Running', 'NotUpgraded'].includes(tool?.qgaState) ||
          ['Running', 'NotRunning'].includes(tool?.zwatchState)
        ) {
          toolsState = GuestToolsState.Installed
        }
      }
      return toolsState
    })
  }
}
