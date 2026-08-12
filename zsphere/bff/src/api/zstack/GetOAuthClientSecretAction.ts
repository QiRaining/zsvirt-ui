import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';


import { QueryParam } from './base/query-base'
      import { QueryAdvance } from './base/query-advance'

@Injectable()
export class GetOAuthClientSecretAction extends QueryAdvance {

  async call(params: GetOAuthClientSecretActionParam, _info: ActionInfo = {},needRecord = true): Promise<GetOAuthClientSecretResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    GetOAuthClientSecretAction.name,
    params,
  );
    const paramString = this.genParamStringForGet(params, ['systemTags','userTags','sessionId','accessKeyId','accessKeySecret','requestIp','timeout','uuid']);
    const httpRequestPromise =  this.zsHttpService.get(`/oauth2/clients/${params.uuid}/client-secret${paramString}`, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<GetOAuthClientSecretResult>(
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

export interface GetOAuthClientSecretActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetOAuthClientSecretResult {
  clientSecret?: string;}
