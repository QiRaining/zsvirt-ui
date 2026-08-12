import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetInterdependentL3NetworksImagesAction extends QueryAdvance {
  async call(
    params: GetInterdependentL3NetworksImagesActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetInterdependentL3NetworkImageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetInterdependentL3NetworksImagesAction.name,
      params,
    );
    const paramString = this.genParamStringForGet(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/images-l3networks/dependencies${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetInterdependentL3NetworkImageResult>(
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

export interface GetInterdependentL3NetworksImagesActionParam {
  zoneUuid: string;
  l3NetworkUuids?: any[];
  imageUuid?: string;
  raiseException?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetInterdependentL3NetworkImageResult {
  inventories?: any[];
}
