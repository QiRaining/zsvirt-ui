import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class AddResourcesToDirectoryAction extends ActionAdvance {
  async call(
    params: AddResourcesToDirectoryActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddResourcesToDirectoryResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddResourcesToDirectoryAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/add/resources/directory`,
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
    return this.postAction<AddResourcesToDirectoryResult>(
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

export interface AddResourcesToDirectoryActionParam {
  resourceUuids: any[];
  directoryUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddResourcesToDirectoryResult {}
