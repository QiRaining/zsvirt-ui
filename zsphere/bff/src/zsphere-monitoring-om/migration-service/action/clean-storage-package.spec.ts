jest.mock('@/base/action-service', () => ({ ActionService: class {} }))
jest.mock('@/api/zstack/CleanSoftwarePackageAction', () => ({
  CleanSoftwarePackageAction: class {}
}))
jest.mock('@/api/zstack/UninstallSoftwarePackageAction', () => ({
  UninstallSoftwarePackageAction: class {}
}))

import { CleanStoragePackageService } from './clean-storage-package'

type ActionCallback = (payload: { uuid: string }, taskId: string) => Promise<unknown>

const createService = () => {
  const callOrder: string[] = []
  let callback: ActionCallback | undefined
  const service = new CleanStoragePackageService()
  service.uninstallSoftwarePackageAction = {
    call: jest.fn(async () => callOrder.push('uninstall'))
  } as any
  service.cleanSoftwarePackageAction = {
    call: jest.fn(async () => callOrder.push('clean'))
  } as any
  const actionHelper = jest.fn((_input, _type, actionFn: ActionCallback) => {
    callback = actionFn
  })
  ;(service as any).actionHelper = actionHelper
  return { actionHelper, callOrder, getCallback: () => callback!, service }
}

describe('CleanStoragePackageService', () => {
  it('uninstalls before cleaning an installed package', async () => {
    const { actionHelper, callOrder, getCallback, service } = createService()
    const payload = { uuid: 'package-1', cleanStorageMode: true }
    const input = {
      payload,
      action: { actionId: 'action-1' }
    } as never

    service.cleanStoragePackage(input)
    await getCallback()(payload, 'task-1')

    expect(actionHelper).toHaveBeenCalledWith(input, 'MigrationService', expect.any(Function))
    expect(callOrder).toEqual(['uninstall', 'clean'])
    expect(service.uninstallSoftwarePackageAction.call).toHaveBeenCalledWith(
      { uuid: 'package-1' },
      { actionId: 'action-1', taskId: 'task-1' }
    )
  })

  it('cleans an uploaded package without uninstalling it', async () => {
    const { getCallback, callOrder, service } = createService()
    const payload = { uuid: 'package-1', cleanStorageMode: false }
    const input = {
      payload,
      action: { actionId: 'action-1' }
    } as never

    service.cleanStoragePackage(input)
    await getCallback()(payload, 'task-1')

    expect(callOrder).toEqual(['clean'])
    expect(service.uninstallSoftwarePackageAction.call).not.toHaveBeenCalled()
  })

  it('does not clean after uninstall rejects', async () => {
    const { getCallback, service } = createService()
    const payload = { uuid: 'package-1', cleanStorageMode: true }
    const input = {
      payload,
      action: { actionId: 'action-1' }
    } as never
    service.uninstallSoftwarePackageAction.call = jest
      .fn()
      .mockRejectedValue(new Error('uninstall failed'))

    service.cleanStoragePackage(input)
    await expect(getCallback()(payload, 'task-1')).rejects.toThrow('uninstall failed')
    expect(service.cleanSoftwarePackageAction.call).not.toHaveBeenCalled()
  })
})
