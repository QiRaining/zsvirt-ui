import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ImageInventory } from "./types";

@Injectable()
export class UpdateImageAction extends ActionAdvance {
  async call(
    params: UpdateImageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateImageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateImageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/images/${params.uuid}/actions`,
      {
        updateImage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateImageResult>(
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

export interface UpdateImageActionParam {
  uuid: string;
  name?: string;
  description?: string;
  guestOsType?: string;
  mediaType?: string;
  format?: string;
  system?: boolean;
  platform?: string;
  architecture?: string;
  virtio?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateImageResult {
  inventory?: ImageInventory;
}
