import { IncomingMessage } from 'http'
import * as http from 'http'
import * as https from 'https'
import { isIP } from 'net'
import { pipeline } from 'stream'

import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Optional
} from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'

import type { UploadSessionType } from './upload-session.service'
import { UploadSessionService } from './upload-session.service'

type HeaderValue = string | string[] | number | undefined
type HeaderRecord = Record<string, HeaderValue>

export interface UploadProxyErrorBody {
  code: string
  retryable: boolean
  message: string
  retryAfterMs?: number
  suggestedChunkSize?: number
}

export interface UploadProxyRequestOptions {
  request: FastifyRequest
  response: FastifyReply
  uploadTypes: UploadSessionType[]
  forwardHeaderNames: string[]
  fileSizeHeaderName: string
}

export interface ResolveUploadProxyTargetOptions {
  uploadTypes: UploadSessionType[]
}

const DEFAULT_BACKEND_TIMEOUT_MS = 300000
const DEFAULT_RETRY_AFTER_MS = 5000
const DEFAULT_SUGGESTED_CHUNK_SIZE = 16 * 1024 * 1024
const DEFAULT_MAX_SLICE_SIZE = 256 * 1024 * 1024
const METADATA_SERVICE_HOST = '169.254.169.254'

export const UPLOAD_PROXY_ERROR = {
  timeout: (): UploadProxyErrorBody => ({
    code: 'UPLOAD_BACKEND_TIMEOUT',
    retryable: true,
    retryAfterMs: DEFAULT_RETRY_AFTER_MS,
    suggestedChunkSize: DEFAULT_SUGGESTED_CHUNK_SIZE,
    message: 'Backend upload target timed out'
  }),
  backendUnavailable: (message: string): UploadProxyErrorBody => ({
    code: 'UPLOAD_BACKEND_UNAVAILABLE',
    retryable: true,
    retryAfterMs: DEFAULT_RETRY_AFTER_MS,
    suggestedChunkSize: DEFAULT_SUGGESTED_CHUNK_SIZE,
    message
  }),
  forwardFailed: (message: string): UploadProxyErrorBody => ({
    code: 'UPLOAD_PROXY_STREAM_ERROR',
    retryable: true,
    retryAfterMs: DEFAULT_RETRY_AFTER_MS,
    suggestedChunkSize: DEFAULT_SUGGESTED_CHUNK_SIZE,
    message
  })
}

export const validateUploadTargetUrl = (targetUrl: string): string => {
  if (!targetUrl || targetUrl.trim() === '') {
    throw createUploadProxyException(
      HttpStatus.BAD_REQUEST,
      'UPLOAD_TARGET_REQUIRED',
      false,
      'Upload target is required'
    )
  }

  let parsed: URL
  try {
    parsed = new URL(targetUrl)
  } catch {
    throw createUploadProxyException(
      HttpStatus.BAD_REQUEST,
      'UPLOAD_TARGET_INVALID',
      false,
      'Upload target URL is invalid'
    )
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw createUploadProxyException(
      HttpStatus.BAD_REQUEST,
      'UPLOAD_TARGET_PROTOCOL_NOT_ALLOWED',
      false,
      'Upload target protocol is not allowed'
    )
  }

  const hostname = normalizeHostname(parsed.hostname)
  if (!hostname) {
    throw createUploadProxyException(
      HttpStatus.BAD_REQUEST,
      'UPLOAD_TARGET_HOST_REQUIRED',
      false,
      'Upload target host is required'
    )
  }

  if (!isAllowedByConfiguredAllowlist(hostname)) {
    throw createUploadProxyException(
      HttpStatus.BAD_REQUEST,
      'UPLOAD_TARGET_HOST_NOT_ALLOWED',
      false,
      'Upload target host is not allowed'
    )
  }

  if (isBlockedSsrffHost(hostname)) {
    throw createUploadProxyException(
      HttpStatus.BAD_REQUEST,
      'UPLOAD_TARGET_HOST_BLOCKED',
      false,
      'Upload target host is blocked'
    )
  }

  return parsed.toString()
}

export const validateUploadChunkHeaders = (
  headers: HeaderRecord,
  maxSliceSize = getMaxSliceSize()
): void => {
  const contentRange = getHeader(headers, 'content-range')
  const sliceOffset = parseNonNegativeInteger(getHeader(headers, 'x-slice-offset'))
  const sliceSize = parsePositiveInteger(getHeader(headers, 'x-slice-size'))

  if (!contentRange) {
    throw createUploadProxyException(
      HttpStatus.BAD_REQUEST,
      'UPLOAD_CONTENT_RANGE_REQUIRED',
      false,
      'Content-Range header is required'
    )
  }

  if (sliceOffset === undefined) {
    throw createUploadProxyException(
      HttpStatus.BAD_REQUEST,
      'UPLOAD_SLICE_OFFSET_INVALID',
      false,
      'X-SLICE-OFFSET header is invalid'
    )
  }

  if (sliceSize === undefined) {
    throw createUploadProxyException(
      HttpStatus.BAD_REQUEST,
      'UPLOAD_SLICE_SIZE_INVALID',
      false,
      'X-SLICE-SIZE header is invalid'
    )
  }

  const range = parseContentRange(contentRange)
  if (!range) {
    throw createUploadProxyException(
      HttpStatus.BAD_REQUEST,
      'UPLOAD_CONTENT_RANGE_INVALID',
      false,
      'Content-Range header is invalid'
    )
  }

  if (range.start !== sliceOffset) {
    throw createUploadProxyException(
      HttpStatus.BAD_REQUEST,
      'UPLOAD_SLICE_OFFSET_MISMATCH',
      false,
      'X-SLICE-OFFSET must match Content-Range start'
    )
  }

  const rangeSliceSize = range.end - range.start + 1
  if (rangeSliceSize !== sliceSize) {
    throw createUploadProxyException(
      HttpStatus.BAD_REQUEST,
      'UPLOAD_SLICE_SIZE_MISMATCH',
      false,
      'X-SLICE-SIZE must match Content-Range length'
    )
  }

  if (sliceSize > maxSliceSize) {
    throw createUploadProxyException(
      HttpStatus.PAYLOAD_TOO_LARGE,
      'UPLOAD_SLICE_TOO_LARGE',
      true,
      'Upload slice is too large',
      {
        suggestedChunkSize: maxSliceSize
      }
    )
  }

  if (range.start >= range.total) {
    throw createUploadProxyException(
      HttpStatus.BAD_REQUEST,
      'UPLOAD_SLICE_OFFSET_OUT_OF_RANGE',
      false,
      'X-SLICE-OFFSET must be smaller than file size'
    )
  }

  const fileSize =
    parsePositiveInteger(getHeader(headers, 'x-image-size')) ??
    parsePositiveInteger(getHeader(headers, 'x-file-size'))
  if (fileSize !== undefined && fileSize !== range.total) {
    throw createUploadProxyException(
      HttpStatus.BAD_REQUEST,
      'UPLOAD_FILE_SIZE_MISMATCH',
      false,
      'File size header must match Content-Range total'
    )
  }
}

@Injectable()
export class UploadProxyService {
  constructor(
    @Optional()
    @Inject(UploadSessionService)
    private readonly uploadSessionService?: UploadSessionService
  ) {}

  async proxyUpload(options: UploadProxyRequestOptions): Promise<void> {
    const { request, response, uploadTypes, forwardHeaderNames } = options
    let targetUrl: string

    try {
      validateUploadChunkHeaders(request.headers as HeaderRecord)
      targetUrl = await this.resolveTargetUrl(request, uploadTypes)
    } catch (error) {
      this.sendException(response, error)
      return
    }

    const headers = pickUploadHeaders(request.headers as HeaderRecord, forwardHeaderNames)
    headers.Expect = '100-continue'

    let responseSent = false
    let terminalErrorSent = false
    const requestModule = targetUrl.startsWith('https:') ? https : http
    const backend = requestModule.request(
      targetUrl,
      {
        method: 'POST',
        headers,
        timeout: DEFAULT_BACKEND_TIMEOUT_MS
      },
      (backendResponse: IncomingMessage) => {
        response.raw.writeHead(
          backendResponse.statusCode ?? HttpStatus.BAD_GATEWAY,
          backendResponse.headers
        )
        responseSent = true

        backendResponse.on('error', () => {
          if (!response.raw.writableEnded) {
            response.raw.end()
          }
        })
        backendResponse.pipe(response.raw)
      }
    )

    backend.on('timeout', () => {
      if (terminalErrorSent || responseSent || response.raw.writableEnded) {
        backend.destroy()
        return
      }
      terminalErrorSent = true
      this.sendErrorBody(response, HttpStatus.GATEWAY_TIMEOUT, UPLOAD_PROXY_ERROR.timeout())
      backend.destroy()
    })

    backend.on('error', error => {
      if (terminalErrorSent || responseSent || response.raw.writableEnded) {
        return
      }
      terminalErrorSent = true
      this.sendErrorBody(
        response,
        HttpStatus.BAD_GATEWAY,
        UPLOAD_PROXY_ERROR.backendUnavailable(error.message)
      )
    })

    pipeline(request.raw, backend, error => {
      if (!error || terminalErrorSent || responseSent || response.raw.writableEnded) {
        return
      }
      terminalErrorSent = true
      backend.destroy()
      this.sendErrorBody(
        response,
        HttpStatus.INTERNAL_SERVER_ERROR,
        UPLOAD_PROXY_ERROR.forwardFailed(error.message)
      )
    })
  }

  async resolveTargetUrl(
    request: Pick<FastifyRequest, 'headers'>,
    uploadTypes: UploadSessionType[]
  ): Promise<string> {
    const sessionId = getHeader(request.headers as HeaderRecord, 'x-session-id')
    const longJobUuid = getHeader(request.headers as HeaderRecord, 'job-id')

    if (sessionId && longJobUuid && this.uploadSessionService) {
      const target = await this.uploadSessionService.resolveUploadTarget(sessionId, longJobUuid, {
        uploadTypes
      })
      if (target?.uploadUrl) {
        return validateUploadTargetUrl(target.uploadUrl)
      }
    }

    return validateUploadTargetUrl(getHeader(request.headers as HeaderRecord, 'transit') ?? '')
  }

  private sendException(response: FastifyReply, error: unknown): void {
    if (error instanceof HttpException) {
      const errorResponse = error.getResponse()
      response.status(error.getStatus()).send(errorResponse)
      return
    }

    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .send(
        UPLOAD_PROXY_ERROR.forwardFailed(
          error instanceof Error ? error.message : 'Failed to prepare upload proxy request'
        )
      )
  }

  private sendErrorBody(
    response: FastifyReply,
    statusCode: HttpStatus,
    body: UploadProxyErrorBody
  ): void {
    response.status(statusCode).send(body)
  }
}

const pickUploadHeaders = (headers: HeaderRecord, names: string[]): Record<string, HeaderValue> => {
  const selected: Record<string, HeaderValue> = {}
  names.forEach(name => {
    const value = getHeaderValue(headers, name)
    if (value !== undefined) {
      selected[name] = value
    }
  })
  return selected
}

const parseContentRange = (
  contentRange: string
): { start: number; end: number; total: number } | null => {
  const match = /^bytes\s+(\d+)-(\d+)\/(\d+)$/.exec(contentRange.trim())
  if (!match) {
    return null
  }

  const start = Number(match[1])
  const end = Number(match[2])
  const total = Number(match[3])
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    !Number.isSafeInteger(total) ||
    start < 0 ||
    end < start ||
    total <= 0 ||
    end >= total
  ) {
    return null
  }

  return { start, end, total }
}

const parseNonNegativeInteger = (value?: string): number | undefined => {
  if (value === undefined || !/^\d+$/.test(value)) {
    return undefined
  }
  const numberValue = Number(value)
  return Number.isSafeInteger(numberValue) ? numberValue : undefined
}

const parsePositiveInteger = (value?: string): number | undefined => {
  const numberValue = parseNonNegativeInteger(value)
  return numberValue !== undefined && numberValue > 0 ? numberValue : undefined
}

const getHeader = (headers: HeaderRecord, name: string): string | undefined => {
  const value = getHeaderValue(headers, name)
  if (Array.isArray(value)) {
    return value[0]
  }
  if (typeof value === 'number') {
    return String(value)
  }
  return value
}

const getHeaderValue = (headers: HeaderRecord, name: string): HeaderValue => {
  const lowerName = name.toLowerCase()
  return headers[lowerName] ?? headers[name]
}

const getMaxSliceSize = (): number => {
  const configured = Number(process.env.ZSV_UPLOAD_PROXY_MAX_SLICE_SIZE)
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_MAX_SLICE_SIZE
}

const normalizeHostname = (hostname: string): string =>
  hostname.replace(/^\[|\]$/g, '').toLowerCase()

const isAllowedByConfiguredAllowlist = (hostname: string): boolean => {
  const patterns = (
    process.env.ZSV_UPLOAD_TARGET_ALLOWLIST ??
    process.env.UPLOAD_TARGET_ALLOWLIST ??
    ''
  )
    .split(',')
    .map(pattern => pattern.trim().toLowerCase())
    .filter(Boolean)

  if (!patterns.length) {
    return true
  }

  return patterns.some(pattern => {
    if (pattern.startsWith('*.')) {
      return hostname.endsWith(pattern.slice(1))
    }
    if (pattern.startsWith('.')) {
      return hostname.endsWith(pattern)
    }
    return hostname === pattern
  })
}

const isBlockedSsrffHost = (hostname: string): boolean => {
  if (['localhost', '0.0.0.0', '::', '::1'].includes(hostname)) {
    return true
  }

  if (hostname === METADATA_SERVICE_HOST) {
    return true
  }

  if (isIP(hostname) === 4) {
    return hostname.startsWith('127.') || hostname.startsWith('169.254.')
  }

  return false
}

const createUploadProxyException = (
  statusCode: HttpStatus,
  code: string,
  retryable: boolean,
  message: string,
  extra?: Pick<UploadProxyErrorBody, 'retryAfterMs' | 'suggestedChunkSize'>
): HttpException => {
  const body: UploadProxyErrorBody & { statusCode: number } = {
    statusCode,
    code,
    retryable,
    message,
    ...extra
  }

  if (statusCode === HttpStatus.BAD_REQUEST) {
    return new BadRequestException(body)
  }

  return new HttpException(body, statusCode)
}
