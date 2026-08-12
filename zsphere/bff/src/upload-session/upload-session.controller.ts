import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post
} from '@nestjs/common'

import {
  RegisterUploadSessionPayload,
  UpdateUploadFileAvailabilityPayload,
  UpdateUploadSessionPayload,
  UploadSessionService
} from './upload-session.service'

@Controller('api/upload-sessions')
export class UploadSessionController {
  constructor(private readonly uploadSessionService: UploadSessionService) {}

  @Post()
  register(
    @Headers('x-session-id') sessionId: string,
    @Body() payload: RegisterUploadSessionPayload
  ) {
    return this.uploadSessionService.register(sessionId, payload)
  }

  @Get('resumable')
  listResumable(@Headers('x-session-id') sessionId: string) {
    return this.uploadSessionService.listResumable(sessionId)
  }

  @Get(':longJobUuid/offset')
  async resolveOffset(
    @Headers('x-session-id') sessionId: string,
    @Param('longJobUuid') longJobUuid: string
  ) {
    const session = await this.uploadSessionService.resolveOffset(sessionId, longJobUuid)
    if (!session) {
      throw new NotFoundException('Upload session not found')
    }
    return session
  }

  @Patch(':longJobUuid')
  async update(
    @Headers('x-session-id') sessionId: string,
    @Param('longJobUuid') longJobUuid: string,
    @Body() payload: UpdateUploadSessionPayload
  ) {
    const session = await this.uploadSessionService.update(sessionId, longJobUuid, payload)
    if (!session) {
      throw new NotFoundException('Upload session not found')
    }
    return session
  }

  @Patch(':longJobUuid/file-availability')
  async updateFileAvailability(
    @Headers('x-session-id') sessionId: string,
    @Param('longJobUuid') longJobUuid: string,
    @Body() payload: UpdateUploadFileAvailabilityPayload
  ) {
    const session = await this.uploadSessionService.updateFileAvailability(
      sessionId,
      longJobUuid,
      payload
    )
    if (!session) {
      throw new NotFoundException('Upload session not found')
    }
    return session
  }
}
