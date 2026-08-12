import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';
import { AccountInventory } from './types'

import { ActionAdvance } from './base/action-advance'

@Injectable()
export class ChangeAccountTypeAction extends ActionAdvance {

  async call(params: ChangeAccountTypeActionParam, _info: ActionInfo = {}, needRecord = true): Promise<ChangeAccountTypeResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    ChangeAccountTypeAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.put(`/accounts/${params.uuid}/actions`, {
      changeAccountType: params,
      systemTags: params.systemTags
    }, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<ChangeAccountTypeResult>(
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

export interface ChangeAccountTypeActionParam {
  uuid: string;
  type: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeAccountTypeResult {
  inventory?: AccountInventory;}
