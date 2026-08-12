import { genUuid, ipToInt, intToIp, formatRFC3339, convertSizeToBytes } from '../index'

describe('utils/index', () => {
  describe('genUuid', () => {
    it('应返回 32 位十六进制字符串（无短横线）', () => {
      const uuid = genUuid()
      expect(uuid).toMatch(/^[0-9a-f]{32}$/)
    })

    it('每次调用应生成不同的 UUID', () => {
      const uuids = new Set(Array.from({ length: 100 }, () => genUuid()))
      expect(uuids.size).toBe(100)
    })
  })

  describe('ipToInt / intToIp', () => {
    const cases: [string, number][] = [
      ['0.0.0.0', 0],
      ['255.255.255.255', 4294967295],
      ['192.168.1.1', 3232235777],
      ['10.0.0.1', 167772161],
      ['127.0.0.1', 2130706433],
      ['192.0.2.28', 2886995484]
    ]

    it.each(cases)("ipToInt('%s') === %d", (ip, expected) => {
      expect(ipToInt(ip)).toBe(expected)
    })

    it.each(cases)("intToIp(%d) === '%s'", (expected, num) => {
      expect(intToIp(num)).toBe(expected)
    })

    it('双向转换一致性', () => {
      const ip = '192.168.100.200'
      expect(intToIp(ipToInt(ip))).toBe(ip)
    })
  })

  describe('formatRFC3339', () => {
    it('应返回 RFC3339 格式的日期字符串', () => {
      const date = new Date('2026-04-09T10:30:00Z')
      const result = formatRFC3339(date)
      // 格式: YYYY-MM-DDTHH:MM:SS+HH:MM 或 Z
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[Z+-]/)
    })

    it('月份和日期应补零', () => {
      const date = new Date(2026, 0, 5, 3, 7, 9) // 2026-01-05
      const result = formatRFC3339(date)
      expect(result).toContain('2026-01-05')
      expect(result).toContain('03:07:09')
    })
  })

  describe('convertSizeToBytes', () => {
    it('纯数字默认按 B 处理', () => {
      expect(convertSizeToBytes('1024')).toBe(1024)
    })

    it('各单位转换正确', () => {
      expect(convertSizeToBytes('1K')).toBe(1024)
      expect(convertSizeToBytes('1M')).toBe(1024 * 1024)
      expect(convertSizeToBytes('1G')).toBe(1024 * 1024 * 1024)
      expect(convertSizeToBytes('2T')).toBe(2 * 1024 * 1024 * 1024 * 1024)
    })

    it('不区分大小写', () => {
      expect(convertSizeToBytes('1k')).toBe(1024)
      expect(convertSizeToBytes('1g')).toBe(1024 * 1024 * 1024)
    })

    it('空字符串应抛错', () => {
      expect(() => convertSizeToBytes('')).toThrow('sizeStr cannot be empty')
    })

    it('非数字应抛错', () => {
      expect(() => convertSizeToBytes('abc')).toThrow('Invalid size number')
    })
  })
})
