import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';
import { TpmInventory } from './types'

import { ActionAdvance } from './base/action-advance'

@Injectable()
export class AddTpmAction extends ActionAdvance {

  async call(params: AddTpmActionParam, _info: ActionInfo = {}, needRecord = true): Promise<AddTpmResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    AddTpmAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.post(`/tpms`, {
      params: params,
      systemTags: params.systemTags
    }, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<AddTpmResult>(
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

export interface AddTpmActionParam {
  keyProviderUuid?: string;
  vmInstanceUuid: string;
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

export interface AddTpmResult {
  inventory?: TpmInventory;}
