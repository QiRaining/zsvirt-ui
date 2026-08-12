import { getListLen, mockResolvers } from '../mock-resolvers'

describe('mockResolvers', () => {
  it('returns stable string for String scalar', () => {
    expect(typeof mockResolvers.String()).toBe('string')
  })
  it('Int returns a number', () => {
    expect(typeof mockResolvers.Int()).toBe('number')
  })
  it('Boolean returns true by default', () => {
    expect(mockResolvers.Boolean()).toBe(true)
  })
  it('Timestamp returns a number close to Date.now()', () => {
    const v = mockResolvers.Timestamp() as number
    expect(typeof v).toBe('number')
    expect(Math.abs(Date.now() - v)).toBeLessThan(5000)
  })
  it('getListLen honors ZSV_MOCK_LIST_LEN env', () => {
    process.env.ZSV_MOCK_LIST_LEN = '5'
    expect(getListLen()).toBe(5)
    delete process.env.ZSV_MOCK_LIST_LEN
    expect(getListLen()).toBe(3)
  })
})
