import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';
import { JsonLabelInventory } from './types'

import { ActionAdvance } from './base/action-advance'

@Injectable()
export class AddLogConfigurationAction extends ActionAdvance {

  async call(params: AddLogConfigurationActionParam, _info: ActionInfo = {}, needRecord = true): Promise<AddLogConfigurationResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    AddLogConfigurationAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.post(`/log/configurations`, {
      params: params,
      systemTags: params.systemTags
    }, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<AddLogConfigurationResult>(
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

export interface AddLogConfigurationActionParam {
  name: string;
  description?: string;
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

export interface AddLogConfigurationResult {
  inventory?: JsonLabelInventory;}
