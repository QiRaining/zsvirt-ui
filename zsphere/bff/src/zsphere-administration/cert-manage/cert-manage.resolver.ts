import { execSync } from 'node:child_process'
import * as https from 'node:https'

import { HttpService } from '@nestjs/axios'
import { Inject } from '@nestjs/common'
import { Resolver, Mutation, Query, Args } from '@nestjs/graphql'
import { CONTEXT } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import { ApolloError } from 'apollo-server-errors'

import { ActionResult } from '@/common/model/action.model'
import { ZsSession } from '@/model/zs-session.model'
import { PrivilegeService } from '@/privilege/privilege.service'

import {
  CertInfo,
  CertUploadInfoInput,
  GenNewPemInput,
  CertResetInput,
  CurrentConfigure
} from './cert-manage.model'
import { CertManageService } from './cert-manage.service'

@Resolver(() => CertInfo)
export class CertResolver {
  @Inject() certManageService: CertManageService
  @Inject() private readonly httpService: HttpService
  @Inject(CONTEXT) private readonly context
  @InjectModel(ZsSession) private zsSession: typeof ZsSession
  @Inject() privilegeService: PrivilegeService

  async setPeer(request) {
    if (request.headers?.identity === 'master') {
      return
    }
    let peerIp = null
    let port = null
    const protocol = request.headers?.origin.indexOf('https') === 0 ? 'https' : 'http'
    try {
      peerIp = JSON.parse(execSync('sudo /usr/local/bin/zsha2 show-config').toString()).peerip
      port = execSync(`sudo zstack-ctl show_ui_config | grep server_port|awk '{print $3}'`)
        .toString()
        .replace('\n', '')
    } catch (_err) {
      // ignore
    }
    if (peerIp && port) {
      this.httpService
        .post(`${protocol}://${peerIp}:${port}${request.originalUrl}`, request.body, {
          headers: { ...request.headers, identity: 'master' },
          httpsAgent: new https.Agent({ rejectUnauthorized: false })
        })
        .toPromise()
        .catch(e => {
          throw e
        })
    }
  }

  @Mutation(() => ActionResult)
  async turnCert(@Args('input') input: CertUploadInfoInput) {
    this.setPeer(this.context.req)
    this.certManageService.setThirdPartCert(input)
    return { actionId: input.action.actionId }
  }

  @Mutation(() => ActionResult)
  async genNewCert(@Args('input') input: GenNewPemInput) {
    this.setPeer(this.context.req)
    this.certManageService.generateCert(input)
    return { actionId: input.action.actionId }
  }

  @Mutation(() => ActionResult)
  async reset(@Args('input') input: CertResetInput) {
    this.setPeer(this.context.req)
    this.certManageService.reset(input)
    return { actionId: input.action.actionId }
  }

  @Query(() => CertInfo)
  async queryCertInfo() {
    const sessionId = this.context.req.headers['x-session-id']
    const session = await this.zsSession.findOne({ where: { sessionId } })
    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }
    const hasPrivilege = await this.privilegeService.hasPrivilege()
    if (!hasPrivilege) {
      throw new ApolloError('无UI权限', 'FORBIDDEN', { statusCode: 403 })
    }
    return this.certManageService.getCertInfo()
  }

  @Query(() => String)
  getDefaultCertContent() {
    return this.certManageService.getDefaultCertContent()
  }

  @Query(() => CurrentConfigure)
  async queryCurrentCertPathConfigure() {
    return this.certManageService.getCertPath()
  }
}
