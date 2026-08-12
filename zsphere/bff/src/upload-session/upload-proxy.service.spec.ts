import { BadRequestException, HttpException } from '@nestjs/common'

import {
  UPLOAD_PROXY_ERROR,
  UploadProxyService,
  validateUploadChunkHeaders,
  validateUploadTargetUrl
} from './upload-proxy.service'

describe('UploadProxyService', () => {
  const createRequest = (headers: Record<string, string | undefined>) =>
    ({
      headers
    }) as any

  it('uses the session-bound uploadUrl before the frontend TRANSIT header', async () => {
    const uploadSessionService = {
      resolveUploadTarget: jest.fn().mockResolvedValue({
        longJobUuid: 'job-1',
        uploadType: 'image',
        uploadUrl: 'http://backup-storage.example/upload'
      })
    }
    const service = new UploadProxyService(uploadSessionService as any)

    const targetUrl = await service.resolveTargetUrl(
      createRequest({
        'x-session-id': 'session-1',
        'job-id': 'job-1',
        transit: 'http://attacker.example/upload'
      }),
      ['image']
    )

    expect(uploadSessionService.resolveUploadTarget).toHaveBeenCalledWith('session-1', 'job-1', {
      uploadTypes: ['image']
    })
    expect(targetUrl).toBe('http://backup-storage.example/upload')
  })

  it('keeps a strict TRANSIT fallback for legacy clients without a session binding', async () => {
    const uploadSessionService = {
      resolveUploadTarget: jest.fn().mockResolvedValue(null)
    }
    const service = new UploadProxyService(uploadSessionService as any)

    const targetUrl = await service.resolveTargetUrl(
      createRequest({
        'x-session-id': 'session-1',
        'job-id': 'job-1',
        transit: 'https://backup-storage.example/upload'
      }),
      ['image']
    )

    expect(targetUrl).toBe('https://backup-storage.example/upload')
  })
})

describe('upload proxy validation', () => {
  it('rejects loopback upload targets', () => {
    expect(() => validateUploadTargetUrl('http://127.0.0.1:8080/upload')).toThrow(
      BadRequestException
    )
  })

  it('rejects metadata service upload targets', () => {
    expect(() => validateUploadTargetUrl('http://169.254.169.254/latest/meta-data')).toThrow(
      BadRequestException
    )
  })

  it('rejects mismatched slice offset and Content-Range start', () => {
    expect(() =>
      validateUploadChunkHeaders({
        'content-range': 'bytes 1024-2047/4096',
        'x-slice-offset': '0',
        'x-slice-size': '1024',
        'x-image-size': '4096'
      })
    ).toThrow(BadRequestException)
  })

  it('returns a 413 validation error when the requested slice is too large', () => {
    try {
      validateUploadChunkHeaders(
        {
          'content-range': 'bytes 0-2047/4096',
          'x-slice-offset': '0',
          'x-slice-size': '2048',
          'x-image-size': '4096'
        },
        1024
      )
      throw new Error('expected validation to fail')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException)
      expect((error as HttpException).getStatus()).toBe(413)
      const response = (error as HttpException).getResponse()
      expect(response).toEqual(
        expect.objectContaining({
          statusCode: 413,
          code: 'UPLOAD_SLICE_TOO_LARGE',
          retryable: true,
          suggestedChunkSize: 1024
        })
      )
    }
  })

  it('standardizes backend timeout errors for retry-aware clients', () => {
    expect(UPLOAD_PROXY_ERROR.timeout()).toEqual({
      code: 'UPLOAD_BACKEND_TIMEOUT',
      retryable: true,
      retryAfterMs: 5000,
      suggestedChunkSize: expect.any(Number),
      message: 'Backend upload target timed out'
    })
  })
})
