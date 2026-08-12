import Utf8Base64 from '../utf8Base64'

describe('utils/utf8Base64', () => {
  describe('encode / decode 往返一致性', () => {
    const cases = [
      ['空字符串', ''],
      ['ASCII', 'Hello, World!'],
      ['中文', '你好世界'],
      ['混合内容', 'ZStack 云平台 v4.10'],
      ['特殊字符', 'a=1&b=2&c=3+4/5'],
      ['长字符串', 'a'.repeat(1000)],
      ['emoji', 'test 🚀 rocket']
    ]

    it.each(cases)('%s: decode(encode(input)) === input', (_label, input) => {
      const encoded = Utf8Base64.encode(input)
      const decoded = Utf8Base64.decode(encoded)
      expect(decoded).toBe(input)
    })
  })

  describe('encode', () => {
    it('已知值编码正确', () => {
      // "Hello" -> "SGVsbG8="
      expect(Utf8Base64.encode('Hello')).toBe('SGVsbG8=')
    })

    it('输出只包含 Base64 合法字符', () => {
      const encoded = Utf8Base64.encode('任意中文字符串 123')
      expect(encoded).toMatch(/^[A-Za-z0-9+/=]+$/)
    })
  })

  describe('decode', () => {
    it('已知值解码正确', () => {
      expect(Utf8Base64.decode('SGVsbG8=')).toBe('Hello')
    })
  })

  describe('test (Base64 格式校验)', () => {
    it('合法 Base64 返回 true', () => {
      expect(Utf8Base64.test('SGVsbG8=')).toBe(true)
      expect(Utf8Base64.test('YQ==')).toBe(true)
    })

    it('非法字符串返回 false', () => {
      expect(Utf8Base64.test('not-base64!@#')).toBe(false)
      expect(Utf8Base64.test('abc')).toBe(false) // 长度不是4的倍数
    })

    it('空字符串返回 true（正则匹配空串）', () => {
      expect(Utf8Base64.test('')).toBe(true)
    })
  })
})
