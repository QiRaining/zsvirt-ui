import { Button, Dropdown } from "antd";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../../../_utils/common";
import Form from "../../../form";
import Select from "../../../select";
import { ISearch, ITag } from "./type";

export interface IProps {
  keyList?: Exclude<ISearch["resourceAttributeSearch"], undefined>["keyList"];
  onOk?: ITag["onOk"];
}

export default function ResourceAttributeSearch({ keyList, onOk }: IProps) {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);

  return (
    <Dropdown
      open={visible}
      onOpenChange={setVisible}
      trigger={["click"]}
      getPopupContainer={(node) =>
        node.closest(`.${getBaseCls("search-advanced")}`) || document.body
      }
      dropdownRender={() => (
        <div className={getBaseCls("search-dropdown-container")}>
          <Form form={form}>
            <div className={getBaseCls("search-attribute-form")}>
              <Form.Item
                name="key"
                labelCol={{ span: 24 }}
                label={intl.formatMessage({
                  id: "resource.attribute.key",
                  defaultMessage: "Attribute Key",
                })}
                required
                initialValue=""
              >
                <Select
                  options={keyList?.map((item) => ({
                    label: item.name,
                    value: item.uuid,
                  }))}
                  onChange={() => form.resetFields(["value"])}
                />
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.key !== curr.key}
              >
                {({ getFieldValue }) => (
                  <Form.Item
                    name="value"
                    labelCol={{ span: 24 }}
                    label={intl.formatMessage({
                      id: "resource.attribute.value",
                      defaultMessage: "Attribute Value",
                    })}
                    icon="info"
                    iconTooltip={intl.formatMessage({
                      id: "table.toolbar.search.attribute.field.value.tooltip",
                      defaultMessage:
                        "Show resources with unset attribute values under this attribute key when the attribute value is empty.",
                    })}
                  >
                    <Select
                      mode="multiple"
                      checkable
                      options={keyList
                        ?.find((item) => item.uuid === getFieldValue("key"))
                        ?.constraints?.map((item) => ({
                          label: item.parameter,
                          value: item.parameter,
                        }))}
                    />
                  </Form.Item>
                )}
              </Form.Item>
            </div>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue, resetFields }) => {
                const keyUuid = getFieldValue("key");
                return (
                  <div className={getBaseCls("search-attribute-footer")}>
                    <Button
                      type="text"
                      disabled={!keyUuid}
                      onClick={() => {
                        resetFields();
                      }}
                    >
                      {intl.formatMessage({
                        id: "reset",
                        defaultMessage: "Reset",
                      })}
                    </Button>
                    <Button
                      type="link"
                      disabled={!keyUuid}
                      onClick={() => {
                        const values =
                          getFieldValue("value")?.map((item: any) => ({
                            key: item,
                            label: item,
                          })) || [];
                        setVisible(false);
                        resetFields();
                        onOk?.(
                          {
                            key: keyUuid,
                            label:
                              keyList?.find((item) => item.uuid === keyUuid)
                                ?.name ?? "",
                            type: "attribute",
                            extra: {
                              i18nKey: "virtualization.resource.attribute",
                            },
                          },
                          values,
                        );
                      }}
                    >
                      {intl.formatMessage({
                        id: "ok",
                        defaultMessage: "OK",
                      })}
                    </Button>
                  </div>
                );
              }}
            </Form.Item>
          </Form>
        </div>
      )}
    >
      <Button className={getBaseCls("search-tag-btn")}>
        {intl.formatMessage({
          id: "virtualization.resource.attribute",
          defaultMessage: "Custom Attribute",
        })}
      </Button>
    </Dropdown>
  );
}
