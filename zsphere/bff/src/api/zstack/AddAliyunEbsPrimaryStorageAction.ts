import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PrimaryStorageInventory } from "./types";

@Injectable()
export class AddAliyunEbsPrimaryStorageAction extends ActionAdvance {
  async call(
    params: AddAliyunEbsPrimaryStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddPrimaryStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddAliyunEbsPrimaryStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/primary-storage/aliyun/ebs`,
      {
        params: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
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

export interface AddAliyunEbsPrimaryStorageActionParam {
  panguPartitionUuid?: string;
  identityZoneUuid?: string;
  defaultIoType?: string;
  tdcConfigContent: string;
  url: string;
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
  inventory?: PrimaryStorageInventory;
}
