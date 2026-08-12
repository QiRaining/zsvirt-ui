import { createMockIntl } from "@zstack/form/testing";
import { Decrypt } from "@zstack/utils";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_LOG_SERVER_FORM_VALUES,
  buildLogServerConfiguration,
  createAddLogServerSchema,
  createUpdateLogServerSchema,
  getDeliveryTargetOptions,
  getLogServerValuesAfterDeliveryTargetChange,
  getLogServerValuesAfterLogTypeChange,
  parseLogServerLabelValue,
} from "../schema";

const intl = createMockIntl();

describe("log server PRD schema", () => {
  it("uses PRD default values when opening the add dialog", () => {
    expect(DEFAULT_LOG_SERVER_FORM_VALUES).toMatchObject({
      name: "",
      description: "",
      logType: "management",
      deliveryTarget: "Syslog",
      host: "",
      port: "514",
      protocol: "UDP",
      facility: "LOCAL0",
      severity: "WARN",
      esIndex: "",
      esTls: false,
      esUsername: "",
      esPassword: "",
      kafkaTopics: "",
      lokiLabelsJob: "job=operator",
      lokiTls: false,
      lokiUsername: "",
      lokiPassword: "",
    });
  });

  it("limits delivery targets by log type and applies recommended ports", () => {
    expect(getDeliveryTargetOptions("management")).toEqual(["Syslog"]);
    expect(getDeliveryTargetOptions("platform")).toEqual([
      "Syslog",
      "Elasticsearch",
      "Forward",
      "Kafka",
      "Loki",
    ]);

    expect(
      getLogServerValuesAfterLogTypeChange(
        {
          ...DEFAULT_LOG_SERVER_FORM_VALUES,
          deliveryTarget: "Kafka",
          port: "9092",
        },
        "management",
      ),
    ).toMatchObject({
      logType: "management",
      deliveryTarget: "Syslog",
      port: "514",
    });

    expect(
      getLogServerValuesAfterDeliveryTargetChange(
        {
          ...DEFAULT_LOG_SERVER_FORM_VALUES,
          logType: "platform",
        },
        "Elasticsearch",
      ),
    ).toMatchObject({
      logType: "platform",
      deliveryTarget: "Elasticsearch",
      port: "9200",
    });
  });

  it("accepts all PRD field combinations", () => {
    const schema = createAddLogServerSchema(intl);
    const base = {
      ...DEFAULT_LOG_SERVER_FORM_VALUES,
      name: "log-server",
      host: "192.168.0.1/example/",
    };

    expect(schema.parse(base)).toMatchObject({
      logType: "management",
      deliveryTarget: "Syslog",
    });

    expect(
      schema.parse({
        ...base,
        logType: "platform",
        deliveryTarget: "Syslog",
      }),
    ).toMatchObject({ protocol: "UDP" });

    expect(
      schema.parse({
        ...base,
        logType: "platform",
        deliveryTarget: "Elasticsearch",
        port: "9200",
        esIndex: "zsv-operation-log",
        esTls: true,
        esUsername: "elastic",
        esPassword: "secret",
      }),
    ).toMatchObject({ esIndex: "zsv-operation-log", esTls: true });

    expect(
      schema.parse({
        ...base,
        logType: "platform",
        deliveryTarget: "Forward",
        port: "24224",
      }),
    ).toMatchObject({ deliveryTarget: "Forward" });

    expect(
      schema.parse({
        ...base,
        logType: "platform",
        deliveryTarget: "Kafka",
        port: "9092",
        kafkaTopics: "zsv-topic",
      }),
    ).toMatchObject({ kafkaTopics: "zsv-topic" });

    expect(
      schema.parse({
        ...base,
        logType: "platform",
        deliveryTarget: "Loki",
        port: "3100",
        lokiLabelsJob: "job=operator",
        lokiTls: true,
        lokiUsername: "loki",
        lokiPassword: "secret",
      }),
    ).toMatchObject({ lokiLabelsJob: "job=operator", lokiTls: true });
  });

  it("reports every PRD validation message", () => {
    const schema = createAddLogServerSchema(intl);
    const valid = {
      ...DEFAULT_LOG_SERVER_FORM_VALUES,
      name: "log-server",
      host: "192.168.0.1",
    };

    expect(() => schema.parse({ ...valid, name: "   " })).toThrow("请输入名称");
    expect(() => schema.parse({ ...valid, deliveryTarget: "" })).toThrow(
      "请选择投递目标",
    );
    expect(() => schema.parse({ ...valid, host: " " })).toThrow(
      "请输入 IP 地址",
    );
    expect(() =>
      schema.parse({ ...valid, logType: "platform", host: " " }),
    ).toThrow("请输入地址");
    expect(() => schema.parse({ ...valid, port: "" })).toThrow(
      "请输入合法端口（1–65535）",
    );
    expect(() => schema.parse({ ...valid, port: "0" })).toThrow(
      "请输入合法端口（1–65535）",
    );
    expect(() => schema.parse({ ...valid, port: "65536" })).toThrow(
      "请输入合法端口（1–65535）",
    );
    expect(() => schema.parse({ ...valid, port: "1.5" })).toThrow(
      "请输入合法端口（1–65535）",
    );
    expect(() => schema.parse({ ...valid, port: "abc" })).toThrow(
      "请输入合法端口（1–65535）",
    );
    expect(() => schema.parse({ ...valid, protocol: "" })).toThrow(
      "请选择传输协议",
    );
    expect(() => schema.parse({ ...valid, facility: "" })).toThrow(
      "请选择日志设备",
    );
    expect(() => schema.parse({ ...valid, severity: "" })).toThrow(
      "请选择日志级别",
    );
    expect(() =>
      schema.parse({
        ...valid,
        logType: "platform",
        deliveryTarget: "Elasticsearch",
        esIndex: " ",
      }),
    ).toThrow("请输入 Index");
    expect(() =>
      schema.parse({
        ...valid,
        logType: "platform",
        deliveryTarget: "Elasticsearch",
        esIndex: "zsv-operation-log",
        esUsername: "elastic",
        esPassword: "",
      }),
    ).toThrow("输入内容不能为空");
    expect(() =>
      schema.parse({
        ...valid,
        logType: "platform",
        deliveryTarget: "Kafka",
        kafkaTopics: " ",
      }),
    ).toThrow("请输入 Topics");
    expect(() =>
      schema.parse({
        ...valid,
        logType: "platform",
        deliveryTarget: "Loki",
        lokiLabelsJob: " ",
      }),
    ).toThrow("请输入 Labels Job");
    expect(() =>
      schema.parse({
        ...valid,
        logType: "platform",
        deliveryTarget: "Loki",
        lokiLabelsJob: "job=operator",
        lokiUsername: "loki",
        lokiPassword: " ",
      }),
    ).toThrow("输入内容不能为空");
  });

  it("serializes platform logs into the Cloud log server payload", () => {
    const payload = buildLogServerConfiguration({
      ...DEFAULT_LOG_SERVER_FORM_VALUES,
      name: "log-server",
      description: "description",
      logType: "platform",
      deliveryTarget: "Kafka",
      host: "kafka.example.com",
      port: "9092",
      kafkaTopics: "zsv-topic",
    });
    const configuration = JSON.parse(payload.configuration);
    const targetConfig = JSON.parse(configuration.configuration);

    expect(payload).toMatchObject({
      name: "log-server",
      description: "description",
      category: "PlatformOperationLog",
      type: "FluentBit",
      level: "WARN",
    });
    expect(configuration).toMatchObject({
      type: "Kafka",
    });
    expect(targetConfig).toMatchObject({
      host: "kafka.example.com",
      port: "9092",
      topics: "zsv-topic",
    });
    expect(targetConfig).not.toHaveProperty("hostname");
  });

  it("serializes platform Syslog without facility for the Cloud FluentBit API", () => {
    const payload = buildLogServerConfiguration({
      ...DEFAULT_LOG_SERVER_FORM_VALUES,
      name: "platform-syslog",
      logType: "platform",
      deliveryTarget: "Syslog",
      host: "198.51.100.115",
      port: "514",
      protocol: "UDP",
    });
    const configuration = JSON.parse(payload.configuration);
    const targetConfig = JSON.parse(configuration.configuration);

    expect(payload).toMatchObject({
      category: "PlatformOperationLog",
      type: "FluentBit",
      level: "WARN",
    });
    expect(configuration).toMatchObject({
      type: "Syslog",
    });

    expect(targetConfig).toMatchObject({
      host: "198.51.100.115",
      port: "514",
      mode: "UDP",
    });
    expect(targetConfig).not.toHaveProperty("facility");
    expect(targetConfig).not.toHaveProperty("hostname");
    expect(targetConfig).not.toHaveProperty("protocol");
  });

  it("encrypts platform log server passwords in the Cloud FluentBit request payload", () => {
    const elasticsearchPayload = buildLogServerConfiguration({
      ...DEFAULT_LOG_SERVER_FORM_VALUES,
      name: "elasticsearch",
      logType: "platform",
      deliveryTarget: "Elasticsearch",
      host: "es.example.com",
      port: "9200",
      esIndex: "zsv-operation-log",
      esTls: true,
      esUsername: "elastic",
      esPassword: "es-secret",
    });
    const elasticsearchConfiguration = JSON.parse(
      elasticsearchPayload.configuration,
    );
    const elasticsearchTargetConfig = JSON.parse(
      elasticsearchConfiguration.configuration,
    );

    expect(elasticsearchTargetConfig).toMatchObject({
      host: "es.example.com",
      port: "9200",
      index: "zsv-operation-log",
      tls: "on",
      httpUser: "elastic",
    });
    expect(elasticsearchTargetConfig.httpPassword).not.toBe("es-secret");
    expect(Decrypt(elasticsearchTargetConfig.httpPassword)).toBe("es-secret");
    expect(elasticsearchTargetConfig).not.toHaveProperty("username");
    expect(elasticsearchTargetConfig).not.toHaveProperty("password");

    const lokiPayload = buildLogServerConfiguration({
      ...DEFAULT_LOG_SERVER_FORM_VALUES,
      name: "loki",
      logType: "platform",
      deliveryTarget: "Loki",
      host: "loki.example.com",
      port: "3100",
      lokiLabelsJob: "job=operator",
      lokiTls: true,
      lokiUsername: "admin",
      lokiPassword: "loki-secret",
    });
    const lokiConfiguration = JSON.parse(lokiPayload.configuration);
    const lokiTargetConfig = JSON.parse(lokiConfiguration.configuration);

    expect(lokiTargetConfig).toMatchObject({
      host: "loki.example.com",
      port: "3100",
      labels: "job=operator",
      tls: "on",
      httpUser: "admin",
    });
    expect(lokiTargetConfig.httpPassword).not.toBe("loki-secret");
    expect(Decrypt(lokiTargetConfig.httpPassword)).toBe("loki-secret");
    expect(lokiTargetConfig).not.toHaveProperty("username");
    expect(lokiTargetConfig).not.toHaveProperty("password");
  });

  it("serializes Elasticsearch TLS and authentication for the Cloud FluentBit API", () => {
    const payload = buildLogServerConfiguration({
      ...DEFAULT_LOG_SERVER_FORM_VALUES,
      name: "elastic",
      logType: "platform",
      deliveryTarget: "Elasticsearch",
      host: "127.0.0.1",
      port: "9200",
      esIndex: "zsv-operation-log",
      esTls: true,
      esUsername: "admin_test",
      esPassword: "admin123",
    });
    const configuration = JSON.parse(payload.configuration);
    const targetConfig = JSON.parse(configuration.configuration);

    expect(configuration).toMatchObject({
      type: "Elasticsearch",
    });
    expect(targetConfig).toMatchObject({
      host: "127.0.0.1",
      port: "9200",
      index: "zsv-operation-log",
      tls: "on",
      httpUser: "admin_test",
    });
    expect(targetConfig.httpPassword).not.toBe("admin123");
    expect(Decrypt(targetConfig.httpPassword)).toBe("admin123");
    expect(targetConfig).not.toHaveProperty("username");
    expect(targetConfig).not.toHaveProperty("password");
  });

  it("serializes management logs into the Cloud Log4j2 payload", () => {
    const payload = buildLogServerConfiguration({
      ...DEFAULT_LOG_SERVER_FORM_VALUES,
      name: "management-syslog",
      logType: "management",
      deliveryTarget: "Syslog",
      host: "198.51.100.116",
      port: "514",
      protocol: "UDP",
      facility: "LOCAL0",
      severity: "ERROR",
    });
    const configuration = JSON.parse(payload.configuration);
    const targetConfig = JSON.parse(configuration.configuration);

    expect(payload).toMatchObject({
      category: "ManagementNodeLog",
      type: "Log4j2",
      level: "ERROR",
    });
    expect(configuration).toMatchObject({
      type: "Syslog",
    });
    expect(targetConfig).toMatchObject({
      hostname: "198.51.100.116",
      port: "514",
      protocol: "UDP",
      facility: "LOCAL0",
    });
    expect(targetConfig).not.toHaveProperty("host");
  });

  it("parses old and new labelValue data for list and edit forms", () => {
    const oldLabelValue = JSON.stringify({
      name: "old-syslog",
      uuid: "uuid",
      description: "old",
      configuration: JSON.stringify({
        type: "Syslog",
        configuration: JSON.stringify({
          hostname: "192.168.0.10",
          port: "514",
          protocol: "UDP",
          facility: "LOCAL0",
        }),
      }),
    });

    expect(parseLogServerLabelValue(oldLabelValue)).toMatchObject({
      logType: "management",
      deliveryTarget: "Syslog",
      host: "192.168.0.10",
      port: "514",
      facility: "LOCAL0",
    });

    const newPayload = buildLogServerConfiguration({
      ...DEFAULT_LOG_SERVER_FORM_VALUES,
      name: "loki",
      logType: "platform",
      deliveryTarget: "Loki",
      host: "loki.example.com",
      port: "3100",
      lokiLabelsJob: "job=operator",
      lokiTls: true,
      lokiUsername: "user",
      lokiPassword: "password",
    });

    expect(
      parseLogServerLabelValue(
        JSON.stringify({
          name: newPayload.name,
          description: newPayload.description,
          category: newPayload.category,
          type: newPayload.type,
          level: newPayload.level,
          configuration: newPayload.configuration,
        }),
      ),
    ).toMatchObject({
      logType: "platform",
      deliveryTarget: "Loki",
      host: "loki.example.com",
      port: "3100",
      lokiLabelsJob: "job=operator",
      lokiTls: true,
      lokiUsername: "user",
      lokiPassword: "password",
    });
  });

  it("parses Elasticsearch TLS and authentication from the Cloud payload", () => {
    const labelValue = JSON.stringify({
      name: "elastic",
      description: "description",
      category: "PlatformOperationLog",
      type: "FluentBit",
      level: "WARN",
      configuration: JSON.stringify({
        type: "Elasticsearch",
        configuration: JSON.stringify({
          host: "127.0.0.1",
          port: "9200",
          index: "zsv-operation-log",
          tls: "on",
          httpUser: "admin_test",
          httpPassword: "admin123",
        }),
      }),
    });

    expect(parseLogServerLabelValue(labelValue)).toMatchObject({
      logType: "platform",
      deliveryTarget: "Elasticsearch",
      host: "127.0.0.1",
      port: "9200",
      esIndex: "zsv-operation-log",
      esTls: true,
      esUsername: "admin_test",
      esPassword: "admin123",
    });
  });

  it("keeps update schema scoped to name and description", () => {
    const schema = createUpdateLogServerSchema(intl);

    expect(
      schema.parse({
        name: "log-server",
        description: "description",
      }),
    ).toMatchObject({
      name: "log-server",
      description: "description",
    });
    expect(() => schema.parse({ name: " ", description: "" })).toThrow(
      "请输入名称",
    );
  });
});
