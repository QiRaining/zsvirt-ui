import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import {
  ThirdpartyPlatformInventory,
  ZceXThirdPartyPlatformAlertRefInventory,
} from "./types";

@Injectable()
export class CreateZceXAlertPlatformAction extends ActionAdvance {
  async call(
    params: CreateZceXAlertPlatformActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateZceXAlertPlatformResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateZceXAlertPlatformAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zce-x-plugin/${params.uuid}/alert-platform`,
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
    return this.postAction<CreateZceXAlertPlatformResult>(
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

export interface CreateZceXAlertPlatformActionParam {
  uuid: string;
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

export interface CreateZceXAlertPlatformResult {
  thirdPartyPlatform?: ThirdpartyPlatformInventory;
  inventory?: ZceXThirdPartyPlatformAlertRefInventory;
}
