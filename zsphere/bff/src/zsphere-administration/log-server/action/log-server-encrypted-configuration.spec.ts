import { AddLogServerActionParam } from '@/api/zstack/AddLogServerAction'
import { Encrypt } from '@/utils/aesCipher'

import { decryptLogServerConfigurationPayload } from './log-server-encrypted-configuration'

const buildPayload = (targetConfig: Record<string, unknown>): AddLogServerActionParam => ({
  name: 'elasticsearch',
  category: 'PlatformOperationLog',
  type: 'FluentBit',
  level: 'WARN',
  configuration: JSON.stringify({
    type: 'Elasticsearch',
    configuration: JSON.stringify(targetConfig)
  })
})

const getTargetConfig = (payload: AddLogServerActionParam): Record<string, unknown> => {
  const envelope = JSON.parse(payload.configuration) as { configuration: string }
  return JSON.parse(envelope.configuration) as Record<string, unknown>
}

describe('log server encrypted configuration', () => {
  it('decrypts Cloud FluentBit httpPassword before calling the log server API', () => {
    const payload = buildPayload({
      host: '127.0.0.1',
      port: '9200',
      index: 'admin_test',
      tls: 'on',
      httpUser: 'admin_test',
      httpPassword: Encrypt('admin123')
    })

    const result = decryptLogServerConfigurationPayload(payload)
    const targetConfig = getTargetConfig(result)

    expect(targetConfig).toMatchObject({
      host: '127.0.0.1',
      port: '9200',
      index: 'admin_test',
      tls: 'on',
      httpUser: 'admin_test',
      httpPassword: 'admin123'
    })
    expect(targetConfig).not.toHaveProperty('password')
  })

  it('continues to decrypt legacy password fields', () => {
    const payload = buildPayload({
      host: '127.0.0.1',
      port: '9200',
      password: Encrypt('legacy-secret')
    })

    const result = decryptLogServerConfigurationPayload(payload)

    expect(getTargetConfig(result)).toMatchObject({
      password: 'legacy-secret'
    })
  })
})
