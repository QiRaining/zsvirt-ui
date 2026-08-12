import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSEmailAddressInventory } from "./types";

@Injectable()
export class AddEmailAddressToSNSEmailEndpointAction extends ActionAdvance {
  async call(
    params: AddEmailAddressToSNSEmailEndpointActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddEmailAddressToSNSEmailEndpointResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddEmailAddressToSNSEmailEndpointAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/sns/application-endpoints/emails/email-addresses`,
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
    return this.postAction<AddEmailAddressToSNSEmailEndpointResult>(
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

export interface AddEmailAddressToSNSEmailEndpointActionParam {
  emailAddress: string;
  endpointUuid: string;
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

export interface AddEmailAddressToSNSEmailEndpointResult {
  inventory?: SNSEmailAddressInventory;
}
