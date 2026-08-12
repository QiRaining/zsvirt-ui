import { Icon } from "@zstack/icon";
import { Col, Row } from "antd";
import React, { FC, useContext } from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../../../_utils/common";
import Tag from "../../../tag";
import { SearchContext } from "./context";
import { ICondition } from "./type";

import "./style.less";

const FilterItem: FC<ICondition> = ({ name, values }) => {
  const intl = useIntl();

  const renderLabel = () => {
    if (name.extra?.i18nKey) {
      return intl.formatMessage({ id: name.extra.i18nKey });
    }
    return name.label;
  };

  const renderValues = () => {
    const items = values.map((item) => {
      if (item.extra?.i18nKey) {
        return intl.formatMessage({ id: item.extra.i18nKey });
      }
      return item.label;
    });

    const newItems: React.ReactNode[] = [];
    items.forEach((item, index) => {
      if (index > 0) {
        newItems.push(
          intl.formatMessage({ id: "comma", defaultMessage: "，" }),
        );
      }
      newItems.push(item);
    });

    if (name.type === "attribute") {
      if (newItems.length) {
        newItems.unshift(
          intl.formatMessage({ id: "colon", defaultMessage: "：" }),
        );
      }
      newItems.unshift(name.label);
    }

    return newItems;
  };

  return (
    <>
      {renderLabel()}
      {intl.formatMessage({ id: "colon", defaultMessage: "：" })}
      {renderValues()}
    </>
  );
};

const Filter: FC = () => {
  const intl = useIntl();
  const { conditions, dispatch } = useContext(SearchContext);

  return conditions && conditions.length > 0 ? (
    <Row className={getBaseCls("search-filters")} wrap={false} gutter={8}>
      <Col flex="none">
        {intl.formatMessage({ id: "filter", defaultMessage: "Filter" })}
        {intl.formatMessage({ id: "colon", defaultMessage: "：" })}
      </Col>
      <Col flex="auto">
        <Row gutter={[4, 4]} align="middle">
          {conditions.map((item) => (
            <Col key={item.name.key}>
              <Tag
                closable
                onClose={() => {
                  dispatch?.({
                    type: "remove",
                    payload: {
                      key: item.name.key,
                      type: item?.name?.type,
                    },
                  });
                }}
              >
                <FilterItem {...item} />
              </Tag>
            </Col>
          ))}
          <Col>
            <div
              className={getBaseCls("search-clear-btn")}
              onClick={() => {
                dispatch?.({
                  type: "clear",
                });
              }}
            >
              <Icon type="trash" />
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  ) : null;
};

export default Filter;
