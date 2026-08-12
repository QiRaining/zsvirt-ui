import { Injectable } from '@nestjs/common';
import { ActionInfo } from './base/types';
import { VolumeInventory } from './types'

import { ActionAdvance } from './base/action-advance'

@Injectable()
export class PrimaryStorageMigrateVolumeAction extends ActionAdvance {

  async call(params: PrimaryStorageMigrateVolumeActionParam, _info: ActionInfo = {}, needRecord = true): Promise<PrimaryStorageMigrateVolumeResult> {
  const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
    _info,
    needRecord,
    PrimaryStorageMigrateVolumeAction.name,
    params,
  );
    const httpRequestPromise =  this.zsHttpService.put(`/primary-storage/volumes/${params.volumeUuid}/actions`, {
      primaryStorageMigrateVolume: params,
      systemTags: params.systemTags
    }, {
      ..._info,
      apiId,
      actionId,
      sessionId,
    });
  return this.postAction<PrimaryStorageMigrateVolumeResult>(
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

export interface PrimaryStorageMigrateVolumeActionParam {
  volumeUuid: string;
  dstPrimaryStorageUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface PrimaryStorageMigrateVolumeResult {
  inventory?: VolumeInventory;}
