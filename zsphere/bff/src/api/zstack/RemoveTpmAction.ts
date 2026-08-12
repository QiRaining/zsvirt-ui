import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';


import { ActionAdvance } from './base/action-advance'

@Injectable()
export class RemoveTpmAction extends ActionAdvance {

  async call(params: RemoveTpmActionParam,  _info: ActionInfo = {}, needRecord = true): Promise<RemoveTpmResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    RemoveTpmAction.name,
    params,
  );
  const paramString = this.genParamStringForDelete(params, ['systemTags','userTags','sessionId','accessKeyId','accessKeySecret','requestIp','timeout']);
    const httpRequestPromise =  this.zsHttpService.delete(`/tpms${paramString}`, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<RemoveTpmResult>(
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

export interface RemoveTpmActionParam {
  tpmUuid?: string;
  vmInstanceUuid?: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RemoveTpmResult {
}
