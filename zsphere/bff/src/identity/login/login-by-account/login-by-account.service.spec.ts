import { Identity } from '@/identity/model/login.model'

import { LoginByAccountService } from './login-by-account.service'

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

jest.mock('@/api/zstack/LogInByAccountAction', () => ({
  LogInByAccountAction: class LogInByAccountAction {}
}))

jest.mock('@/api/zstack/QueryAccountAction', () => ({
  QueryAccountAction: class QueryAccountAction {}
}))

jest.mock('@/api/zstack/QueryCCSCertificateAction', () => ({
  QueryCCSCertificateAction: class QueryCCSCertificateAction {}
}))

jest.mock('@/common/trans/zs-http-service/zs-http-service.service', () => ({
  ZsHttpService: class ZsHttpService {}
}))

jest.mock('@/zstack-cloud-code/crypto-compliance/data-protection/data-protection.service', () => ({
  DataProtectionService: class DataProtectionService {}
}))

type SessionInventory = {
  uuid?: string
  accountUuid?: string
  userUuid?: string
}

const createService = (inventory: SessionInventory) => {
  const service = new LoginByAccountService()
  const mocks = {
    LoginByAccount: {
      call: jest.fn().mockResolvedValue({ inventory })
    },
    queryAccountAction: {
      call: jest.fn().mockResolvedValue({ inventories: [{ type: 'Normal' }] })
    },
    queryCCSCertificateAction: {
      call: jest.fn().mockResolvedValue({ inventories: [] })
    },
    zsSession: {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(null)
    },
    dataProtectionService: {
      checkDataProtectionStatus: jest.fn()
    }
  }

  Object.assign(service as unknown as Record<string, unknown>, mocks, {
    context: {
      req: {
        headers: { 'user-agent': 'Mozilla/5.0 Chrome/120.0' },
        ip: '127.0.0.1'
      }
    }
  })

  return { service, mocks }
}

describe('LoginByAccountService', () => {
  it('uses accountUuid when the backend no longer returns userUuid', async () => {
    const { service, mocks } = createService({
      uuid: 'session-1',
      accountUuid: 'account-1'
    })

    await expect(
      service.action({ accountName: 'normal-account', password: 'hashed-password' })
    ).resolves.toEqual({
      sessionId: 'session-1',
      accountUuid: 'account-1',
      userUuid: 'account-1',
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
    expect(mocks.dataProtectionService.checkDataProtectionStatus).toHaveBeenCalledWith('session-1')
  })

  it('uses accountUuid for the legacy certificate userUuid filter', async () => {
    const { service, mocks } = createService({
      uuid: 'session-1',
      accountUuid: 'account-1'
    })

    await service.action({
      accountName: 'normal-account',
      password: 'hashed-password',
      systemTags: ['ccs']
    })

    expect(mocks.queryCCSCertificateAction.call).toHaveBeenCalledWith(
      {
        conditions: [
          {
            key: 'userCertificateRefs.userUuid',
            value: 'account-1'
          }
        ]
      },
      { sessionId: 'session-1' }
    )
  })

  it('fails with the missing upstream identity field instead of writing an invalid session', async () => {
    const { service, mocks } = createService({ uuid: 'session-1' })

    await expect(
      service.action({ accountName: 'normal-account', password: 'hashed-password' })
    ).rejects.toThrow('Account login response is missing required session field(s): accountUuid')

    expect(mocks.queryAccountAction.call).not.toHaveBeenCalled()
    expect(mocks.zsSession.create).not.toHaveBeenCalled()
  })
})
