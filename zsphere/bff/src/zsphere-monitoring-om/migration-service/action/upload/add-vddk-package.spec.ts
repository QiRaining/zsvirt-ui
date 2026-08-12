jest.mock('@/base/action-service', () => ({
  ActionService: class ActionService {}
}))

jest.mock('@/api/zstack/GetZMigrateGatewayVmInstancesAction', () => ({
  GetZMigrateGatewayVmInstancesAction: class GetZMigrateGatewayVmInstancesAction {}
}))

jest.mock('./long-job-extend', () => ({
  __esModule: true,
  default: class LongJobExtend {}
}))

import { AddVddkPackageService } from './add-vddk-package'

describe('AddVddkPackageService', () => {
  const createService = (
    managementVmInstanceUuid?: string,
    gatewayVmInstances = managementVmInstanceUuid
      ? [{ uuid: managementVmInstanceUuid, state: 'Running' }]
      : []
  ) => {
    const service = new AddVddkPackageService()
    const customCall = jest.fn().mockResolvedValue({ actionId: 'action-vddk-1' })

    service.longJobExtend = { customCall } as any
    service.getZMigrateGatewayVmInstancesAction = {
      call: jest.fn().mockResolvedValue({
        managementVmInstanceUuid,
        gatewayVmInstances
      })
    } as any

    return { service, customCall }
  }

  it('submits the VDDK upload long job to the management VM', async () => {
    const { service, customCall } = createService('management-vm-1')

    await service.addVddkPackage({
      payload: {
        url: 'upload://VMware-vix-disklib.tar.gz'
      },
      action: {
        actionId: 'action-vddk-1',
        name: '上传 VDDK'
      }
    } as never)

    expect(service.getZMigrateGatewayVmInstancesAction.call).toHaveBeenCalledWith({})
    expect(customCall).toHaveBeenCalledTimes(1)

    const [actionName, jobName, jobData, actionId, url, resourceType, resolveTarget] =
      customCall.mock.calls[0]

    expect(actionName).toBe('上传 VDDK')
    expect(jobName).toBe('APIUploadSoftwarePackageToVmMsg')
    expect(JSON.parse(jobData)).toEqual({
      type: 'ZMigrate',
      url: 'upload://VMware-vix-disklib.tar.gz',
      vmInstanceUuid: 'management-vm-1'
    })
    expect(actionId).toBe('action-vddk-1')
    expect(url).toBe('upload://VMware-vix-disklib.tar.gz')
    expect(resourceType).toBe('MigrationService')

    expect(
      resolveTarget({
        uploadTaskUuid: 'upload-task-1',
        success: true
      })
    ).toBeUndefined()
    expect(
      resolveTarget({
        uploadTaskUuid: 'upload-task-1',
        uploadUrl: 'http://example.com/vddk-upload',
        success: true
      })
    ).toEqual({
      artifactUuid: 'upload-task-1',
      uploadUrl: 'http://example.com/vddk-upload'
    })
  })

  it('rejects before creating a long job when the management VM is unavailable', async () => {
    const { service, customCall } = createService()

    await expect(
      service.addVddkPackage({
        payload: { url: 'upload://vddk.tar.gz' },
        action: {
          actionId: 'action-vddk-1',
          name: '上传 VDDK'
        }
      } as never)
    ).rejects.toThrow('ZMigrate management VM is unavailable')

    expect(customCall).not.toHaveBeenCalled()
  })

  it('rejects when the management VM is absent from the gateway VM list', async () => {
    const { service, customCall } = createService('management-vm-1', [
      { uuid: 'gateway-vm-1', state: 'Running' }
    ])

    await expect(
      service.addVddkPackage({
        payload: { url: 'upload://vddk.tar.gz' },
        action: {
          actionId: 'action-vddk-1',
          name: '上传 VDDK'
        }
      } as never)
    ).rejects.toThrow('ZMigrate management VM is unavailable')

    expect(customCall).not.toHaveBeenCalled()
  })

  it('rejects when the management VM is not running', async () => {
    const { service, customCall } = createService('management-vm-1', [
      { uuid: 'management-vm-1', state: 'Stopped' }
    ])

    await expect(
      service.addVddkPackage({
        payload: { url: 'upload://vddk.tar.gz' },
        action: {
          actionId: 'action-vddk-1',
          name: '上传 VDDK'
        }
      } as never)
    ).rejects.toThrow('ZMigrate management VM is not running')

    expect(customCall).not.toHaveBeenCalled()
  })

  it('propagates the original VDDK custom call error', async () => {
    const customCallError = new Error('VDDK upload failed')
    const { service, customCall } = createService('management-vm-1')
    customCall.mockRejectedValue(customCallError)

    await expect(
      service.addVddkPackage({
        payload: { url: 'upload://vddk.tar.gz' },
        action: {
          actionId: 'action-vddk-1',
          name: '上传 VDDK'
        }
      } as never)
    ).rejects.toBe(customCallError)
  })
})
