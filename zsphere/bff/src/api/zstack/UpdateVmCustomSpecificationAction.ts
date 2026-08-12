import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class UpdateVmCustomSpecificationAction extends ActionAdvance {
  async call(
    params: UpdateVmCustomSpecificationActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateVmCustomSpecificationResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateVmCustomSpecificationAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-custom-specifications/${params.uuid}/actions`,
      {
        updateVmCustomSpecification: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateVmCustomSpecificationResult>(
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

export interface UpdateVmCustomSpecificationActionParam {
  uuid: string;
  name?: string;
  description?: string;
  hostname?: string;
  rootPassword?: string;
  generateSID?: boolean;
  domainMode?: string;
  domainName?: string;
  domainUsername?: string;
  domainPassword?: string;
  organization?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateVmCustomSpecificationResult {
  inventory?: any;
}
