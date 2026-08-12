import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';
import { PrimaryStorageInventory } from './types'

import { ActionAdvance } from './base/action-advance'

@Injectable()
export class AddSharedBlockGroupPrimaryStorageAction extends ActionAdvance {

  async call(params: AddSharedBlockGroupPrimaryStorageActionParam, _info: ActionInfo = {}, needRecord = true): Promise<AddPrimaryStorageResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    AddSharedBlockGroupPrimaryStorageAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.post(`/primary-storage/sharedblockgroup`, {
      params: params,
      systemTags: params.systemTags
    }, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<AddPrimaryStorageResult>(
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

export interface AddSharedBlockGroupPrimaryStorageActionParam {
  diskUuids: any[];
  url?: string;
  name: string;
  description?: string;
  type?: string;
  zoneUuid: string;
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

export interface AddPrimaryStorageResult {
  inventory?: PrimaryStorageInventory;}
