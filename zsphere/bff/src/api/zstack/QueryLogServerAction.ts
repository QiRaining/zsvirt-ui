import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';


import { QueryParam } from './base/query-base'
      import { QueryAdvance } from './base/query-advance'

@Injectable()
export class QueryLogServerAction extends QueryAdvance {

  async call(params: QueryParam, _info: ActionInfo = {},needRecord = true): Promise<QueryLogServerResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    QueryLogServerAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.get(this.buildQuery('/log/servers', params), {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<QueryLogServerResult>(
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

export interface QueryLogServerActionParam {

  timeout?: number;
}

export interface QueryLogServerResult {
  inventories?: any[];  total?: number;}
