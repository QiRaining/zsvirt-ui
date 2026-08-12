import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetUploadSoftwarePackageJobDetailsAction extends QueryAdvance {
  async call(
    params: GetUploadSoftwarePackageJobDetailsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetUploadSoftwarePackageJobDetailsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetUploadSoftwarePackageJobDetailsAction.name,
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
      "imageId",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/software-package/upload-jobs/details/${params.softwarePackageId}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetUploadSoftwarePackageJobDetailsResult>(
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

export interface GetUploadSoftwarePackageJobDetailsActionParam {
  softwarePackageId: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
  timeout?: number;
}

export interface GetUploadSoftwarePackageJobDetailsResult {
  existingJobDetails?: any[];
}
