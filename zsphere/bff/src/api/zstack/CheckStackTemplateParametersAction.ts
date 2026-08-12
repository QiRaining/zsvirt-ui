import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class CheckStackTemplateParametersAction extends ActionAdvance {
  async call(
    params: CheckStackTemplateParametersActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CheckStackTemplateParametersResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CheckStackTemplateParametersAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/cloudformation/stack/check`,
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
    return this.postAction<CheckStackTemplateParametersResult>(
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

export interface CheckStackTemplateParametersActionParam {
  type?: string;
  templateContent?: string;
  uuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CheckStackTemplateParametersResult {
  parameters?: any[];
  preparameters?: any[];
}
