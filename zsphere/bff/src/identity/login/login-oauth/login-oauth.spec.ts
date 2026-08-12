import { Identity } from '@/identity/model/login.model'

import { LoginOAuthService } from './login-oauth'

jest.mock('uuid', () => ({
  v4: () => 'test-uuid'
}))

jest.mock('@nestjs/sequelize', () => ({
  InjectModel: () => () => {}
}))

jest.mock('@/model/zs-session.model', () => ({
  ZsSession: class ZsSession {}
}))

jest.mock('@/api/zstack/base/query-base', () => ({
  Op: { eq: 'eq' }
}))

jest.mock('@/api/zstack/QueryAccountAction', () => ({
  QueryAccountAction: class QueryAccountAction {}
}))

jest.mock('@/api/zstack/ValidateSessionAction', () => ({
  ValidateSessionAction: class ValidateSessionAction {}
}))

jest.mock('@/common/trans/zs-http-service/zs-http-service.service', () => ({
  ZsHttpService: class ZsHttpService {}
}))

type ActionMock<T> = {
  call: jest.Mock<Promise<T>, unknown[]>
}

type SessionModelMock = {
  findOne: jest.Mock<Promise<unknown>, unknown[]>
  create: jest.Mock<Promise<unknown>, unknown[]>
}

interface LoginOAuthServiceMocks {
  validateSessionAction: ActionMock<{ valid?: boolean }>
  queryAccountAction: ActionMock<{ inventories?: Array<{ name?: string; type?: string }> }>
  zsSession: SessionModelMock
}

const createService = ({
  valid = true,
  accountResult = {
    inventories: [{ name: 'normal-account', type: 'Normal' }]
  },
  existingSession = null
}: {
  valid?: boolean
  accountResult?: { inventories?: Array<{ name?: string; type?: string }> } | Error
  existingSession?: unknown
} = {}) => {
  const service = new LoginOAuthService()
  const mocks: LoginOAuthServiceMocks = {
    validateSessionAction: {
      call: jest.fn().mockResolvedValue({ valid })
    },
    queryAccountAction: {
      call:
        accountResult instanceof Error
          ? jest.fn().mockRejectedValue(accountResult)
          : jest.fn().mockResolvedValue(accountResult)
    },
    zsSession: {
      findOne: jest.fn().mockResolvedValue(existingSession),
      create: jest.fn().mockResolvedValue(null)
    }
  }

  Object.assign(service as unknown as Record<string, unknown>, mocks)

  return { service, mocks }
}

const loginInput = {
  sessionId: 'session-1',
  userUuid: 'user-1',
  accountUuid: 'account-1',
  loginType: 'iam1'
}

describe('LoginOAuthService', () => {
  it('does not create a local session when the upstream session is invalid', async () => {
    const { service, mocks } = createService({ valid: false })

    await expect(service.action(loginInput)).resolves.toEqual({ isLogined: false })

    expect(mocks.queryAccountAction.call).not.toHaveBeenCalled()
    expect(mocks.zsSession.create).not.toHaveBeenCalled()
  })

  it('does not create a privileged local session when account lookup fails', async () => {
    const accountError = new Error('query account failed')
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    const { service, mocks } = createService({
      accountResult: accountError
    })

    await expect(service.action(loginInput)).resolves.toEqual({ isLogined: false })

    expect(mocks.zsSession.create).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledWith('Failed to query account during IAM1 OAuth login', {
      accountUuid: 'account-1',
      error: accountError
    })
    consoleError.mockRestore()
  })

  it('does not create a local session when account lookup returns no account', async () => {
    const { service, mocks } = createService({
      accountResult: { inventories: [] }
    })

    await expect(service.action(loginInput)).resolves.toEqual({ isLogined: false })

    expect(mocks.zsSession.create).not.toHaveBeenCalled()
  })

  it('does not create a local session when account lookup returns incomplete account fields', async () => {
    const { service, mocks } = createService({
      accountResult: { inventories: [{}] }
    })

    await expect(service.action(loginInput)).resolves.toEqual({ isLogined: false })

    expect(mocks.zsSession.create).not.toHaveBeenCalled()
  })

  it('creates a local session for a valid normal account', async () => {
    const { service, mocks } = createService()

    await expect(service.action(loginInput)).resolves.toEqual({
      isLogined: true,
      accountUuid: 'account-1',
      userUuid: 'account-1',
      sessionId: 'session-1',
      currentIdentity: Identity.NormalAccount
    })

    expect(mocks.zsSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'session-1',
        userId: 'account-1',
        accountId: 'account-1',
        identity: Identity.NormalAccount,
        type: 'Account'
      })
    )
  })
})
