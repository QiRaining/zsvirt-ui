import { Row, Col, Space } from "antd";
import cls from "classnames";
import React, { FC } from "react";

import type { ICardProps } from "./type";

import "./style.less";

const Card: FC<ICardProps> = ({
  title,
  extra,
  indented = true,
  children,
  showLine = false,
  className,
  titleClassName,
  ...rest
}) => {
  return (
    <div {...rest} className={cls("card", { indented, showLine }, className)}>
      {title && (
        <Row className="card-titleBar" gutter={8} justify="space-between">
          <Col>
            <Space
              size={8}
              align="center"
              className={cls("card-titleBar-title", titleClassName)}
            >
              <div className="card-titleBar-title-rect" />
              <div>{title}</div>
            </Space>
          </Col>
          {extra && <Col>{extra}</Col>}
        </Row>
      )}
      <div className="card-content">{children}</div>
    </div>
  );
};

export default Card;
