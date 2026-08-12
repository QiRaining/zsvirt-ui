import { Controller, Post, Get, Req, Res, Param, Inject } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { FastifyRequest, FastifyReply } from 'fastify'

import { ResumeLongJobAction } from '@/api/zstack/ResumeLongJobAction'
import { Logger } from '@/common/logger/logger.decorator'
import { ZSLoggerService } from '@/common/logger/logger.service'
import { ZsLongJob } from '@/model/zs-long-job.model'
import { UploadProxyService } from '@/upload-session/upload-proxy.service'

import { ZsHttpService } from '../../../common/trans/zs-http-service/zs-http-service.service'

@Injectable()
@Controller('api')
export class ImageUploadController {
  @InjectModel(ZsLongJob) protected zsLongJob: typeof ZsLongJob
  @Inject() private readonly zsHttpService: ZsHttpService
  @Inject() private readonly resumeLongJobAction: ResumeLongJobAction
  @Inject() private readonly uploadProxyService: UploadProxyService
  @Logger(ImageUploadController.name) logger: ZSLoggerService

  @Post('imageupload')
  async transition(@Req() request: FastifyRequest, @Res() response: FastifyReply) {
    return this.uploadProxyService.proxyUpload({
      request,
      response,
      uploadTypes: ['image'],
      fileSizeHeaderName: 'x-image-size',
      forwardHeaderNames: [
        'content-md5',
        'x-image-size',
        'x-slice-hash',
        'x-hash-algorithm',
        'x-slice-offset',
        'x-slice-size',
        'x-image-uuid',
        'content-length',
        'content-range',
        'content-type',
        'x-slice-index'
      ]
    })
  }

  @Get('uploadhashcheck/:hash')
  async fileUploadCheck(@Param() params) {
    let offset = null

    if (params.hash.indexOf('offset') !== -1) {
      offset = 1024
    }

    const resp = await this.zsHttpService.get(`/images/upload-job/details/${params.hash}`)
    const r = Object.assign({}, resp.data, resp.data?.existingJobDetails?.[0])
    return r
  }

  @Get('resumelongjob/:uuid')
  async resumeLongjob(@Param() params) {
    return this.resumeLongJobAction.call({ uuid: params.uuid })
  }
}
