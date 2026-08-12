import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';


import { ActionAdvance } from './base/action-advance'

@Injectable()
export class CreateVmInstanceFromTemplatedVmInstanceAction extends ActionAdvance {

  async call(params: CreateVmInstanceFromTemplatedVmInstanceActionParam, _info: ActionInfo = {}, needRecord = true): Promise<CreateVmInstanceFromTemplatedVmInstanceResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    CreateVmInstanceFromTemplatedVmInstanceAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.post(`/vm-instances/${params.templatedVmInstanceUuid}/create-vmInstance-from-templated-vmInstance`, {
      params: params,
      systemTags: params.systemTags
    }, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<CreateVmInstanceFromTemplatedVmInstanceResult>(
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

export interface CreateVmInstanceFromTemplatedVmInstanceActionParam {
  names: any[];
  templatedVmInstanceUuid: string;
  strategy?: string;
  description?: string;
  cpuNum?: number;
  memorySize?: number;
  reservedMemorySize?: number;
  l3NetworkUuids?: any[];
  defaultL3NetworkUuid?: string;
  vmNicParams?: string;
  diskAOs?: any[];
  zoneUuid?: string;
  clusterUuid?: string;
  hostUuid?: string;
  instanceOfferingUuid?: string;
  type?: string;
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

export interface CreateVmInstanceFromTemplatedVmInstanceResult {
  result?: any;}
