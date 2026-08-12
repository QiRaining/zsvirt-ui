import * as crypto from 'crypto'

import { HttpService } from '@nestjs/axios'
import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, ObjectType } from '@nestjs/graphql'
import * as _ from 'lodash'

import { SNSSnmpTestConnectionAction } from '@/api/zstack/SNSSnmpTestConnectionAction'
import { ActionService } from '@/base/action-service'
import { EndPointType } from '@/common/enum'

// https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot#c1491056
function genFeiShuSign(timestamp: number, secret: string): string {
  // 拼接时间戳和密钥
  const stringToSign = `${timestamp}\n${secret}`
  const hmacCode = crypto.createHmac('sha256', stringToSign).digest()

  // 对结果进行 base64 处理
  const sign = hmacCode.toString('base64')

  return sign
}

// https://open.dingtalk.com/document/robots/customize-robot-security-settings
function genDingTalkSign(timestamp: number, secret: string): string {
  const stringToSign = `${timestamp}\n${secret}`
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(stringToSign)

  const signData = hmac.digest()
  const sign = encodeURIComponent(Buffer.from(signData).toString('base64'))

  return sign
}

@InputType()
export class TestConnectSNSEndPointInput {
  @Field(() => EndPointType!, { description: '具体的 endpoint 类型' })
  endpointType: EndPointType

  @Field(() => String, { description: '地址', nullable: true })
  url?: string

  @Field(() => Boolean, { nullable: true, description: '是否指定所有人' })
  atAll?: boolean

  @Field(() => [String], { nullable: true, description: '指定用户的id' })
  atPersonUserIds?: string[]

  @Field(() => String, {
    nullable: true,
    description: '密钥, 填空字符串表示 安全设置为：无'
  })
  secret?: string

  @Field(() => String!, {
    description: '发送的测试消息',
    defaultValue: 'hello'
  })
  testMsg: string

  @Field(() => String, {
    nullable: true,
    description: '当前通知对象的 uuid'
  })
  endpointUuid?: string
}

@ObjectType()
export class TestConnectSNSEndPointOutput {
  @Field(() => Boolean)
  success: boolean

  @Field(() => String, { nullable: true })
  error?: string
}

export class TestConnectSNSEndPointService extends ActionService {
  @Inject() private readonly httpService: HttpService
  @Inject()
  private readonly snsSnmpTestConnectionAction: SNSSnmpTestConnectionAction
  @Mutation(() => TestConnectSNSEndPointOutput)
  async testConnectSNSEndPoint(@Args('input') testConnectionInput: TestConnectSNSEndPointInput) {
    let timeout
    const res = await Promise.race([
      this._testConnect(testConnectionInput),
      new Promise(resolve => {
        timeout = setTimeout(() => {
          resolve({ success: false, error: 'timeout' })
        }, 15000)
      })
    ])

    clearTimeout(timeout)

    return res
  }

  _testConnect = async (testConnectionInput: TestConnectSNSEndPointInput) => {
    let data: TestConnectSNSEndPointOutput = {
      success: false
    }
    const { endpointType, ...params } = testConnectionInput

    try {
      switch (endpointType) {
        case EndPointType.MicrosoftTeams:
          data = await this.sendMsgToMTeams(_.pick(params, ['url', 'testMsg']))
          break
        case EndPointType.DingTalk:
          data = await this.sendMsgToDingTalk(_.pick(params, ['url', 'testMsg', 'secret']))
          break
        case EndPointType.WeCom:
          data = await this.sendMsgToWeCom(_.pick(params, ['url', 'testMsg']))
          break
        case EndPointType.FeiShu:
          data = await this.sendMsgToFeiShu(_.pick(params, ['url', 'testMsg', 'secret']))
          break
        case EndPointType.SNMP:
          data = await this.sendMsgToSnmp(_.pick(params, ['endpointUuid']))
          break
        default:
      }

      return { success: data.success }
    } catch (error) {
      return { success: false, error }
    }
  }

  async sendMsgToFeiShu(params: Pick<TestConnectSNSEndPointInput, 'testMsg' | 'secret' | 'url'>) {
    const seconds = Math.floor(Date.now() / 1000)
    const data: { [key: string]: any } = {
      msg_type: 'text',
      content: { text: params.testMsg }
    }

    if (params.secret) {
      data.timestamp = seconds
      data.sign = genFeiShuSign(seconds, params.secret)
    }

    const resp = await this.httpService.post(params.url, data).toPromise()

    if (resp.data.msg === 'success') {
      return {
        success: true
      }
    }

    return {
      success: false,
      error: resp.data.msg
    }
  }

  async sendMsgToDingTalk(params: Pick<TestConnectSNSEndPointInput, 'testMsg' | 'secret' | 'url'>) {
    const milleseconds = Date.now()
    const data: { [key: string]: any } = {
      msgtype: 'text',
      text: { content: params.testMsg }
    }
    const _params: { [key: string]: any } = {}

    if (params.secret) {
      _params.timestamp = milleseconds
      _params.sign = genDingTalkSign(milleseconds, params.secret)
    }

    const resp = await this.httpService.post(params.url, data, { params: _params }).toPromise()

    if (resp.data.errmsg === 'ok') {
      return {
        success: true
      }
    }

    return {
      success: false,
      error: resp.data.errmsg
    }
  }

  async sendMsgToWeCom(params: Pick<TestConnectSNSEndPointInput, 'testMsg' | 'url'>) {
    const data = {
      msgtype: 'text',
      text: { content: params.testMsg }
    }

    const resp = await this.httpService.post(params.url, data).toPromise()

    if (resp.data.errmsg === 'ok') {
      return {
        success: true
      }
    }

    return {
      success: false,
      error: resp.data.errmsg
    }
  }

  async sendMsgToMTeams(params: Pick<TestConnectSNSEndPointInput, 'testMsg' | 'url'>) {
    const data = {
      text: params.testMsg
    }

    const resp = await this.httpService.post(params.url, data).toPromise()

    if (resp.data === 1) {
      return {
        success: true
      }
    }

    return {
      success: false,
      error: resp.data
    }
  }

  async sendMsgToSnmp(params: Pick<TestConnectSNSEndPointInput, 'endpointUuid'>) {
    const resp = await this.snsSnmpTestConnectionAction.call(params)

    return {
      success: resp.connected
    }
  }
}
