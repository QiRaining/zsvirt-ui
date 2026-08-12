import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';
import { LogServerInventory } from './types'

import { ActionAdvance } from './base/action-advance'

@Injectable()
export class UpdateLogServerAction extends ActionAdvance {

  async call(params: UpdateLogServerActionParam, _info: ActionInfo = {}, needRecord = true): Promise<UpdateLogServerResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    UpdateLogServerAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.put(`/log/servers`, {
      updateLogServer: params,
      systemTags: params.systemTags
    }, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<UpdateLogServerResult>(
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

export interface UpdateLogServerActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateLogServerResult {
  inventory?: LogServerInventory;}
