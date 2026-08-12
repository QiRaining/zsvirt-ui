import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';


import { QueryParam } from './base/query-base'
      import { QueryAdvance } from './base/query-advance'

@Injectable()
export class DiscoverStrangePrimaryStorageAction extends QueryAdvance {

  async call(params: DiscoverStrangePrimaryStorageActionParam, _info: ActionInfo = {},needRecord = true): Promise<DiscoverStrangePrimaryStorageResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    DiscoverStrangePrimaryStorageAction.name,
    params,
  );
    const paramString = this.genParamStringForGet(params, ['systemTags','userTags','sessionId','accessKeyId','accessKeySecret','requestIp','timeout']);
    const httpRequestPromise =  this.zsHttpService.get(`/primary-storage/stranger${paramString}`, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<DiscoverStrangePrimaryStorageResult>(
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

export interface DiscoverStrangePrimaryStorageActionParam {
  clusterUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DiscoverStrangePrimaryStorageResult {
  inventories?: any[];}
