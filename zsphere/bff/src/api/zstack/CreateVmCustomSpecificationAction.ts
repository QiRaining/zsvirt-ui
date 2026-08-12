import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class CreateVmCustomSpecificationAction extends ActionAdvance {
  async call(
    params: CreateVmCustomSpecificationActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateVmCustomSpecificationResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateVmCustomSpecificationAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/vm-custom-specifications`,
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
    return this.postAction<CreateVmCustomSpecificationResult>(
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

export interface CreateVmCustomSpecificationActionParam {
  name: string;
  description?: string;
  platform: string;
  hostname?: string;
  rootPassword?: string;
  generateSID?: boolean;
  domainMode?: string;
  domainName?: string;
  domainUsername?: string;
  domainPassword?: string;
  organization?: string;
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

export interface CreateVmCustomSpecificationResult {
  inventory?: any;
}
