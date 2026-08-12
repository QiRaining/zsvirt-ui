import { Post, Get, Req, Res, Param, Inject } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { FastifyRequest, FastifyReply } from 'fastify'

import { GetUploadSoftwarePackageJobDetailsAction } from '@/api/zstack/GetUploadSoftwarePackageJobDetailsAction'
import { Logger } from '@/common/logger/logger.decorator'
import { ZSLoggerService } from '@/common/logger/logger.service'
import { ZsLongJob } from '@/model/zs-long-job.model'
import { UploadProxyService } from '@/upload-session/upload-proxy.service'

/**
 * Base class for upload package controllers.
 * Subclasses should:
 * 1. Add @Controller('api') decorator
 * 2. Override `uploadRoute` and `hashCheckRoute` getters
 * 3. Apply @Post() and @Get() decorators on the overridden methods
 *
 * Because NestJS requires decorators on the concrete class methods,
 * subclasses must re-declare the route methods with appropriate decorators
 * and call super.transition() / super.fileUploadCheck().
 */
@Injectable()
export class BaseUploadPackageController {
  @InjectModel(ZsLongJob) protected zsLongJob: typeof ZsLongJob
  @Inject()
  protected readonly getUploadSoftwarePackageJobDetailsAction: GetUploadSoftwarePackageJobDetailsAction
  @Inject()
  protected readonly uploadProxyService: UploadProxyService
  @Logger('BaseUploadPackageController') logger: ZSLoggerService

  async transition(request: FastifyRequest, response: FastifyReply) {
    return this.uploadProxyService.proxyUpload({
      request,
      response,
      uploadTypes: ['storagePackage', 'migrationServicePackage'],
      fileSizeHeaderName: 'x-file-size',
      forwardHeaderNames: [
        'content-md5',
        'x-file-size',
        'x-slice-hash',
        'x-hash-algorithm',
        'x-slice-offset',
        'x-slice-size',
        'x-file-uuid',
        'content-length',
        'content-range',
        'content-type',
        'x-slice-index'
      ]
    })
  }

  async fileUploadCheck(params) {
    let offset = null
    if (params.hash.indexOf('offset') !== -1) {
      offset = 1024
    }
    const resp = await this.getUploadSoftwarePackageJobDetailsAction.call({
      softwarePackageId: params?.hash
    })
    const r = Object.assign({}, resp, resp?.existingJobDetails?.[0])
    return r
  }
}
