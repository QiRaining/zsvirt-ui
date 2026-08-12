import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';
import { VmInstanceInventory } from './types'

import { ActionAdvance } from './base/action-advance'

@Injectable()
export class CreateVmInstanceAction extends ActionAdvance {

  async call(params: CreateVmInstanceActionParam, _info: ActionInfo = {}, needRecord = true): Promise<CreateVmInstanceResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    CreateVmInstanceAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.post(`/vm-instances`, {
      params: params,
      systemTags: params.systemTags
    }, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<CreateVmInstanceResult>(
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

export interface CreateVmInstanceActionParam {
  name: string;
  instanceOfferingUuid?: string;
  cpuNum?: number;
  memorySize?: number;
  reservedMemorySize?: number;
  imageUuid?: string;
  l3NetworkUuids?: any[];
  vmNicParams?: string;
  type?: string;
  rootDiskOfferingUuid?: string;
  rootDiskSize?: number;
  dataDiskSizes?: any[];
  dataDiskOfferingUuids?: any[];
  zoneUuid?: string;
  clusterUuid?: string;
  hostUuid?: string;
  primaryStorageUuidForRootVolume?: string;
  description?: string;
  defaultL3NetworkUuid?: string;
  strategy?: string;
  rootVolumeSystemTags?: any[];
  dataVolumeSystemTags?: any[];
  dataVolumeSystemTagsOnIndex?: any;
  sshKeyPairUuids?: any[];
  platform?: string;
  guestOsType?: string;
  architecture?: string;
  virtio?: boolean;
  allocatorStrategy?: string;
  diskAOs?: any[];
  devices?: any;
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

export interface CreateVmInstanceResult {
  inventory?: VmInstanceInventory;}
