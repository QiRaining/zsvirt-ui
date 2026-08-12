import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';
import { TpmInventory } from './types'

import { ActionAdvance } from './base/action-advance'

@Injectable()
export class UpdateTpmAction extends ActionAdvance {

  async call(params: UpdateTpmActionParam, _info: ActionInfo = {}, needRecord = true): Promise<UpdateTpmResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    UpdateTpmAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.put(`/tpms`, {
      updateTpm: params,
      systemTags: params.systemTags
    }, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<UpdateTpmResult>(
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

export interface UpdateTpmActionParam {
  vmInstanceUuid?: string;
  tpmUuid?: string;
  keyProviderUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateTpmResult {
  inventory?: TpmInventory;}
