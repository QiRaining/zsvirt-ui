jest.mock("@/base/action-service", () => ({
  ActionService: class ActionService {
    protected actionHelper = jest.fn();
  },
}));

jest.mock("@nestjs/sequelize", () => ({
  InjectModel: () => () => undefined,
}));

jest.mock("@/model/zs-session.model", () => ({
  ZsSession: class ZsSession {},
}));

jest.mock("@/api/zstack/GetTelemetryConsentAction", () => ({
  GetTelemetryConsentAction: class GetTelemetryConsentAction {},
}));

jest.mock("@/api/zstack/GetTelemetrySettingsAction", () => ({
  GetTelemetrySettingsAction: class GetTelemetrySettingsAction {},
}));

jest.mock("@/api/zstack/CheckTelemetryUpdateAction", () => ({
  CheckTelemetryUpdateAction: class CheckTelemetryUpdateAction {},
}));

jest.mock("@/api/zstack/UpdateTelemetryConsentAction", () => ({
  TelemetryConsentActionValue: {
    Enabled: "Enabled",
    Disabled: "Disabled",
  },
  UpdateTelemetryConsentAction: class UpdateTelemetryConsentAction {},
}));

import Constant from "@/common/const";
import { Identity } from "@/identity/model/login.model";

import { TelemetryActionService } from "./telemetry.action";
import { TelemetryConsentAction } from "./telemetry.model";
import {
  normalizeTelemetryUpdateError,
  TelemetryAccessService,
  TelemetryService,
} from "./telemetry.service";

interface TestActionHelper {
  actionHelper: jest.Mock;
}

interface TestTelemetryAccessDependencies {
  context: {
    req: {
      headers: {
        "x-session-id": string;
      };
    };
  };
  zsSession: {
    findOne: jest.Mock;
  };
}

const getActionHelper = (service: TelemetryActionService): jest.Mock =>
  (service as unknown as TestActionHelper).actionHelper;

const createAccessService = () => {
  const service = new TelemetryAccessService();
  const dependencies: TestTelemetryAccessDependencies = {
    context: {
      req: {
        headers: {
          "x-session-id": "session-uuid",
        },
      },
    },
    zsSession: {
      findOne: jest.fn().mockResolvedValue({
        accountId: Constant.zsvRoleMap.ADMIN_UUID,
        identity: Identity.Admin,
      }),
    },
  };

  Object.assign(service, dependencies);

  return {
    service,
    sessionModel: dependencies.zsSession,
  };
};

describe("TelemetryService", () => {
  const createService = () => {
    const service = new TelemetryService();
    const { service: telemetryAccessService, sessionModel } =
      createAccessService();
    const getTelemetryConsentAction = {
      call: jest.fn().mockResolvedValue({
        inventory: { consentGrantedAt: "None" },
      }),
    };
    const getTelemetrySettingsAction = {
      call: jest.fn().mockResolvedValue({
        inventory: {
          descriptionKey: "telemetry.setting.description",
          privacyPolicyUrl: "https://example.com/privacy",
        },
      }),
    };
    const checkTelemetryUpdateAction = {
      call: jest.fn().mockResolvedValue({
        inventory: {
          version: "5.2.0",
          currentVersion: "5.1.0",
          releaseNotesZh: "版本更新内容",
          releaseNotesEn: "Release notes",
        },
      }),
    };

    Object.assign(service, {
      telemetryAccessService,
      getTelemetryConsentAction,
      getTelemetrySettingsAction,
      checkTelemetryUpdateAction,
    });

    return {
      service,
      sessionModel,
      getTelemetryConsentAction,
      getTelemetrySettingsAction,
      checkTelemetryUpdateAction,
    };
  };

  it("queries consent only after validating the built-in Admin session", async () => {
    const { service, sessionModel, getTelemetryConsentAction } =
      createService();

    await expect(service.getTelemetryConsent()).resolves.toEqual({
      consentGrantedAt: "None",
      uuid: "telemetry-consent",
    });
    expect(sessionModel.findOne).toHaveBeenCalledWith({
      where: { sessionId: "session-uuid" },
    });
    expect(getTelemetryConsentAction.call).toHaveBeenCalledWith({});
  });

  it("queries settings through the generated SDK class", async () => {
    const { service, getTelemetrySettingsAction } = createService();

    await expect(service.getTelemetrySettings()).resolves.toEqual({
      descriptionKey: "telemetry.setting.description",
      privacyPolicyUrl: "https://example.com/privacy",
    });
    expect(getTelemetrySettingsAction.call).toHaveBeenCalledWith({});
  });

  it("checks telemetry update through the generated SDK class", async () => {
    const { service, sessionModel, checkTelemetryUpdateAction } =
      createService();

    await expect(service.checkTelemetryUpdate()).resolves.toEqual({
      version: "5.2.0",
      currentVersion: "5.1.0",
      releaseNotesZh: "版本更新内容",
      releaseNotesEn: "Release notes",
    });
    expect(sessionModel.findOne).not.toHaveBeenCalled();
    expect(checkTelemetryUpdateAction.call).toHaveBeenCalledWith({});
  });

  it.each([
    {
      accountId: "platform-admin-account",
      identity: Identity.Admin,
    },
    {
      accountId: Constant.zsvRoleMap.ADMIN_UUID,
      identity: Identity.IAM1SystemAdmin,
    },
    {
      accountId: Constant.zsvRoleMap.ADMIN_UUID,
      identity: Identity.IAM2SystemAdmin,
    },
  ])("rejects a non built-in Admin session: %o", async (session) => {
    const { service, sessionModel, getTelemetryConsentAction } =
      createService();
    sessionModel.findOne.mockResolvedValue(session);

    await expect(service.getTelemetryConsent()).rejects.toMatchObject({
      extensions: {
        code: "FORBIDDEN",
      },
    });
    expect(getTelemetryConsentAction.call).not.toHaveBeenCalled();
  });

  it("rejects an unknown session before calling an SDK class", async () => {
    const { service, sessionModel, getTelemetrySettingsAction } =
      createService();
    sessionModel.findOne.mockResolvedValue(null);

    await expect(service.getTelemetrySettings()).rejects.toThrow(
      "Invalid sessionId [session-uuid]",
    );
    expect(getTelemetrySettingsAction.call).not.toHaveBeenCalled();
  });

  it("does not normalize or swallow SDK query failures", async () => {
    const { service, getTelemetryConsentAction } = createService();
    const contractError = new Error("TELEMETRY.1000");
    getTelemetryConsentAction.call.mockRejectedValue(contractError);

    await expect(service.getTelemetryConsent()).rejects.toBe(contractError);
  });

  it("keeps Error instances from telemetry update failures", async () => {
    const { service, checkTelemetryUpdateAction } = createService();
    const contractError = new Error("TELEMETRY.4001");
    checkTelemetryUpdateAction.call.mockRejectedValue(contractError);

    await expect(service.checkTelemetryUpdate()).rejects.toBe(contractError);
  });

  it("normalizes non-Error telemetry update failures for GraphQL", async () => {
    const { service, checkTelemetryUpdateAction } = createService();
    checkTelemetryUpdateAction.call.mockRejectedValue({
      name: "apiError",
      error: {
        code: "TELEMETRY.4001",
        description: "Telemetry Cloud is unreachable",
        details:
          "telemetry cloud POST https://192.0.2.124:11443/v1/updates/check failed",
        i18nDetails:
          "telemetry cloud POST https://192.0.2.124:11443/v1/updates/check failed",
      },
    });

    await expect(service.checkTelemetryUpdate()).rejects.toMatchObject({
      message: "Telemetry Cloud is unreachable",
      extensions: {
        code: "TELEMETRY.4001",
        details:
          "telemetry cloud POST https://192.0.2.124:11443/v1/updates/check failed",
      },
    });
  });

  it("normalizes unknown telemetry update failures for GraphQL", () => {
    expect(normalizeTelemetryUpdateError({ name: "apiError" })).toMatchObject({
      message: "Telemetry update check failed",
      extensions: {
        code: "TELEMETRY_UPDATE_CHECK_FAILED",
      },
    });
  });
});

describe("TelemetryConsentAction", () => {
  it("keeps the GraphQL consent enum aligned with the REST contract", () => {
    expect(TelemetryConsentAction.Enabled).toBe("Enabled");
    expect(TelemetryConsentAction.Disabled).toBe("Disabled");
  });

  const createActionService = () => {
    const service = new TelemetryActionService();
    const { service: telemetryAccessService, sessionModel } =
      createAccessService();
    const updateTelemetryConsentAction = {
      call: jest.fn().mockResolvedValue({
        inventory: {
          consentGrantedAt: "None",
        },
      }),
    };

    Object.assign(service, {
      telemetryAccessService,
      updateTelemetryConsentAction,
    });

    return {
      service,
      sessionModel,
      updateTelemetryConsentAction,
    };
  };

  it("submits Enabled with explicit agreement through actionHelper", async () => {
    const { service, updateTelemetryConsentAction } = createActionService();
    const input = {
      payload: {
        action: TelemetryConsentAction.Enabled,
        agreedToTerms: true,
      },
      action: {
        actionId: "action-uuid",
        name: "telemetry.enable",
        total: 1,
      },
    };

    await expect(service.updateTelemetryConsent(input)).resolves.toEqual({
      actionId: "action-uuid",
    });
    expect(getActionHelper(service)).toHaveBeenCalledWith(
      input,
      "TelemetryConsentInventory",
      expect.any(Function),
    );

    const actionFn = getActionHelper(service).mock.calls[0][2];
    await expect(actionFn(input.payload, "task-uuid")).resolves.toMatchObject({
      id: "telemetry-consent",
      fields: "consentGrantedAt",
      inventory: {
        consentGrantedAt: "None",
        uuid: "telemetry-consent",
      },
    });
    expect(updateTelemetryConsentAction.call).toHaveBeenCalledWith(
      {
        action: "Enabled",
        agreedToTerms: true,
      },
      {
        actionId: "action-uuid",
        taskId: "task-uuid",
      },
    );
  });

  it("submits Disabled without agreedToTerms", async () => {
    const { service, updateTelemetryConsentAction } = createActionService();
    const input = {
      payload: {
        action: TelemetryConsentAction.Disabled,
        agreedToTerms: true,
      },
      action: {
        actionId: "action-uuid",
        name: "telemetry.disable",
        total: 1,
      },
    };

    await service.updateTelemetryConsent(input);
    const actionFn = getActionHelper(service).mock.calls[0][2];
    await actionFn(input.payload, "task-uuid");

    expect(updateTelemetryConsentAction.call).toHaveBeenCalledWith(
      {
        action: "Disabled",
      },
      {
        actionId: "action-uuid",
        taskId: "task-uuid",
      },
    );
  });

  it("rejects non-Admin mutation before scheduling an action", async () => {
    const { service, sessionModel, updateTelemetryConsentAction } =
      createActionService();
    sessionModel.findOne.mockResolvedValue({
      accountId: "other-account",
      identity: Identity.Admin,
    });

    await expect(
      service.updateTelemetryConsent({
        payload: {
          action: TelemetryConsentAction.Disabled,
        },
        action: {
          actionId: "action-uuid",
          name: "telemetry.disable",
          total: 1,
        },
      }),
    ).rejects.toMatchObject({
      extensions: {
        code: "FORBIDDEN",
      },
    });
    expect(getActionHelper(service)).not.toHaveBeenCalled();
    expect(updateTelemetryConsentAction.call).not.toHaveBeenCalled();
  });
});
