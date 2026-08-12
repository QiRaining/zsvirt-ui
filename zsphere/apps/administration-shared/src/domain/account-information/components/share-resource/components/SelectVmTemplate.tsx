import { Button, Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Form } from "@zstack/zsphere-components";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import type { IResource } from "../type";
import ModalTreeSelector from "./selectResource";

import styles from "./style.module.less";

const STYLE_LINK_BUTTON = {
  padding: 0,
  display: "flex",
  alignItems: "center",
} as const;

export interface ISelectVmTemplateProps {
  form: any;
}

const SelectVmTemplate: React.FC<ISelectVmTemplateProps> = ({ form }) => {
  const intl = useIntl();

  const [selectorResourceTreeVisible, setSelectorResourceTreeVisible] =
    useState<boolean>(false);

  const getCurrentSelectedKeys = () => {
    const vmTemplateList = form.getFieldValue("vmTemplateList") || [];
    return vmTemplateList.map((vmTemplate: IResource) => vmTemplate.uuid);
  };

  return (
    <>
      <Form.Item noStyle shouldUpdate={true}>
        {({ getFieldValue }) => {
          const vmTemplateList = getFieldValue("vmTemplateList");
          if (!vmTemplateList?.length) {
            return (
              <Form.Item className={styles.emptyForm} name="template">
                <Button
                  style={STYLE_LINK_BUTTON}
                  variant="link"
                  icon={<Icon type="plus" />}
                  onClick={() => setSelectorResourceTreeVisible(true)}
                >
                  {intl.formatMessage({
                    id: "add.template",
                    defaultMessage: "Add Template",
                  })}
                </Button>
              </Form.Item>
            );
          }
          return (
            <>
              <Form.Item className={styles.resourceForm} name="template">
                <>
                  <Form.List name="vmTemplateList">
                    {(fields, { add: _add, remove }) => {
                      return (
                        <>
                          {fields?.map((field, index) => {
                            const itemName = getFieldValue([
                              "vmTemplateList",
                              index,
                              "name",
                            ]);
                            return (
                              <div className={styles.content} key={field.key}>
                                <div className="flex items-center gap-2">
                                  <div className="min-w-0 flex-1">
                                    <Text
                                      className="block truncate"
                                      title={itemName}
                                    >
                                      {itemName}
                                    </Text>
                                  </div>
                                  <div className="shrink-0">
                                    <div className={styles.action}>
                                      <span onClick={() => remove(index)}>
                                        <Icon type="trash" />
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      );
                    }}
                  </Form.List>
                </>
              </Form.Item>
              <Button
                className={styles.addBtnOutside}
                variant="link"
                icon={<Icon type="plus" />}
                onClick={() => {
                  setSelectorResourceTreeVisible(true);
                }}
              >
                {intl.formatMessage({
                  id: "add.template",
                  defaultMessage: "Add Template",
                })}
              </Button>
            </>
          );
        }}
      </Form.Item>
      <ModalTreeSelector
        resourceType="vm-template"
        visible={selectorResourceTreeVisible}
        setVisible={setSelectorResourceTreeVisible}
        onOk={(resourceList: IResource[]) => {
          form.setFieldsValue({ vmTemplateList: resourceList });
        }}
        initialSelectedKeys={getCurrentSelectedKeys()} // 传递当前选中的 keys
      />
    </>
  );
};

export default SelectVmTemplate;
