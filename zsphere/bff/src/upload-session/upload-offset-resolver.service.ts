import { Injectable } from '@nestjs/common'

import { GetUploadSoftwarePackageJobDetailsAction } from '@/api/zstack/GetUploadSoftwarePackageJobDetailsAction'
import { ZsHttpService } from '@/common/trans/zs-http-service/zs-http-service.service'

import type { UploadSessionDto, UploadSessionType } from './upload-session.service'

type UploadOffsetRemoteRecord = Record<string, unknown> & {
  existingJobDetails?: Array<Record<string, unknown>>
}

export interface UploadOffsetResolveResult {
  longJobUuid?: string
  offset: number
  uploadUrl?: string
  artifactUuid?: string
}

@Injectable()
export class UploadOffsetResolverService {
  constructor(
    private readonly zsHttpService: ZsHttpService,
    private readonly getUploadSoftwarePackageJobDetailsAction: GetUploadSoftwarePackageJobDetailsAction
  ) {}

  async resolve(
    session: Pick<UploadSessionDto, 'uploadType' | 'hash' | 'longJobUuid'>
  ): Promise<UploadOffsetResolveResult> {
    const response = await this.fetchRemoteUploadDetails(session)
    const details = this.flattenUploadDetails(response)

    return {
      longJobUuid: this.toStringValue(details.longJobUuid) ?? session.longJobUuid,
      offset: this.normalizeOffset(details.offset),
      uploadUrl: this.toStringValue(details[this.getUploadUrlKey(session.uploadType)]),
      artifactUuid: this.toStringValue(details[this.getArtifactUuidKey(session.uploadType)])
    }
  }

  private async fetchRemoteUploadDetails(
    session: Pick<UploadSessionDto, 'uploadType' | 'hash'>
  ): Promise<UploadOffsetRemoteRecord> {
    if (session.uploadType === 'image') {
      const response = await this.zsHttpService.get(`/images/upload-job/details/${session.hash}`)
      return this.asRecord(response?.data)
    }

    const response = await this.getUploadSoftwarePackageJobDetailsAction.call({
      softwarePackageId: session.hash
    })
    return this.asRecord(response)
  }

  private flattenUploadDetails(response: UploadOffsetRemoteRecord): UploadOffsetRemoteRecord {
    const firstExistingJob = this.asRecord(response.existingJobDetails?.[0])
    return {
      ...response,
      ...firstExistingJob
    }
  }

  private getUploadUrlKey(uploadType: UploadSessionType): string {
    return uploadType === 'image' ? 'imageUploadUrl' : 'softwarePackageUploadUrl'
  }

  private getArtifactUuidKey(uploadType: UploadSessionType): string {
    return uploadType === 'image' ? 'imageUuid' : 'softwarePackageUuid'
  }

  private normalizeOffset(value: unknown): number {
    const offset = Number(value)
    if (!Number.isFinite(offset) || offset < 0) {
      return 0
    }
    return offset
  }

  private toStringValue(value: unknown): string | undefined {
    return typeof value === 'string' && value ? value : undefined
  }

  private asRecord(value: unknown): UploadOffsetRemoteRecord {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as UploadOffsetRemoteRecord
    }
    return {}
  }
}
