import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSEmailAddressInventory } from "./types";

@Injectable()
export class UpdateEmailAddressOfSNSEmailEndpointAction extends ActionAdvance {
  async call(
    params: UpdateEmailAddressOfSNSEmailEndpointActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateEmailAddressOfSNSEmailEndpointResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateEmailAddressOfSNSEmailEndpointAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/sns/application-endpoints/emails/email-addresses`,
      {
        updateEmailAddressOfSNSEmailEndpoint: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateEmailAddressOfSNSEmailEndpointResult>(
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

export interface UpdateEmailAddressOfSNSEmailEndpointActionParam {
  emailAddressUuid: string;
  endpointUuid: string;
  emailAddress: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateEmailAddressOfSNSEmailEndpointResult {
  inventory?: SNSEmailAddressInventory;
}
