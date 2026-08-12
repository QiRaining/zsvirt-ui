import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';
import { LogServerInventory } from './types'

import { ActionAdvance } from './base/action-advance'

@Injectable()
export class AddLogServerAction extends ActionAdvance {

  async call(params: AddLogServerActionParam, _info: ActionInfo = {}, needRecord = true): Promise<AddLogServerResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    AddLogServerAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.post(`/log/servers`, {
      params: params,
      systemTags: params.systemTags
    }, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<AddLogServerResult>(
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

export interface AddLogServerActionParam {
  name: string;
  description?: string;
  category: string;
  type: string;
  level?: string;
  configuration: string;
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

export interface AddLogServerResult {
  inventory?: LogServerInventory;}
