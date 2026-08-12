import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';


import { QueryParam } from './base/query-base'
      import { QueryAdvance } from './base/query-advance'

@Injectable()
export class GetZMigrateGatewayVmInstancesAction extends QueryAdvance {

  async call(params: GetZMigrateGatewayVmInstancesActionParam, _info: ActionInfo = {},needRecord = true): Promise<GetZMigrateGatewayVmInstancesResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    GetZMigrateGatewayVmInstancesAction.name,
    params,
  );
    const paramString = this.genParamStringForGet(params, ['systemTags','userTags','sessionId','accessKeyId','accessKeySecret','requestIp','timeout']);
    const httpRequestPromise =  this.zsHttpService.get(`/zmigrate/vm-instances${paramString}`, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<GetZMigrateGatewayVmInstancesResult>(
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

export interface GetZMigrateGatewayVmInstancesActionParam {
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetZMigrateGatewayVmInstancesResult {
  managementVmInstanceUuid?: string;  gatewayVmInstances?: any[];}
