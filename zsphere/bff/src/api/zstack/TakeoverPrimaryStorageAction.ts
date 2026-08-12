import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';
import { PrimaryStorageInventory } from './types'

import { ActionAdvance } from './base/action-advance'

@Injectable()
export class TakeoverPrimaryStorageAction extends ActionAdvance {

  async call(params: TakeoverPrimaryStorageActionParam, _info: ActionInfo = {}, needRecord = true): Promise<TakeoverPrimaryStorageResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    TakeoverPrimaryStorageAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.put(`/primary-storage/${params.uuid}/takeover`, {
      takeoverPrimaryStorage: params,
      systemTags: params.systemTags
    }, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<TakeoverPrimaryStorageResult>(
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

export interface TakeoverPrimaryStorageActionParam {
  uuid: string;
  dryRun?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface TakeoverPrimaryStorageResult {
  inventory?: PrimaryStorageInventory;}
