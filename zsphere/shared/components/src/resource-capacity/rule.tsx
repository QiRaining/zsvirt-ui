import { DialogBase } from "@zstack/zsphere-design-biz";
import { Col, Row, Space } from "antd";
import React, { FC, useState } from "react";
import { useIntl } from "react-intl";

import ResourceCapacity from "../a-cloud-old-components/resource-capacity";
import { IResourceCapacityType } from "../a-cloud-old-components/resource-capacity/type";
import Text from "../a-cloud-old-components/text";

import "./style.less";
import type { ICardProps, IRuleProps } from "./type";

const Card: FC<ICardProps> = ({ title, children }) => {
  return (
    <div className="card">
      <div className="card-titleBar">
        <Space size={8} align="center" className="card-titleBar-title">
          <div className="card-titleBar-title-rect" />
          <div>{title}</div>
        </Space>
      </div>
      <div className="card-content">{children}</div>
    </div>
  );
};

const Rule: FC<IRuleProps> = ({ showCPU, showMemory, showStorage }) => {
  const intl = useIntl();
  const [visible, setVisible] = useState<boolean>(false);
  const title = intl.formatMessage({
    id: "capacity.calculation.rules",
    defaultMessage: "Capacity Calculation Rules",
  });

  return (
    <>
      <span className="action-link" onClick={() => setVisible(true)}>
        {title}
      </span>
      <DialogBase
        title={title}
        visible={visible}
        setVisible={setVisible}
        onOk={() => setVisible(false)}
      >
        <div className="modal-modalBody">
          {showCPU && (
            <Card title="CPU">
              <div className="card-formula">
                <span className="card-formula-label">
                  {intl.formatMessage({
                    id: "overallocation.calculation.formula",
                    defaultMessage: "Formula",
                  })}
                  {intl.formatMessage({ id: "colon", defaultMessage: "：" })}
                </span>
                <span className="card-formula-value">
                  {intl.formatMessage({
                    id: "cpu.overallocation.calculation.formula.value",
                    defaultMessage: " Physical CPU Total x Overcommit Ratio = Total Allocatable CPU",
                  })}
                </span>
              </div>
              <Space direction="vertical" size={12} className="card-example">
                <Row gutter={8} align="top" wrap={false}>
                  <Col className="card-example-label" flex="0 0 68px">
                    {intl.formatMessage({
                      id: "example",
                      defaultMessage: "Example",
                    })}
                    {intl.formatMessage({ id: "colon", defaultMessage: "：" })}
                  </Col>
                  <Col className="card-example-value" flex={1}>
                    {intl.formatMessage({
                      id: "cpu.overallocation.calculation.example",
                      defaultMessage:
                        "If the Physical CPU Total is 100 cores and the Overcommit Ratio is 2:1, then the Total Allocatable CPU is 200 cores.",
                    })}
                  </Col>
                </Row>
                <Row gutter={8} align="top">
                  <Col className="card-example-label" flex="0 0 68px">
                    {intl.formatMessage({
                      id: "before.overallocation",
                      defaultMessage: "Before",
                    })}
                    {intl.formatMessage({ id: "colon", defaultMessage: "：" })}
                  </Col>
                  <Col className="card-example-value" flex={1}>
                    <Row>
                      <Col span={12}>
                        <div className="card-example-capacity">
                          <ResourceCapacity
                            type={IResourceCapacityType.Distribution}
                            progress={[
                              {
                                percentage: 1,
                                color: "info",
                              },
                            ]}
                          />
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row gutter={8} align="top">
                  <Col className="card-example-label" flex="0 0 68px">
                    {intl.formatMessage({
                      id: "after.overallocation",
                      defaultMessage: "After",
                    })}
                    {intl.formatMessage({ id: "colon", defaultMessage: "：" })}
                  </Col>
                  <Col className="card-example-value" flex={1}>
                    <div className="card-example-capacity">
                      <ResourceCapacity
                        type={IResourceCapacityType.Distribution}
                        progress={[
                          {
                            percentage: 1,
                            color: "info",
                          },
                          {
                            percentage: 1,
                            color: "positive",
                          },
                        ]}
                      />
                    </div>
                    <Row gutter={1}>
                      <Col span={12}>
                        <div className="card-example-line" />
                        <div className="card-example-lineName">
                          {intl.formatMessage({
                            id: "total.physical.cpu",
                            defaultMessage: "Physical CPU Total",
                          })}
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="card-example-line" />
                        <div className="card-example-lineName">
                          {intl.formatMessage({
                            id: "overallocated.cpu",
                            defaultMessage: "Overcommitted CPU",
                          })}
                        </div>
                      </Col>
                    </Row>
                    <div className="card-example-line" />
                    <div className="card-example-lineName">
                      {intl.formatMessage({
                        id: "total.allocatable.cpu.amount",
                        defaultMessage: "Total Allocatable CPU",
                      })}
                    </div>
                  </Col>
                </Row>
              </Space>
            </Card>
          )}
          {showMemory && (
            <Card
              title={intl.formatMessage({
                id: "memory",
                defaultMessage: "Memory",
              })}
            >
              <div className="card-formula">
                <span className="card-formula-label">
                  {intl.formatMessage({
                    id: "overallocation.calculation.formula",
                    defaultMessage: "Formula",
                  })}
                  {intl.formatMessage({ id: "colon", defaultMessage: "：" })}
                </span>
                <span className="card-formula-value">
                  {intl.formatMessage({
                    id: "memory.overallocation.calculation.formula.value",
                    defaultMessage:
                      " (Physical Memory Total − Reserved Memory) × Overcommit Ratio = Total Allocatable Memory",
                  })}
                </span>
              </div>
              <Space direction="vertical" size={12} className="card-example">
                <Row gutter={8} align="top" wrap={false}>
                  <Col className="card-example-label" flex="0 0 68px">
                    {intl.formatMessage({
                      id: "example",
                      defaultMessage: "Example",
                    })}
                    {intl.formatMessage({ id: "colon", defaultMessage: "：" })}
                  </Col>
                  <Col className="card-example-value" flex={1}>
                    {intl.formatMessage({
                      id: "memory.overallocation.calculation.example",
                      defaultMessage:
                        "If the Physical Memory Total is 540 GB and the Reserved Memory is 40 GB, then the Overcommitable Memory is 500 GB. With an Overcommit Ratio of 2:1, the Total Allocatable Memory is 1,000 GB.",
                    })}
                  </Col>
                </Row>
                <Row gutter={8} align="top">
                  <Col className="card-example-label" flex="0 0 68px">
                    {intl.formatMessage({
                      id: "before.overallocation",
                      defaultMessage: "Before",
                    })}
                    {intl.formatMessage({ id: "colon", defaultMessage: "：" })}
                  </Col>
                  <Col className="card-example-value" flex={1}>
                    <Row gutter={1}>
                      <Col flex={242}>
                        <div className="card-example-capacity">
                          <ResourceCapacity
                            type={IResourceCapacityType.Distribution}
                            progress={[
                              {
                                percentage: 48,
                                color: "disabled",
                                tooltip: [
                                  {
                                    value: (
                                      <span>
                                        {intl.formatMessage({
                                          id: "reserved.memory",
                                          defaultMessage: "Reserved Memory",
                                        })}
                                      </span>
                                    ),
                                  },
                                  {
                                    value: (
                                      <span>
                                        {intl.formatMessage({
                                          id: "memory.reserved.capacity.desc",
                                          defaultMessage:
                                            "Memory used for system service runtime.",
                                        })}
                                      </span>
                                    ),
                                  },
                                ],
                              },
                              {
                                percentage: 193,
                                color: "info",
                              },
                            ]}
                          />
                        </div>
                      </Col>
                      <Col flex={193} />
                    </Row>
                  </Col>
                </Row>
                <Row gutter={8} align="top">
                  <Col className="card-example-label" flex="0 0 68px">
                    {intl.formatMessage({
                      id: "after.overallocation",
                      defaultMessage: "After",
                    })}
                    {intl.formatMessage({ id: "colon", defaultMessage: "：" })}
                  </Col>
                  <Col className="card-example-value" flex={1}>
                    <div className="card-example-capacity">
                      <ResourceCapacity
                        type={IResourceCapacityType.Distribution}
                        progress={[
                          {
                            percentage: 48,
                            color: "disabled",
                            tooltip: [
                              {
                                value: (
                                  <span>
                                    {intl.formatMessage({
                                      id: "reserved.memory",
                                      defaultMessage: "Reserved Memory",
                                    })}
                                  </span>
                                ),
                              },
                              {
                                value: (
                                  <span>
                                    {intl.formatMessage({
                                      id: "memory.reserved.capacity.desc",
                                      defaultMessage: "Memory used for system service runtime.",
                                    })}
                                  </span>
                                ),
                              },
                            ],
                          },
                          {
                            percentage: 193,
                            color: "info",
                          },
                          {
                            percentage: 193,
                            color: "positive",
                          },
                        ]}
                      />
                    </div>
                    <Row gutter={1}>
                      <Col flex={48} style={{ width: 0 }}>
                        <div className="card-example-line" />
                        <div
                          className="card-example-lineName"
                          style={{ minWidth: 48 }}
                        >
                          <Text
                            style={{ color: "var(--neutral-600)" }}
                            value={intl.formatMessage({
                              id: "reserved.memory",
                              defaultMessage: "Reserved Memory",
                            })}
                          />
                        </div>
                      </Col>
                      <Col flex={193} style={{ width: 0 }}>
                        <div className="card-example-line" />
                        <div className="card-example-lineName">
                          {intl.formatMessage({
                            id: "overallocatable.memory",
                            defaultMessage: "Overcommitable Memory",
                          })}
                        </div>
                      </Col>
                      <Col flex={193} style={{ width: 0 }}>
                        <div className="card-example-line" />
                        <div className="card-example-lineName">
                          {intl.formatMessage({
                            id: "overallocated.memory",
                            defaultMessage: "Overcommitted Memory",
                          })}
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={1}>
                      <Col flex={242} style={{ width: 0 }}>
                        <div className="card-example-line" />
                        <div className="card-example-lineName">
                          {intl.formatMessage({
                            id: "total.physical.memory.amount",
                            defaultMessage: "Physical Memory Total",
                          })}
                        </div>
                      </Col>
                      <Col flex={193} style={{ width: 0 }} />
                    </Row>
                    <Row gutter={1}>
                      <Col flex={48} style={{ width: 0 }} />
                      <Col flex={387} style={{ width: 0 }}>
                        <div className="card-example-line" />
                        <div className="card-example-lineName">
                          {intl.formatMessage({
                            id: "total.allocatable.memory.amount",
                            defaultMessage: "Total Allocatable Memory",
                          })}
                        </div>
                      </Col>
                    </Row>
                    <div className="card-example-line" />
                    <div className="card-example-lineName">
                      {intl.formatMessage({
                        id: "total.overallocated.memory.amount",
                        defaultMessage: "Overcommitted Memory Total",
                      })}
                    </div>
                  </Col>
                </Row>
              </Space>
            </Card>
          )}
          {showStorage && (
            <Card
              title={intl.formatMessage({
                id: "storage",
                defaultMessage: "Storage",
              })}
            >
              <div className="card-formula">
                <span className="card-formula-label">
                  {intl.formatMessage({
                    id: "overallocation.calculation.formula",
                    defaultMessage: "Formula",
                  })}
                  {intl.formatMessage({ id: "colon", defaultMessage: "：" })}
                </span>
                <span className="card-formula-value">
                  {intl.formatMessage({
                    id: " storage.overallocation.calculation.formula.value",
                    defaultMessage:
                      "(Total Physical Storage - Reserved Capacity = Overcommittable Storage) x Overcommit Ratio = Total Allocatable Storage",
                  })}
                </span>
              </div>
              <Space direction="vertical" size={12} className="card-example">
                <Row gutter={8} align="top" wrap={false}>
                  <Col className="card-example-label" flex="0 0 68px">
                    {intl.formatMessage({
                      id: "example",
                      defaultMessage: "Example",
                    })}
                    {intl.formatMessage({ id: "colon", defaultMessage: "：" })}
                  </Col>
                  <Col className="card-example-value" flex={1}>
                    {intl.formatMessage({
                      id: "storage.overallocation.calculation.example",
                      defaultMessage:
                        "If the Physical Storage Total is 540 GB and the Reserved Capacity is 40 GB, then the Overcommitable Storage is 500 GB. With an Overcommit Ratio of 2:1, the Total Allocatable Storage is 1,000 GB.",
                    })}
                  </Col>
                </Row>
                <Row gutter={8} align="top">
                  <Col className="card-example-label" flex="0 0 68px">
                    {intl.formatMessage({
                      id: "before.overallocation",
                      defaultMessage: "Before",
                    })}
                    {intl.formatMessage({ id: "colon", defaultMessage: "：" })}
                  </Col>
                  <Col className="card-example-value" flex={1}>
                    <Row gutter={1}>
                      <Col flex={242}>
                        <div className="card-example-capacity">
                          <ResourceCapacity
                            type={IResourceCapacityType.Distribution}
                            progress={[
                              {
                                percentage: 48,
                                color: "disabled",
                                tooltip: [
                                  {
                                    value: (
                                      <span>
                                        {intl.formatMessage({
                                          id: "reserved.capacity",
                                          defaultMessage: "Reserved Capacity",
                                        })}
                                      </span>
                                    ),
                                  },
                                  {
                                    value: (
                                      <span>
                                        {intl.formatMessage({
                                          id: "storage.reserved.capacity.desc",
                                          defaultMessage:
                                            "The memory capacity required to ensure normal operation of the host system. Local storage reserved capacity = reserved capacity for local storage per host * number of hosts.",
                                        })}
                                      </span>
                                    ),
                                  },
                                ],
                              },
                              {
                                percentage: 193,
                                color: "info",
                              },
                            ]}
                          />
                        </div>
                      </Col>
                      <Col flex={193} />
                    </Row>
                  </Col>
                </Row>
                <Row gutter={8} align="top">
                  <Col className="card-example-label" flex="0 0 68px">
                    {intl.formatMessage({
                      id: "after.overallocation",
                      defaultMessage: "After",
                    })}
                    {intl.formatMessage({ id: "colon", defaultMessage: "：" })}
                  </Col>
                  <Col className="card-example-value" flex={1}>
                    <div className="card-example-capacity">
                      <ResourceCapacity
                        type={IResourceCapacityType.Distribution}
                        progress={[
                          {
                            percentage: 48,
                            color: "disabled",
                            tooltip: [
                              {
                                value: (
                                  <span>
                                    {intl.formatMessage({
                                      id: "reserved.capacity",
                                      defaultMessage: "Reserved Capacity",
                                    })}
                                  </span>
                                ),
                              },
                              {
                                value: (
                                  <span>
                                    {intl.formatMessage({
                                      id: "storage.reserved.capacity.desc",
                                      defaultMessage:
                                        "The memory capacity required to ensure normal operation of the host system. Local storage reserved capacity = reserved capacity for local storage per host * number of hosts.",
                                    })}
                                  </span>
                                ),
                              },
                            ],
                          },
                          {
                            percentage: 193,
                            color: "info",
                          },
                          {
                            percentage: 193,
                            color: "positive",
                          },
                        ]}
                      />
                    </div>
                    <Row gutter={1}>
                      <Col flex={48} style={{ width: 0 }}>
                        <div className="card-example-line" />
                        <div
                          className="card-example-lineName"
                          style={{ minWidth: 48 }}
                        >
                          <Text
                            style={{ color: "var(--neutral-600)" }}
                            value={intl.formatMessage({
                              id: "reserved.capacity",
                              defaultMessage: "Reserved Capacity",
                            })}
                          />
                        </div>
                      </Col>
                      <Col flex={193} style={{ width: 0 }}>
                        <div className="card-example-line" />
                        <div className="card-example-lineName">
                          {intl.formatMessage({
                            id: "overallocatable.storage",
                            defaultMessage: "Overcommitable Storage",
                          })}
                        </div>
                      </Col>
                      <Col flex={193} style={{ width: 0 }}>
                        <div className="card-example-line" />
                        <div className="card-example-lineName">
                          {intl.formatMessage({
                            id: "overallocated.storage",
                            defaultMessage: "Overcommitted storage",
                          })}
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={1}>
                      <Col flex={242} style={{ width: 0 }}>
                        <div className="card-example-line" />
                        <div className="card-example-lineName">
                          {intl.formatMessage({
                            id: "total.physical.storage.amount",
                            defaultMessage: "Physical Storage Total",
                          })}
                        </div>
                      </Col>
                      <Col flex={193} style={{ width: 0 }} />
                    </Row>
                    <Row gutter={1}>
                      <Col flex={48} style={{ width: 0 }} />
                      <Col flex={387} style={{ width: 0 }}>
                        <div className="card-example-line" />
                        <div className="card-example-lineName">
                          {intl.formatMessage({
                            id: "total.allocatable.storage.amount",
                            defaultMessage: "Total Allocatable Storage",
                          })}
                        </div>
                      </Col>
                    </Row>
                    <div className="card-example-line" />
                    <div className="card-example-lineName">
                      {intl.formatMessage({
                        id: "total.overallocated.storage.amount",
                        defaultMessage: "Overcommitted Storage Total",
                      })}
                    </div>
                  </Col>
                </Row>
              </Space>
            </Card>
          )}
        </div>
      </DialogBase>
    </>
  );
};

export default Rule;
