import { Encrypt, Decrypt, isEncrypted } from '../aesCipher'

describe('utils/aesCipher', () => {
  describe('Encrypt / Decrypt 往返一致性', () => {
    const cases = [
      ['普通字符串', 'password123'],
      ['中文', '管理员密码'],
      ['特殊字符', 'p@ss!w0rd#$%^&*()'],
      ['长字符串', 'a'.repeat(500)],
      ['包含空格', 'hello world foo bar']
    ]

    it.each(cases)('%s: Decrypt(Encrypt(input)) === input', (_label, input) => {
      const encrypted = Encrypt(input)
      expect(encrypted).not.toBe(input)
      const decrypted = Decrypt(encrypted)
      expect(decrypted).toBe(input)
    })
  })

  describe('Encrypt', () => {
    it('空字符串加密后产生非空密文', () => {
      const encrypted = Encrypt('')
      // 源码逻辑：word !== "" 为 false，直接走 else 返回加密后的 msg
      // AES 对空字符串也会产生密文（PKCS7 padding）
      expect(typeof encrypted).toBe('string')
      expect(encrypted.length).toBeGreaterThan(0)
    })

    it('相同输入加密结果相同（ECB 模式）', () => {
      const a = Encrypt('test')
      const b = Encrypt('test')
      expect(a).toBe(b)
    })

    it('不同输入加密结果不同', () => {
      const a = Encrypt('password1')
      const b = Encrypt('password2')
      expect(a).not.toBe(b)
    })
  })

  describe('Decrypt', () => {
    it('空字符串返回空字符串', () => {
      expect(Decrypt('')).toBe('')
    })

    it('非加密字符串原样返回', () => {
      expect(Decrypt('plaintext')).toBe('plaintext')
    })
  })

  describe('isEncrypted', () => {
    it('加密后的字符串返回 true', () => {
      const encrypted = Encrypt('secret')
      expect(isEncrypted(encrypted)).toBe(true)
    })

    it('未加密的字符串返回 false', () => {
      expect(isEncrypted('plaintext')).toBe(false)
    })

    it('空字符串返回 false', () => {
      expect(isEncrypted('')).toBe(false)
    })
  })
})
