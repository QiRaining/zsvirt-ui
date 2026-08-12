import { Constant } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Card, Field } from "@zstack/zsphere-components";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import type { Script as IScript } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";

interface IProps {
  detail: IScript;
  refetch?: () => void;
}

export const formatScriptTimeout = (sec: number, intl: IntlShape) => {
  if (sec < 60) {
    return {
      number: sec,
      unit: "second",
      message: intl.formatMessage(
        { id: "{n}.second", defaultMessage: "{n} seconds" },
        { n: sec },
      ),
    };
  }
  if (sec === 60) {
    return {
      number: 1,
      unit: "minute",
      message: intl.formatMessage(
        { id: "{n}.minute", defaultMessage: "{n} minutes" },
        { n: 1 },
      ),
    };
  }
  if (sec > 60 && sec < 60 * 60) {
    if (sec % 60 === 0) {
      return {
        number: sec / 60,
        unit: "minute",
        message: intl.formatMessage(
          { id: "{n}.minute", defaultMessage: "{n} minutes" },
          { n: sec / 60 },
        ),
      };
    }
    return {
      number: sec,
      unit: "second",
      message: intl.formatMessage(
        { id: "{n}.second", defaultMessage: "{n} seconds" },
        { n: sec },
      ),
    };
  }
  if (sec === 60 * 60) {
    return {
      number: 1,
      unit: "hour",
      message: intl.formatMessage(
        { id: "{n}.hour", defaultMessage: "{n} hours" },
        { n: 1 },
      ),
    };
  }
  if (sec > 60 * 60) {
    if (sec % (60 * 60) === 0) {
      return {
        number: sec / (60 * 60),
        unit: "hour",
        message: intl.formatMessage(
          { id: "{n}.hour", defaultMessage: "{n} hours" },
          { n: sec / (60 * 60) },
        ),
      };
    }
    if (sec % 60 === 0) {
      return {
        number: sec / 60,
        unit: "minute",
        message: intl.formatMessage(
          { id: "{n}.minute", defaultMessage: "{n} minutes" },
          { n: sec / 60 },
        ),
      };
    }
  }
  return {
    number: sec,
    unit: "second",
    message: intl.formatMessage(
      { id: "{n}.second", defaultMessage: "{n} seconds" },
      { n: sec },
    ),
  };
};

const BasicInfo: FC<IProps> = ({ detail, refetch }) => {
  const intl = useIntl();
  const { getServerTime } = useTime();

  const {
    uuid,
    platform,
    scriptType,
    scriptTimeout = 0,
    createDate,
    lastOpDate,
  } = detail;

  const { message } = formatScriptTimeout(scriptTimeout, intl);

  return (
    <Card
      title={intl.formatMessage({
        id: "basicInfo",
        defaultMessage: "Basic Info",
      })}
    >
      <Field
        key="platform"
        label={intl.formatMessage({
          id: "platformType",
          defaultMessage: "Platform Type",
        })}
      >
        <Constant value={platform as unknown as ConstantEnum} />
      </Field>
      <Field
        key="scriptType"
        label={intl.formatMessage({
          id: "scriptType",
          defaultMessage: "Script Type",
        })}
      >
        {scriptType}
      </Field>
      <Field
        key="scriptTimeout"
        label={intl.formatMessage({
          id: "scriptTimeout",
          defaultMessage: "Timeout Period",
        })}
      >
        {message}
      </Field>
      <Field
        label={intl.formatMessage({
          id: "uuid",
          defaultMessage: "UUID",
        })}
        copyable
        ellipsis={true}
      >
        {uuid}
      </Field>
      <Field
        label={intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        })}
      >
        {getServerTime(createDate).format("YYYY-MM-DD HH:mm:ss")}
      </Field>
      <Field
        label={intl.formatMessage({
          id: "lastOpDate",
          defaultMessage: "Last Operation Time",
        })}
      >
        {getServerTime(lastOpDate).format("YYYY-MM-DD HH:mm:ss")}
      </Field>
    </Card>
  );
};

export default BasicInfo;
