import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';
import { VmInstanceInventory } from './types'

import { ActionAdvance } from './base/action-advance'

@Injectable()
export class ConvertTemplatedVmInstanceToVmInstanceAction extends ActionAdvance {

  async call(params: ConvertTemplatedVmInstanceToVmInstanceActionParam, _info: ActionInfo = {}, needRecord = true): Promise<ConvertTemplatedVmInstanceToVmInstanceResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    ConvertTemplatedVmInstanceToVmInstanceAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.post(`/vm-instances/${params.templatedVmInstanceUuid}/convert-to-vmInstance`, {
      params: params,
      systemTags: params.systemTags
    }, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<ConvertTemplatedVmInstanceToVmInstanceResult>(
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

export interface ConvertTemplatedVmInstanceToVmInstanceActionParam {
  templatedVmInstanceUuid: string;
  name: string;
  resetTpm?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ConvertTemplatedVmInstanceToVmInstanceResult {
  inventory?: VmInstanceInventory;}
