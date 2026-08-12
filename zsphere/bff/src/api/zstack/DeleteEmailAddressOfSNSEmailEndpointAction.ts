import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DeleteEmailAddressOfSNSEmailEndpointAction extends ActionAdvance {
  async call(
    params: DeleteEmailAddressOfSNSEmailEndpointActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DeleteEmailAddressOfSNSEmailEndpointResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DeleteEmailAddressOfSNSEmailEndpointAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "endpointUuid",
      "emailAddressUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/sns/application-endpoints/emails/${params.endpointUuid}/email-addresses/${params.emailAddressUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DeleteEmailAddressOfSNSEmailEndpointResult>(
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

export interface DeleteEmailAddressOfSNSEmailEndpointActionParam {
  emailAddressUuid: string;
  endpointUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DeleteEmailAddressOfSNSEmailEndpointResult {}
