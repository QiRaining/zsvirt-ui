import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';


import { QueryParam } from './base/query-base'
      import { QueryAdvance } from './base/query-advance'

@Injectable()
export class GetZMigrateInfosAction extends QueryAdvance {

  async call(params: GetZMigrateInfosActionParam, _info: ActionInfo = {},needRecord = true): Promise<GetZMigrateInfosResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    GetZMigrateInfosAction.name,
    params,
  );
    const paramString = this.genParamStringForGet(params, ['systemTags','userTags','sessionId','accessKeyId','accessKeySecret','requestIp','timeout']);
    const httpRequestPromise =  this.zsHttpService.get(`/zmigrate/management/infos${paramString}`, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<GetZMigrateInfosResult>(
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

export interface GetZMigrateInfosActionParam {
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetZMigrateInfosResult {
  zmigrateVmInstanceStatus?: string;  version?: string;  platformsCount?: number;  gatewaysCount?: number;  migrateJobsCount?: number;  zmigrateStartTime?: number;  vddkUploaded?: boolean;}
