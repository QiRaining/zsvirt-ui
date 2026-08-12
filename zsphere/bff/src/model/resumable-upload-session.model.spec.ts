import { genUuid } from '@/utils'

import {
  RESUMABLE_UPLOAD_SESSION_TABLE,
  ZsResumableUploadSession
} from './resumable-upload-session.model'

jest.mock('@/utils', () => ({
  genUuid: jest.fn(() => '1234567890abcdef1234567890abcdef')
}))

describe('ZsResumableUploadSession', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('maps to the resumable upload session table', () => {
    expect(RESUMABLE_UPLOAD_SESSION_TABLE).toBe('zs_resumable_upload_session')
  })

  it('fills id with a 32-character uuid before create', () => {
    const session = {} as ZsResumableUploadSession

    ZsResumableUploadSession.ensureId(session)

    expect(genUuid).toHaveBeenCalledTimes(1)
    expect(session.id).toBe('1234567890abcdef1234567890abcdef')
  })

  it('keeps an existing id when hydrating or updating rows', () => {
    const session = {} as ZsResumableUploadSession
    session.id = 'existing-upload-session-id'

    ZsResumableUploadSession.ensureId(session)

    expect(genUuid).not.toHaveBeenCalled()
    expect(session.id).toBe('existing-upload-session-id')
  })
})
