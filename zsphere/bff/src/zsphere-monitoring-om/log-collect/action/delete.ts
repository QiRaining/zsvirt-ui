import { exec } from 'child_process'

import { Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'

import { ZStackApiBase } from '@/api/zstack/base/zstack-api-base'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ZsLogCollect } from '@/model/zs-log-collect.model'
import { genUuid } from '@/utils'
import { execCommand } from '@/utils'

import { CreateLogCollectService } from './create'

@InputType()
class DeleteLogCollectPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteLogCollectInput {
  @Field(() => [DeleteLogCollectPayload])
  payload: DeleteLogCollectPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteLogCollectService extends ActionService {
  @InjectModel(ZsLogCollect) private zsLogCollect: typeof ZsLogCollect
  @Inject()
  zstackApiBase: ZStackApiBase
  @Inject() configService: ConfigService
  @Inject() createLogCollectService: CreateLogCollectService

  // 删除
  async deleteHelper(uuid: string) {
    try {
      const host = await this.createLogCollectService.getHostName()
      const log = await this.zsLogCollect.findOne({ where: { uuid } })
      const dirName = log.name.replace(/.tar.gz/, '')
      const ctlCmd = 'zstack-ctl configured_collect_log --clear-log'
      const clearFileCmd = `${ctlCmd} ${log.name}`
      const clearDirCmd = `${ctlCmd} ${dirName}`
      if (log.host === host) {
        exec(`sudo ${clearFileCmd}`)
        exec(`sudo ${clearDirCmd}`)
      } else {
        // VIP已切换，日志文件不在当前节点
        // 双节点免登，不用密码
        // 端口暂时默认22,可能会变
        let stdout = ''
        try {
          const { stdout: internalStdout } = await execCommand(
            `sudo /usr/local/bin/zsha2 show-config`
          )
          stdout = internalStdout
        } catch (e) {}
        const data = JSON.parse(stdout)
        console.log(`[Delete Log] [ZSHA2] [Config]: ${JSON.stringify(data)}`)
        const execUser = data.execUser
        const peerport = data.peerport || '22'
        const sshCmd = `sudo /bin/ssh -t ${execUser}@${log.host} -p ${peerport}`
        exec(`${sshCmd} ${clearFileCmd}`)
        exec(`${sshCmd} ${clearDirCmd}`)
      }
    } catch (err) {
      console.log(err)
    }
    try {
      await this.zsLogCollect.destroy({
        where: {
          uuid
        }
      })
    } catch (err) {
      throw err
    }
  }

  @Mutation(() => ActionResult)
  async deleteLogCollect(@Args('input') input: DeleteLogCollectInput) {
    const sessionId = this.getSessionId()
    const session = await this.getZsSession().findOne({
      where: {
        sessionId
      }
    })
    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }

    if (['Admin', 'PlatformAdmin'].indexOf(session.identity) === -1) {
      throw Error(`current api is admin only`)
    }

    const actionId = input.action.actionId

    const actionFn = async (payload: DeleteLogCollectPayload, taskId: string) => {
      const apiRecord = await this.zstackApiBase.recordStart(
        { uuid: genUuid() },
        { actionId, taskId, apiId: genUuid() },
        'DELETE_LOG_COLLECT'
      )

      const { uuid } = payload
      try {
        await this.deleteHelper(uuid)
        await this.zstackApiBase.recordSuccess({ success: true }, apiRecord)
      } catch (err) {
        console.log(err)
        await this.zstackApiBase.recordFailed({ success: false, msg: err }, apiRecord)
        throw err
      }

      return {
        id: uuid
      }
    }

    this.actionHelper(input, 'LogCollect', actionFn)
    return { actionId }
  }
}
