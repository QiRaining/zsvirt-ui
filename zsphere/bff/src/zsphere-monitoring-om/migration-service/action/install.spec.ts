jest.mock('@/base/action-service', () => ({ ActionService: class {} }))
jest.mock('@/api/zstack/InstallSoftwarePackageAction', () => ({
  InstallSoftwarePackageAction: class {}
}))
jest.mock('@/api/zstack/UninstallSoftwarePackageAction', () => ({
  UninstallSoftwarePackageAction: class {}
}))
jest.mock('@/common/nginx', () => ({ NginxService: class {} }))
jest.mock('@/zsphere-administration/management-node/management-node.service', () => ({
  ManagementNodeService: class {}
}))

import { InstallMigrationServiceService } from './install'

type InstallPayload = {
  uuid: string
  config: string
  needClear: boolean
}

type ActionCallback = (payload: InstallPayload, taskId: string) => Promise<unknown>

const createService = () => {
  const callOrder: string[] = []
  let callback: ActionCallback | undefined
  const service = new InstallMigrationServiceService()
  const uninstallSoftwarePackageAction = {
    call: jest.fn(async () => callOrder.push('uninstall'))
  }
  const installSoftwarePackageAction = {
    call: jest.fn(async () => callOrder.push('install'))
  }
  const managementNodeService = {
    getManagementNodeIp: jest.fn(async () => {
      callOrder.push('management-ip')
      return { ip: '192.0.2.10' }
    })
  }
  const nginxService = {
    setupProxy: jest.fn(async () => callOrder.push('nginx'))
  }
  const actionHelper = jest.fn((_input, _type, actionFn: ActionCallback) => {
    callback = actionFn
  })

  Object.assign(service as any, {
    actionHelper,
    installSoftwarePackageAction,
    managementNodeService,
    nginxService,
    uninstallSoftwarePackageAction
  })

  service.installMigrationService({
    payload: [],
    action: { actionId: 'action-1' }
  } as never)

  return {
    callOrder,
    getCallback: () => callback!,
    installSoftwarePackageAction,
    managementNodeService,
    nginxService,
    uninstallSoftwarePackageAction
  }
}

describe('InstallMigrationServiceService', () => {
  it('installs before configuring the management-node proxy', async () => {
    const { callOrder, getCallback } = createService()

    await getCallback()({ uuid: 'package-1', config: '{}', needClear: false }, 'task-1')

    expect(callOrder).toEqual(['install', 'management-ip', 'nginx'])
  })

  it('uninstalls before reinstalling when cleanup is required', async () => {
    const { callOrder, getCallback } = createService()

    await getCallback()({ uuid: 'package-1', config: '{}', needClear: true }, 'task-2')

    expect(callOrder).toEqual(['uninstall', 'install', 'management-ip', 'nginx'])
  })

  it('does not configure the proxy after installation rejects', async () => {
    const { getCallback, installSoftwarePackageAction, managementNodeService, nginxService } =
      createService()
    installSoftwarePackageAction.call = jest.fn().mockRejectedValue(new Error('install failed'))

    await expect(
      getCallback()({ uuid: 'package-1', config: '{}', needClear: false }, 'task-1')
    ).rejects.toThrow('install failed')
    expect(managementNodeService.getManagementNodeIp).not.toHaveBeenCalled()
    expect(nginxService.setupProxy).not.toHaveBeenCalled()
  })

  it('does not install after uninstall rejects', async () => {
    const { getCallback, installSoftwarePackageAction, uninstallSoftwarePackageAction } =
      createService()
    uninstallSoftwarePackageAction.call = jest.fn().mockRejectedValue(new Error('uninstall failed'))

    await expect(
      getCallback()({ uuid: 'package-1', config: '{}', needClear: true }, 'task-1')
    ).rejects.toThrow('uninstall failed')
    expect(installSoftwarePackageAction.call).not.toHaveBeenCalled()
  })
})
