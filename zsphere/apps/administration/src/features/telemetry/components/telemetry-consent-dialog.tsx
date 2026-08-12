import { Alert, Button, Checkbox, MarkdownWithHtml } from "@zstack/design";
import { DialogBase, Spinner } from "@zstack/zsphere-design-biz";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";

import type { ValidTelemetrySettingInventory } from "../consent-state";

import style from "./telemetry-consent-dialog.module.less";

const DATA_COLLECTION_STATEMENT_CONTENT_ID =
  "zstack.personal.information.authorization.letter.content";

const getLocalMessage = (
  messages: Record<string, unknown>,
  id: string,
  fallback: string,
) => {
  const message = messages[id];

  return typeof message === "string" ? message : fallback;
};

export const normalizeStatementMarkdown = (content: string) => {
  const normalized = content
    .split("\n")
    .map((line) => (/^ {4,}\S/.test(line) ? line.trimStart() : line))
    .join("\n");
  const strongParts = normalized.split("**");

  if (strongParts.length % 2 === 0) {
    return normalized;
  }

  return strongParts
    .map((part, index) => {
      if (index === 0) {
        return part;
      }

      return `${index % 2 === 1 ? "<strong>" : "</strong>"}${part}`;
    })
    .join("");
};

interface TelemetryConsentDialogProps {
  visible: boolean;
  settings: ValidTelemetrySettingInventory | null;
  settingsLoading: boolean;
  settingsError: Error | null;
  submitting: boolean;
  actionError: Error | null;
  onJoin: () => void;
  onDefer: () => void;
  onRetrySettings: () => void;
}

export const TelemetryConsentDialog = ({
  visible,
  settings,
  settingsLoading,
  settingsError,
  submitting,
  actionError,
  onJoin,
  onDefer,
  onRetrySettings,
}: TelemetryConsentDialogProps) => {
  const intl = useIntl();
  const [agreed, setAgreed] = useState(false);
  const [statementVisible, setStatementVisible] = useState(false);
  const agreementCheckboxRef = useRef<HTMLButtonElement>(null);
  const canAgree =
    Boolean(settings) && !settingsLoading && !settingsError && !submitting;
  const statementTitle = intl.formatMessage({
    id: "personal.information.authorization.letter.title",
    defaultMessage: "Data Collection Statement",
  });
  const statementContent = normalizeStatementMarkdown(
    getLocalMessage(
      intl.messages,
      DATA_COLLECTION_STATEMENT_CONTENT_ID,
      "The Data Collection Statement is not available.",
    ),
  );

  useEffect(() => {
    if (visible) {
      setAgreed(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || !canAgree) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      agreementCheckboxRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [canAgree, visible]);

  const requestVisibleChange = (nextVisible: boolean) => {
    if (!nextVisible && !submitting) {
      onDefer();
    }
  };

  const agreementLabel = (
    <span>
      {intl.formatMessage({
        id: "telemetry.dialog.agreement.prefix",
        defaultMessage: "I have read and agree to the ",
      })}
      <button
        type="button"
        className={style.linkButton}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setStatementVisible(true);
        }}
      >
        {intl.formatMessage({
          id: "telemetry.dialog.privacyAgreement",
          defaultMessage: "Personal Information Authorization",
        })}
      </button>
      {intl.formatMessage({
        id: "telemetry.dialog.agreement.suffix",
        defaultMessage: ".",
      })}
    </span>
  );

  return [
    <DialogBase
      key="telemetry-consent"
      title={intl.formatMessage({
        id: "telemetry.dialog.title",
        defaultMessage:
          "You Are Invited to Join the Experience Improvement Program",
      })}
      visible={visible}
      setVisible={requestVisibleChange}
      widthClassName="w-160"
      bodyClassName={style.body}
      footer={
        <div className={style.footer}>
          <Button variant="subtle" disabled={submitting} onClick={onDefer}>
            {intl.formatMessage({
              id: "telemetry.action.later",
              defaultMessage: "Remind Me Later",
            })}
          </Button>
          <Button
            variant="primary"
            loading={submitting}
            disabled={
              submitting ||
              settingsLoading ||
              !agreed ||
              !settings ||
              Boolean(settingsError)
            }
            onClick={onJoin}
          >
            {intl.formatMessage({
              id: "telemetry.action.joinImprovement",
              defaultMessage: "Join the Improvement Program",
            })}
          </Button>
        </div>
      }
    >
      <div className={style.content}>
        <p className={style.purpose}>
          {intl.formatMessage({
            id: "telemetry.dialog.purpose",
            defaultMessage:
              "Help us improve product performance and stability by sharing anonymous operational data from real environments.",
          })}
        </p>

        <section className={style.commitment}>
          <h3>
            {intl.formatMessage({
              id: "telemetry.dialog.commitment",
              defaultMessage: "Our Commitment",
            })}
          </h3>
          <ul>
            <li>
              {intl.formatMessage({
                id: "telemetry.dialog.collection",
                defaultMessage:
                  "We collect only anonymous product usage and runtime performance data.",
              })}
            </li>
            <li>
              {intl.formatMessage({
                id: "telemetry.dialog.exclusion",
                defaultMessage:
                  "We do not collect business data, account credentials, or directly identifying personal information.",
              })}
            </li>
            <li>
              {intl.formatMessage({
                id: "telemetry.dialog.transmission",
                defaultMessage:
                  "Telemetry data is transmitted through an encrypted HTTPS connection.",
              })}
            </li>
          </ul>
        </section>

        <p className={style.preference}>
          {intl.formatMessage({
            id: "telemetry.dialog.preference",
            defaultMessage:
              "You can change this preference at any time in System Management.",
          })}
        </p>

        {settingsLoading && <Spinner spinning />}
        {settingsError && (
          <Alert variant="danger">
            <div className={style.error}>
              <span>
                {intl.formatMessage({
                  id: "telemetry.settings.error",
                  defaultMessage: "The program agreements could not be loaded.",
                })}
              </span>
              <Button
                variant="link"
                disabled={submitting}
                onClick={onRetrySettings}
              >
                {intl.formatMessage({
                  id: "telemetry.action.retry",
                  defaultMessage: "Try Again",
                })}
              </Button>
            </div>
          </Alert>
        )}
        {actionError && (
          <Alert variant="danger">
            {intl.formatMessage({
              id: "telemetry.action.error",
              defaultMessage:
                "The Experience Improvement Program could not be updated. Try again.",
            })}
          </Alert>
        )}

        <label className={style.agreement}>
          <Checkbox
            ref={agreementCheckboxRef}
            className={style.agreementCheckbox}
            checked={agreed}
            disabled={!canAgree}
            onCheckedChange={(checked) => setAgreed(checked === true)}
          />
          <span className={style.agreementText}>{agreementLabel}</span>
        </label>
      </div>
    </DialogBase>,
    <DialogBase
      key="data-collection-statement"
      title={statementTitle}
      visible={statementVisible}
      setVisible={setStatementVisible}
      widthClassName="w-200"
      bodyClassName={style.statementBody}
      footer={
        <div className={style.footer}>
          <Button variant="primary" onClick={() => setStatementVisible(false)}>
            {intl.formatMessage({
              id: "close",
              defaultMessage: "Close",
            })}
          </Button>
        </div>
      }
    >
      <div className={style.statementContent}>
        <MarkdownWithHtml>{statementContent}</MarkdownWithHtml>
      </div>
    </DialogBase>,
  ];
};

export default TelemetryConsentDialog;
