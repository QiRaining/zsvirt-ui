import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';


import { QueryParam } from './base/query-base'
      import { QueryAdvance } from './base/query-advance'

@Injectable()
export class ScanVmInstanceMetadataFromPrimaryStorageAction extends QueryAdvance {

  async call(params: ScanVmInstanceMetadataFromPrimaryStorageActionParam, _info: ActionInfo = {},needRecord = true): Promise<ScanVmInstanceMetadataFromPrimaryStorageResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    ScanVmInstanceMetadataFromPrimaryStorageAction.name,
    params,
  );
    const paramString = this.genParamStringForGet(params, ['systemTags','userTags','sessionId','accessKeyId','accessKeySecret','requestIp','timeout']);
    const httpRequestPromise =  this.zsHttpService.get(`/primary-storage/vm-instances/metadata/scan${paramString}`, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<ScanVmInstanceMetadataFromPrimaryStorageResult>(
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

export interface ScanVmInstanceMetadataFromPrimaryStorageActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ScanVmInstanceMetadataFromPrimaryStorageResult {
  vmInstanceMetadata?: any[];}
