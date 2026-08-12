import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VolumeInventory } from "./types";

@Injectable()
export class CreateDataVolumeFromVolumeTemplateAction extends ActionAdvance {
  async call(
    params: CreateDataVolumeFromVolumeTemplateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateDataVolumeFromVolumeTemplateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateDataVolumeFromVolumeTemplateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/volumes/data/from/data-volume-templates/${params.imageUuid}`,
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
    return this.postAction<CreateDataVolumeFromVolumeTemplateResult>(
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

export interface CreateDataVolumeFromVolumeTemplateActionParam {
  imageUuid: string;
  name: string;
  description?: string;
  primaryStorageUuid: string;
  hostUuid?: string;
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

export interface CreateDataVolumeFromVolumeTemplateResult {
  inventory?: VolumeInventory;
}
