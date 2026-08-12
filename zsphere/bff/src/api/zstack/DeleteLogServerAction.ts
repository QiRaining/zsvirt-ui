import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';


import { ActionAdvance } from './base/action-advance'

@Injectable()
export class DeleteLogServerAction extends ActionAdvance {

  async call(params: DeleteLogServerActionParam,  _info: ActionInfo = {}, needRecord = true): Promise<DeleteLogServerResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    DeleteLogServerAction.name,
    params,
  );
  const paramString = this.genParamStringForDelete(params, ['systemTags','userTags','sessionId','accessKeyId','accessKeySecret','requestIp','timeout']);
    const httpRequestPromise =  this.zsHttpService.delete(`/log/servers${paramString}`, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<DeleteLogServerResult>(
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

export interface DeleteLogServerActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DeleteLogServerResult {
}
