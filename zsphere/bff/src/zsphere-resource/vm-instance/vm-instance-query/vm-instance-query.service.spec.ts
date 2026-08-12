import { VmInstanceQueryService } from './vm-instance-query.service'

describe('VmInstanceQueryService', () => {
  let service: VmInstanceQueryService

  beforeEach(() => {
    service = Object.create(VmInstanceQueryService.prototype)
  })

  describe('getBackupJobAttachableVM', () => {
    it('does not query the enterprise-only CDP inventory', async () => {
      const condition = await service.getBackupJobAttachableVM([])
      const serializedCondition = JSON.stringify(condition)

      expect(serializedCondition).toContain('SchedulerJob')
      expect(serializedCondition).toContain('SchedulerJobGroup')
      expect(serializedCondition).not.toContain('CdpTaskResourceRef')
    })
  })
})
