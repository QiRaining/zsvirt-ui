import { Row, Col, Tooltip, Space } from "antd";
import cls from "classnames";
import { slice, map } from "lodash-es";
import React, { FC } from "react";
import { useIntl } from "react-intl";

import { IResourceCapacityProgress, IResourceCapacityType } from "./type";
import { getProgressGutter, getProgressStatus } from "./util";

import "./style.less";

const ResourceCapacityProgress: FC<IResourceCapacityProgress> = ({
  type,
  progress,
  isEmpty,
}) => {
  const intl = useIntl() as any;
  const progressGutter = getProgressGutter(type);
  const isPercentage = type === IResourceCapacityType.Percentage;
  const isRatio = type === IResourceCapacityType.Ratio;
  const isDistribution = type === IResourceCapacityType.Distribution;

  const processStatus = isPercentage
    ? getProgressStatus(
        slice(map(progress, "percentage"), 0, 2) as [number, number],
      )
    : "";

  return (
    <Row
      className={cls("capacity-progress", {
        "capacity-progress-percentage": isPercentage,
        "capacity-progress-ratio": isRatio,
        "capacity-progress-distribution": isDistribution,
      })}
      gutter={progressGutter}
    >
      {isEmpty ? (
        <Col className="capacity-progress-item" flex={1}>
          <Tooltip
            title={intl.formatMessage({
              id: "no.data",
              defaultMessage: "No Data",
            })}
          >
            <div className="capacity-progress-item-inner no-data has-tooltip" />
          </Tooltip>
        </Col>
      ) : (
        progress
          .filter((progressItem) => progressItem.percentage > 0)
          .map((progressItem, progressIndex) => (
            <Col
              className={cls("capacity-progress-item", {
                [`capacity-progress-item-${processStatus}`]:
                  processStatus && isPercentage && progressIndex === 0,
                "capacity-progress-item-dash": progressItem.dash,
                [`capacity-progress-item-${progressItem.color}`]:
                  isDistribution && !!progressItem.color,
              })}
              flex={progressItem.percentage}
              key={progressIndex}
            >
              {progressItem.tooltip ? (
                <Tooltip
                  title={
                    <Space direction="vertical" size={4}>
                      {progressItem.tooltip.map((tooltipItem, tooltipIndex) => (
                        <Row justify="start" gutter={4} key={tooltipIndex}>
                          {tooltipItem.label && (
                            <Col>{tooltipItem.label}: </Col>
                          )}
                          {tooltipItem.value && <Col>{tooltipItem.value}</Col>}
                        </Row>
                      ))}
                    </Space>
                  }
                >
                  <div className="capacity-progress-item-inner has-tooltip" />
                </Tooltip>
              ) : (
                <div className="capacity-progress-item-inner" />
              )}
            </Col>
          ))
      )}
    </Row>
  );
};

export default ResourceCapacityProgress;
