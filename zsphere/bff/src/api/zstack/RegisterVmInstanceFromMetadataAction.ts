import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';
import { VmInstanceInventory } from './types'

import { ActionAdvance } from './base/action-advance'

@Injectable()
export class RegisterVmInstanceFromMetadataAction extends ActionAdvance {

  async call(params: RegisterVmInstanceFromMetadataActionParam, _info: ActionInfo = {}, needRecord = true): Promise<RegisterVmInstanceFromMetadataResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    RegisterVmInstanceFromMetadataAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.post(`/vm-instances/metadata/register`, {
      params: params,
      systemTags: params.systemTags
    }, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<RegisterVmInstanceFromMetadataResult>(
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

export interface RegisterVmInstanceFromMetadataActionParam {
  metadataPath: string;
  primaryStorageUuid: string;
  zoneUuid: string;
  clusterUuid: string;
  hostUuid?: string;
  name?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RegisterVmInstanceFromMetadataResult {
  inventory?: VmInstanceInventory;}
