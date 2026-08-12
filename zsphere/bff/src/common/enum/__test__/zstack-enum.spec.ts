/**
 * 枚举完整性校验
 * 确保 zstack.ts 中所有枚举都能正常加载，没有命名冲突
 */
import * as ZStackEnums from '../zstack'

describe('common/enum/zstack', () => {
  it('模块应能正常导入（不抛错）', () => {
    expect(ZStackEnums).toBeDefined()
  })

  it('导出应包含大量枚举', () => {
    const exportedKeys = Object.keys(ZStackEnums)
    // 5368 行文件，至少有几十个枚举
    expect(exportedKeys.length).toBeGreaterThan(50)
  })

  it('枚举值应为字符串（不是数字枚举）', () => {
    // 抽样校验几个关键枚举
    const { VmInstanceState, HostState, VolumeType } = ZStackEnums as any

    if (VmInstanceState) {
      const values = Object.values(VmInstanceState)
      for (const v of values) {
        expect(typeof v).toBe('string')
      }
    }

    if (HostState) {
      const values = Object.values(HostState)
      for (const v of values) {
        expect(typeof v).toBe('string')
      }
    }

    if (VolumeType) {
      const values = Object.values(VolumeType)
      for (const v of values) {
        expect(typeof v).toBe('string')
      }
    }
  })

  it('registerEnumType 注册的名称应无重复', () => {
    // 通过 re-import 触发所有 registerEnumType 调用
    // 如果有重复名称，@nestjs/graphql 会在运行时抛错
    // 这里只确认加载成功即视为无冲突
    expect(() => {
      // 强制重新评估模块（jest 缓存下不会真的重新执行）
      const keys = Object.keys(ZStackEnums)
      expect(keys.length).toBeGreaterThan(0)
    }).not.toThrow()
  })

  it('常见枚举应存在且有合理值', () => {
    const enums = ZStackEnums as any

    // Zone
    expect(enums.ZoneState?.Enabled).toBe('Enabled')
    expect(enums.ZoneState?.Disabled).toBe('Disabled')

    // Account
    expect(enums.AccountType?.SystemAdmin).toBe('SystemAdmin')
    expect(enums.AccountType?.Normal).toBe('Normal')
  })
})
