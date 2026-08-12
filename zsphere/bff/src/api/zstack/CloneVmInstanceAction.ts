import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';


import { ActionAdvance } from './base/action-advance'

@Injectable()
export class CloneVmInstanceAction extends ActionAdvance {

  async call(params: CloneVmInstanceActionParam, _info: ActionInfo = {}, needRecord = true): Promise<CloneVmInstanceResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    CloneVmInstanceAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.put(`/vm-instances/${params.vmInstanceUuid}/actions`, {
      cloneVmInstance: params,
      systemTags: params.systemTags
    }, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<CloneVmInstanceResult>(
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

export interface CloneVmInstanceActionParam {
  vmInstanceUuid: string;
  strategy?: string;
  vmNicParams?: string;
  names: any[];
  primaryStorageUuidForRootVolume?: string;
  primaryStorageUuidForDataVolume?: string;
  full?: boolean;
  rootVolumeSystemTags?: any[];
  dataVolumeSystemTags?: any[];
  clusterUuid?: string;
  hostUuid?: string;
  diskAOs?: any[];
  description?: string;
  vmCustomSpecification?: any;
  resetTpm?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CloneVmInstanceResult {
  result?: any;}
