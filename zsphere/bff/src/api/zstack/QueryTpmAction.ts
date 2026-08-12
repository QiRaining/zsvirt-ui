import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';


import { QueryParam } from './base/query-base'
      import { QueryAdvance } from './base/query-advance'

@Injectable()
export class QueryTpmAction extends QueryAdvance {

  async call(params: QueryParam, _info: ActionInfo = {},needRecord = true): Promise<QueryTpmResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    QueryTpmAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.get(this.buildQuery('/tpms', params), {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<QueryTpmResult>(
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

export interface QueryTpmActionParam {

  timeout?: number;
}

export interface QueryTpmResult {
  inventories?: any[];  total?: number;}
