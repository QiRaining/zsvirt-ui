import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';
import { VmInstanceInventory } from './types'

import { ActionAdvance } from './base/action-advance'

@Injectable()
export class CreateVmInstanceFromVolumeSnapshotGroupAction extends ActionAdvance {

  async call(params: CreateVmInstanceFromVolumeSnapshotGroupActionParam, _info: ActionInfo = {}, needRecord = true): Promise<CreateVmInstanceFromVolumeSnapshotGroupResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    CreateVmInstanceFromVolumeSnapshotGroupAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.post(`/vm-instances/from/volume-snapshots/group/${params.volumeSnapshotGroupUuid}`, {
      params: params,
      systemTags: params.systemTags
    }, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<CreateVmInstanceFromVolumeSnapshotGroupResult>(
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

export interface CreateVmInstanceFromVolumeSnapshotGroupActionParam {
  name: string;
  description?: string;
  instanceOfferingUuid?: string;
  cpuNum?: number;
  memorySize?: number;
  reservedMemorySize?: number;
  l3NetworkUuids?: any[];
  vmNicParams?: string;
  type?: string;
  volumeSnapshotGroupUuid: string;
  zoneUuid?: string;
  clusterUuid?: string;
  hostUuid?: string;
  primaryStorageUuidForRootVolume?: string;
  defaultL3NetworkUuid?: string;
  strategy?: string;
  rootVolumeSystemTags?: any[];
  dataVolumeSystemTags?: any;
  resetTpm?: boolean;
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

export interface CreateVmInstanceFromVolumeSnapshotGroupResult {
  inventory?: VmInstanceInventory;}
