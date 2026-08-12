import { Controller, Post, Get, Req, Res, Param } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { FastifyRequest, FastifyReply } from 'fastify'

import { BaseUploadPackageController } from '@/common/upload-package/base-upload-package.controller'

@Injectable()
@Controller('api')
export class UploadMigrationServicePackageController extends BaseUploadPackageController {
  @Post('uploadMigrationServicePackage')
  async transition(@Req() request: FastifyRequest, @Res() response: FastifyReply) {
    return super.transition(request, response)
  }

  @Get('uploadMigrationServicePackagehashcheck/:hash')
  async fileUploadCheck(@Param() params) {
    return super.fileUploadCheck(params)
  }
}
