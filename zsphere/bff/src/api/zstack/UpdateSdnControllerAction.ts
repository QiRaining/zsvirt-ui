import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SdnControllerInventory } from "./types";

@Injectable()
export class UpdateSdnControllerAction extends ActionAdvance {
  async call(
    params: UpdateSdnControllerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSdnControllerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSdnControllerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/sdn-controllers/${params.uuid}/actions`,
      {
        updateSdnController: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateSdnControllerResult>(
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

export interface UpdateSdnControllerActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateSdnControllerResult {
  inventory?: SdnControllerInventory;
}
