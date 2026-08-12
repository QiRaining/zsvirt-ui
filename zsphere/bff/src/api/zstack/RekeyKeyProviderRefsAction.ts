import { Injectable } from "@nestjs/common";
import { ActionInfo } from "./base/types";

import { ActionAdvance } from "./base/action-advance";

@Injectable()
export class RekeyKeyProviderRefsAction extends ActionAdvance {
  async call(
    params: RekeyKeyProviderRefsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RekeyKeyProviderRefsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RekeyKeyProviderRefsAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/key-providers/${params.providerUuid}/rekey`,
      {
        rekeyKeyProviderRefs: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RekeyKeyProviderRefsResult>(
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

export interface RekeyKeyProviderRefsActionParam {
  refIds?: any[];
  resourceUuids?: any[];
  resourceType?: string;
  providerUuid: string;
  rekeyAll?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RekeyKeyProviderRefsResult {}
