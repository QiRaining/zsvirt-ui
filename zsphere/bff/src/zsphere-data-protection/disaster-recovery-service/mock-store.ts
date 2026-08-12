import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'

export type DisasterRecoveryServiceStatus =
  | 'not-installed'
  | 'package-missing'
  | 'package-uploaded'
  | 'initialization-required'
  | 'running'
  | 'abnormal'
  | 'upgrade-in-progress'
  | 'clear-blocked'

export type DisasterRecoveryServiceOperation =
  | 'prepare-upload'
  | 'upload-package'
  | 'install-service'
  | 'initialize-site'
  | 'recheck'
  | 'retry'
  | 'request-clear'
  | 'force-clear'

export interface DisasterRecoveryServiceOperationPayload {
  packageName?: string
  packageVersion?: string
  checksum?: string
  packageUrl?: string
  localFileName?: string
  storagePath?: string
  uploadMethod?: string
  clusterName?: string
  hostName?: string
  storageName?: string
  managementNetwork?: string
  spec?: string
  managementAddress?: string
  siteName?: string
  siteId?: string
  managementNodeAddress?: string
  certificateFingerprint?: string
  bootstrapToken?: string
}

export interface DisasterRecoveryServiceTaskLog {
  id: string
  code:
    | 'context-detected'
    | 'package-required'
    | 'package-upload-started'
    | 'package-uploaded'
    | 'install-started'
    | 'install-finished'
    | 'initialization-started'
    | 'initialization-finished'
    | 'clear-blocked'
    | 'clear-started'
    | 'clear-finished'
    | 'retry-started'
  status: 'success' | 'warning' | 'progress'
  createdAt: string
}

export interface DisasterRecoveryServiceState {
  status: DisasterRecoveryServiceStatus
  version: string
  managementAddress: string
  licenseSummary: string
  packageName?: string
  packageVersion?: string
  packageChecksum?: string
  packageUrl?: string
  localFileName?: string
  storagePath?: string
  uploadMethod?: 'url' | 'local'
  target: {
    clusterName: string
    hostName: string
    storageName: string
    managementNetwork: string
    spec: 'Light' | 'Standard'
  }
  platformContext: {
    platformType: 'ZSphere' | 'ZStack Cloud'
    managementNodeAddress: string
    managementNodeUuid: string
    siteId: string
    suggestedSiteName: string
    certificateFingerprint: string
    bootstrapTokenState: 'VALID' | 'EXPIRED' | 'USED' | 'MISSING'
    entrySource: string
  }
  selfChecks: Array<{
    code:
      | 'service'
      | 'database'
      | 'platform'
      | 'version'
      | 'certificate'
      | 'sso'
      | 'time'
      | 'license'
      | 'network'
      | 'placeholder-datastore'
      | 'replication-agent'
    status: 'passed' | 'warning' | 'critical'
  }>
  blockers: Array<{
    code: 'running-task' | 'protection-group' | 'recovery-plan'
    count: number
  }>
  taskLogs: DisasterRecoveryServiceTaskLog[]
}

const DEFAULT_DATA_FILE = join(
  process.cwd(),
  'src/zsphere-data-protection/disaster-recovery-service/mock/disaster-recovery-service.json'
)

const PACKAGE_NAME = 'zlr-appliance-1.0.0.ova'
const PACKAGE_VERSION = '1.0.0'
const PACKAGE_CHECKSUM = 'sha256:6a8f4d8c1e1a7c9d6b2f9a31b4d0c7e8'

function cloneState(state: DisasterRecoveryServiceState): DisasterRecoveryServiceState {
  return JSON.parse(JSON.stringify(state))
}

function createLog(
  code: DisasterRecoveryServiceTaskLog['code'],
  status: DisasterRecoveryServiceTaskLog['status']
): DisasterRecoveryServiceTaskLog {
  return {
    id: `${code}-${Date.now()}`,
    code,
    status,
    createdAt: new Date().toISOString()
  }
}

function appendLog(
  state: DisasterRecoveryServiceState,
  code: DisasterRecoveryServiceTaskLog['code'],
  status: DisasterRecoveryServiceTaskLog['status']
): DisasterRecoveryServiceState {
  return {
    ...state,
    taskLogs: [createLog(code, status), ...state.taskLogs].slice(0, 8)
  }
}

function getPackageNameFromUrl(url: string | undefined): string | undefined {
  if (!url) {
    return undefined
  }

  try {
    const parsed = new URL(url)
    const fileName = basename(parsed.pathname)
    return fileName || undefined
  } catch {
    const [path] = url.split('?')
    const fileName = basename(path)
    return fileName || undefined
  }
}

function withPackage(
  state: DisasterRecoveryServiceState,
  payload: DisasterRecoveryServiceOperationPayload = {}
): DisasterRecoveryServiceState {
  const uploadMethod =
    payload.uploadMethod === 'local' || payload.uploadMethod === 'url'
      ? payload.uploadMethod
      : state.uploadMethod || 'url'
  const packageUrl = uploadMethod === 'url' ? payload.packageUrl || state.packageUrl : undefined
  const localFileName =
    uploadMethod === 'local' ? payload.localFileName || state.localFileName : undefined

  return {
    ...state,
    packageName:
      payload.packageName ||
      localFileName ||
      getPackageNameFromUrl(packageUrl) ||
      state.packageName ||
      PACKAGE_NAME,
    packageVersion: payload.packageVersion || state.packageVersion || PACKAGE_VERSION,
    packageChecksum: payload.checksum || state.packageChecksum || PACKAGE_CHECKSUM,
    packageUrl,
    localFileName,
    storagePath: payload.storagePath || state.storagePath,
    uploadMethod
  }
}

function withoutPackage(state: DisasterRecoveryServiceState): DisasterRecoveryServiceState {
  const {
    packageName: _packageName,
    packageVersion: _packageVersion,
    packageChecksum: _packageChecksum,
    packageUrl: _packageUrl,
    localFileName: _localFileName,
    storagePath: _storagePath,
    uploadMethod: _uploadMethod,
    ...rest
  } = state
  return rest
}

function withDeploymentTarget(
  state: DisasterRecoveryServiceState,
  payload: DisasterRecoveryServiceOperationPayload = {}
): DisasterRecoveryServiceState {
  const spec =
    payload.spec === 'Light' || payload.spec === 'Standard' ? payload.spec : state.target.spec

  return {
    ...state,
    managementAddress: payload.managementAddress || state.managementAddress,
    target: {
      clusterName: payload.clusterName || state.target.clusterName,
      hostName: payload.hostName || state.target.hostName,
      storageName: payload.storageName || state.target.storageName,
      managementNetwork: payload.managementNetwork || state.target.managementNetwork,
      spec
    }
  }
}

function withSiteInitialization(
  state: DisasterRecoveryServiceState,
  payload: DisasterRecoveryServiceOperationPayload = {}
): DisasterRecoveryServiceState {
  return {
    ...state,
    platformContext: {
      ...state.platformContext,
      suggestedSiteName: payload.siteName || state.platformContext.suggestedSiteName,
      siteId: payload.siteId || state.platformContext.siteId,
      managementNodeAddress:
        payload.managementNodeAddress || state.platformContext.managementNodeAddress,
      certificateFingerprint:
        payload.certificateFingerprint || state.platformContext.certificateFingerprint,
      bootstrapTokenState: payload.bootstrapToken
        ? 'USED'
        : state.platformContext.bootstrapTokenState
    }
  }
}

export function createDefaultDisasterRecoveryServiceState(): DisasterRecoveryServiceState {
  return {
    status: 'not-installed',
    version: '1.0.0',
    managementAddress: 'https://zlr-10-7-21-88.example.local',
    licenseSummary: '1,000 VM / 365 days',
    target: {
      clusterName: 'Cluster-Production-A',
      hostName: 'host-10-7-21-32',
      storageName: 'primary-storage-zlr-system',
      managementNetwork: 'mgmt-network-192.0.2.0/24',
      spec: 'Standard'
    },
    platformContext: {
      platformType: 'ZSphere',
      managementNodeAddress: '198.51.100.32',
      managementNodeUuid: 'mn-3f4c8d0a-7c21-4b9f-8d62-91a6f2c1e018',
      siteId: 'site-local-001',
      suggestedSiteName: 'Shanghai-Primary-Site',
      certificateFingerprint: '75:3A:2B:99:4F:62:DA:18:00:6C:6E:92:27:D7:9E:AB',
      bootstrapTokenState: 'VALID',
      entrySource: 'ZSphere Service Entry'
    },
    selfChecks: [
      { code: 'service', status: 'passed' },
      { code: 'database', status: 'passed' },
      { code: 'platform', status: 'passed' },
      { code: 'version', status: 'passed' },
      { code: 'certificate', status: 'warning' },
      { code: 'sso', status: 'warning' },
      { code: 'time', status: 'passed' },
      { code: 'license', status: 'warning' },
      { code: 'network', status: 'passed' },
      { code: 'placeholder-datastore', status: 'warning' },
      { code: 'replication-agent', status: 'warning' }
    ],
    blockers: [
      { code: 'running-task', count: 2 },
      { code: 'protection-group', count: 3 },
      { code: 'recovery-plan', count: 1 }
    ],
    taskLogs: [
      {
        id: 'log-context',
        code: 'context-detected',
        status: 'success',
        createdAt: '2026-06-02 18:20:00'
      },
      {
        id: 'log-package',
        code: 'package-required',
        status: 'warning',
        createdAt: '2026-06-02 18:21:04'
      }
    ]
  }
}

export class DisasterRecoveryServiceMockStore {
  constructor(private readonly dataFile = DEFAULT_DATA_FILE) {}

  getState(): DisasterRecoveryServiceState {
    if (!existsSync(this.dataFile)) {
      const state = createDefaultDisasterRecoveryServiceState()
      this.writeState(state)
      return cloneState(state)
    }

    return JSON.parse(readFileSync(this.dataFile, 'utf8')) as DisasterRecoveryServiceState
  }

  runOperation(
    operation: DisasterRecoveryServiceOperation,
    payload: DisasterRecoveryServiceOperationPayload = {}
  ): DisasterRecoveryServiceState {
    const current = this.getState()
    const next = this.reduce(current, operation, payload)
    this.writeState(next)
    return cloneState(next)
  }

  private writeState(state: DisasterRecoveryServiceState): void {
    mkdirSync(dirname(this.dataFile), { recursive: true })
    writeFileSync(this.dataFile, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
  }

  private reduce(
    state: DisasterRecoveryServiceState,
    operation: DisasterRecoveryServiceOperation,
    payload: DisasterRecoveryServiceOperationPayload
  ): DisasterRecoveryServiceState {
    switch (operation) {
      case 'prepare-upload':
        return appendLog(
          { ...withoutPackage(state), status: 'package-missing' },
          'package-required',
          'warning'
        )
      case 'upload-package':
        return appendLog(
          { ...withPackage(state, payload), status: 'package-uploaded' },
          'package-uploaded',
          'success'
        )
      case 'install-service':
        return appendLog(
          {
            ...withDeploymentTarget(withPackage(state), payload),
            status: 'initialization-required'
          },
          'install-finished',
          'success'
        )
      case 'initialize-site':
        return appendLog(
          { ...withSiteInitialization(withPackage(state), payload), status: 'running' },
          'initialization-finished',
          'success'
        )
      case 'recheck':
        return appendLog(state, 'retry-started', 'success')
      case 'retry':
        return appendLog(
          { ...withPackage(state), status: 'package-uploaded' },
          'retry-started',
          'progress'
        )
      case 'request-clear':
        return appendLog({ ...state, status: 'clear-blocked' }, 'clear-blocked', 'warning')
      case 'force-clear':
        return appendLog(
          {
            ...createDefaultDisasterRecoveryServiceState(),
            taskLogs: state.taskLogs,
            status: 'not-installed'
          },
          'clear-finished',
          'success'
        )
    }
  }
}
