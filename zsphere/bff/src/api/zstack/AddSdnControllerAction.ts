import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SdnControllerInventory } from "./types";

@Injectable()
export class AddSdnControllerAction extends ActionAdvance {
  async call(
    params: AddSdnControllerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddSdnControllerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddSdnControllerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/sdn-controllers`,
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
    return this.postAction<AddSdnControllerResult>(
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

export interface AddSdnControllerActionParam {
  vendorType: string;
  name: string;
  description?: string;
  ip: string;
  userName: string;
  password: string;
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

export interface AddSdnControllerResult {
  inventory?: SdnControllerInventory;
}
