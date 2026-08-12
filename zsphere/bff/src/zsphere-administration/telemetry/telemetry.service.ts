import { Inject, Injectable } from "@nestjs/common";
import { CONTEXT } from "@nestjs/graphql";
import { InjectModel } from "@nestjs/sequelize";
import { ApolloError } from "apollo-server-errors";

import { CheckTelemetryUpdateAction } from "@/api/zstack/CheckTelemetryUpdateAction";
import { GetTelemetryConsentAction } from "@/api/zstack/GetTelemetryConsentAction";
import { GetTelemetrySettingsAction } from "@/api/zstack/GetTelemetrySettingsAction";
import Constant from "@/common/const";
import { Identity } from "@/identity/model/login.model";
import { ZsSession } from "@/model/zs-session.model";

import { TELEMETRY_CONSENT_UUID } from "./telemetry.model";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getStringValue = (
  record: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = record[key];

  return typeof value === "string" ? value : undefined;
};

export const normalizeTelemetryUpdateError = (error: unknown) => {
  if (error instanceof Error) {
    return error;
  }

  if (isRecord(error) && isRecord(error.error)) {
    const apiError = error.error;
    const code = getStringValue(apiError, "code");
    const description = getStringValue(apiError, "description");
    const details = getStringValue(apiError, "details");
    const i18nDetails = getStringValue(apiError, "i18nDetails");

    return new ApolloError(
      description || details || "Telemetry update check failed",
      code || "TELEMETRY_UPDATE_CHECK_FAILED",
      {
        details,
        i18nDetails,
      },
    );
  }

  return new ApolloError(
    "Telemetry update check failed",
    "TELEMETRY_UPDATE_CHECK_FAILED",
  );
};

@Injectable()
export class TelemetryAccessService {
  @Inject(CONTEXT) private readonly context;
  @InjectModel(ZsSession) private readonly zsSession: typeof ZsSession;

  async assertSystemAdmin(): Promise<void> {
    const sessionId =
      this.context?.req?.headers?.["x-session-id"] ??
      this.context?.headers?.["x-session-id"];
    const session = await this.zsSession.findOne({
      where: {
        sessionId,
      },
    });

    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`);
    }

    if (
      session.accountId !== Constant.zsvRoleMap.ADMIN_UUID ||
      session.identity !== Identity.Admin
    ) {
      throw new ApolloError("无 UI 权限", "FORBIDDEN", {
        statusCode: 403,
      });
    }
  }
}

@Injectable()
export class TelemetryService {
  @Inject()
  telemetryAccessService: TelemetryAccessService;

  @Inject()
  getTelemetryConsentAction: GetTelemetryConsentAction;

  @Inject()
  getTelemetrySettingsAction: GetTelemetrySettingsAction;

  @Inject()
  checkTelemetryUpdateAction: CheckTelemetryUpdateAction;

  async getTelemetryConsent() {
    await this.telemetryAccessService.assertSystemAdmin();
    const { inventory } = await this.getTelemetryConsentAction.call({});

    return {
      ...inventory,
      uuid: TELEMETRY_CONSENT_UUID,
    };
  }

  async getTelemetrySettings() {
    await this.telemetryAccessService.assertSystemAdmin();
    const { inventory } = await this.getTelemetrySettingsAction.call({});

    return inventory;
  }

  async checkTelemetryUpdate() {
    try {
      const { inventory } = await this.checkTelemetryUpdateAction.call({});

      return inventory ?? {};
    } catch (error) {
      throw normalizeTelemetryUpdateError(error);
    }
  }
}
