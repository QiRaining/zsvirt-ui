import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  DisasterRecoveryServiceMockStore,
  type DisasterRecoveryServiceOperation
} from '../mock-store'

describe('DisasterRecoveryServiceMockStore', () => {
  let dir: string
  let dataFile: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'zlr-service-mock-'))
    dataFile = join(dir, 'service.json')
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('creates the default service state when the JSON file is missing', () => {
    const store = new DisasterRecoveryServiceMockStore(dataFile)

    const state = store.getState()

    expect(state.status).toBe('not-installed')
    expect(state.platformContext.platformType).toBe('ZSphere')
    expect(state.taskLogs.map(log => log.code)).toContain('package-required')
  })

  it('persists the deployment flow to the JSON file', () => {
    const store = new DisasterRecoveryServiceMockStore(dataFile)

    store.runOperation('upload-package', {
      uploadMethod: 'url',
      storagePath: '/var/lib/zstack/zlr/packages',
      packageUrl: 'https://downloads.example.local/zlr/zlr-appliance-1.2.0.ova',
      packageName: 'zlr-appliance-1.2.0.ova',
      packageVersion: '1.2.0',
      checksum: 'sha256:1234567890abcdef'
    })
    store.runOperation('install-service', {
      clusterName: 'Cluster-DR',
      hostName: 'host-172-20-1-12',
      storageName: 'primary-storage-dr',
      managementNetwork: 'management-network',
      spec: 'Light',
      managementAddress: 'https://zlr.local'
    })
    store.runOperation('initialize-site', {
      siteName: 'Shanghai-DR-Site',
      siteId: 'site-shanghai-dr',
      managementNodeAddress: 'https://zsphere-mn.local',
      certificateFingerprint: 'AA:BB:CC',
      bootstrapToken: 'mock-token'
    })

    const persistedStore = new DisasterRecoveryServiceMockStore(dataFile)
    const state = persistedStore.getState()

    expect(state.status).toBe('running')
    expect(state.packageName).toBe('zlr-appliance-1.2.0.ova')
    expect(state.packageVersion).toBe('1.2.0')
    expect(state.packageChecksum).toBe('sha256:1234567890abcdef')
    expect(state.uploadMethod).toBe('url')
    expect(state.packageUrl).toBe('https://downloads.example.local/zlr/zlr-appliance-1.2.0.ova')
    expect(state.storagePath).toBe('/var/lib/zstack/zlr/packages')
    expect(state.target.clusterName).toBe('Cluster-DR')
    expect(state.target.spec).toBe('Light')
    expect(state.managementAddress).toBe('https://zlr.local')
    expect(state.platformContext.suggestedSiteName).toBe('Shanghai-DR-Site')
    expect(state.platformContext.siteId).toBe('site-shanghai-dr')
    expect(state.platformContext.managementNodeAddress).toBe('https://zsphere-mn.local')
    expect(state.platformContext.certificateFingerprint).toBe('AA:BB:CC')
    expect(state.taskLogs[0].code).toBe('initialization-finished')
  })

  it('persists the local upload source through later deployment operations', () => {
    const store = new DisasterRecoveryServiceMockStore(dataFile)

    store.runOperation('upload-package', {
      uploadMethod: 'local',
      storagePath: '/var/lib/zstack/zlr/packages',
      localFileName: 'zlr-appliance-local.ova',
      packageVersion: '1.3.0',
      checksum: 'sha256:local'
    })
    store.runOperation('install-service')

    const state = store.getState()

    expect(state.status).toBe('initialization-required')
    expect(state.uploadMethod).toBe('local')
    expect(state.localFileName).toBe('zlr-appliance-local.ova')
    expect(state.packageName).toBe('zlr-appliance-local.ova')
    expect(state.packageUrl).toBeUndefined()
    expect(state.storagePath).toBe('/var/lib/zstack/zlr/packages')
  })

  it('blocks clear requests until force clear is executed', () => {
    const store = new DisasterRecoveryServiceMockStore(dataFile)

    store.runOperation('upload-package')
    store.runOperation('install-service')
    store.runOperation('initialize-site')
    const blocked = store.runOperation('request-clear')

    expect(blocked.status).toBe('clear-blocked')
    expect(blocked.blockers.length).toBeGreaterThan(0)
    expect(blocked.taskLogs[0].status).toBe('warning')

    const cleared = store.runOperation('force-clear')

    expect(cleared.status).toBe('not-installed')
    expect(cleared.packageName).toBeUndefined()
    expect(cleared.taskLogs[0].code).toBe('clear-finished')
  })
})
