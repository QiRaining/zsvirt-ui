import { Text } from "@zstack/design";
import { Card, Col, Row } from "@zstack/zsphere-components";
import type { Script as IScript } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

interface IProps {
  detail: IScript;
}

const CustomParams: FC<IProps> = ({ detail }) => {
  const intl = useIntl();

  const { renderParams } = detail;
  const params = renderParams ? JSON.parse(renderParams) : [];

  return (
    <Card
      title={intl.formatMessage({
        id: "customParam",
        defaultMessage: "Custom Parameters",
      })}
      className={style["custom-params-card"]}
    >
      <Row gutter={20}>
        <Col span={8}>
          {intl.formatMessage({
            id: "customParam.name",
            defaultMessage: "Parameter Name",
          })}
        </Col>
        <Col span={8}>
          {intl.formatMessage({
            id: "customParam.value",
            defaultMessage: "Parameter Value",
          })}
        </Col>
        <Col span={8}>
          {intl.formatMessage({
            id: "customParam.desc",
            defaultMessage: "Description",
          })}
        </Col>
      </Row>
      {params?.map(
        (
          it: { key: string; value: string; description?: string },
          index: number,
        ) => {
          const { key, value, description } = it;
          return (
            <Row gutter={20} key={index}>
              <Col span={8}>
                <Text>{key}</Text>
              </Col>
              <Col span={8}>
                <Text>{value}</Text>
              </Col>
              <Col span={8}>
                <Text>{description}</Text>
              </Col>
            </Row>
          );
        },
      )}
    </Card>
  );
};

export default CustomParams;
