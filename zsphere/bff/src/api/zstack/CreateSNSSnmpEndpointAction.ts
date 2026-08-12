import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSApplicationEndpointInventory } from "./types";

@Injectable()
export class CreateSNSSnmpEndpointAction extends ActionAdvance {
  async call(
    params: CreateSNSSnmpEndpointActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateSNSApplicationEndpointResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateSNSSnmpEndpointAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/sns/application-endpoints/snmp`,
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
    return this.postAction<CreateSNSApplicationEndpointResult>(
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

export interface CreateSNSSnmpEndpointActionParam {
  name: string;
  description?: string;
  platformUuid?: string;
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

export interface CreateSNSApplicationEndpointResult {
  inventory?: SNSApplicationEndpointInventory;
}
