import { getZsvBffPort } from './server-port'

describe('getZsvBffPort', () => {
  it('uses ZSV_BFF_PORT when configured', () => {
    expect(getZsvBffPort({ ZSV_BFF_PORT: '3150' })).toBe(3150)
  })

  it('rejects an invalid configured port', () => {
    expect(() => getZsvBffPort({ ZSV_BFF_PORT: 'not-a-port' })).toThrow(
      'ZSV_BFF_PORT must be an integer between 1 and 65535',
    )
  })

  it('uses the default local ZSV BFF port when not configured', () => {
    expect(getZsvBffPort({})).toBe(3100)
  })
})
