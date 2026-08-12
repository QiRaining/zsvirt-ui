import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';
import { VmInstanceInventory } from './types'

import { ActionAdvance } from './base/action-advance'

@Injectable()
export class CreateVmFromVmBackupAction extends ActionAdvance {

  async call(params: CreateVmFromVmBackupActionParam, _info: ActionInfo = {}, needRecord = true): Promise<CreateVmFromVmBackupResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    CreateVmFromVmBackupAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.post(`/vm-instances/from/vm-backups/${params.groupUuid}`, {
      params: params,
      systemTags: params.systemTags
    }, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<CreateVmFromVmBackupResult>(
    {
      ..._info,
      apiId,
      actionId,
      sessionId,
    },
    httpRequestPromise,
    needRecord,
    apiRecord,
  );
  }
}

export interface CreateVmFromVmBackupActionParam {
  name: string;
  groupUuid: string;
  backupStorageUuid?: string;
  instanceOfferingUuid?: string;
  l3NetworkUuids?: any[];
  vmNicParams?: string;
  type?: string;
  zoneUuid?: string;
  clusterUuid?: string;
  hostUuid?: string;
  primaryStorageUuidForRootVolume?: string;
  primaryStorageUuidForDataVolume?: string;
  description?: string;
  rootVolumeSystemTags?: any[];
  dataVolumeSystemTags?: any[];
  diskAOs?: any[];
  strategy?: string;
  cpuNum?: number;
  memorySize?: number;
  reservedMemorySize?: number;
  defaultL3NetworkUuid?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateVmFromVmBackupResult {
  inventory?: VmInstanceInventory;}
