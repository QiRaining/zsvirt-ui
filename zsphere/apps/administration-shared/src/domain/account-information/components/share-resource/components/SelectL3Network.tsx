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

export interface ISelectL3NetworkProps {
  form: any;
}

const SelectL3Network: React.FC<ISelectL3NetworkProps> = ({ form }) => {
  const intl = useIntl();

  const [selectorResourceTreeVisible, setSelectorResourceTreeVisible] =
    useState<boolean>(false);

  const getCurrentSelectedKeys = () => {
    const l3NetworkList = form.getFieldValue("l3NetworkList") || [];
    return l3NetworkList.map((l3Network: IResource) => l3Network.uuid);
  };

  return (
    <>
      <Form.Item noStyle shouldUpdate={true}>
        {({ getFieldValue }) => {
          const l3NetworkList = getFieldValue("l3NetworkList");
          if (!l3NetworkList?.length) {
            return (
              <Form.Item className={styles.emptyForm} name="l3">
                <Button
                  style={STYLE_LINK_BUTTON}
                  variant="link"
                  icon={<Icon type="plus" />}
                  onClick={() => setSelectorResourceTreeVisible(true)}
                >
                  {intl.formatMessage({
                    id: "add.l3.network",
                    defaultMessage: "Add Distributed Port Group",
                  })}
                </Button>
              </Form.Item>
            );
          }
          return (
            <>
              <Form.Item className={styles.resourceForm} name="l3">
                <>
                  <Form.List name="l3NetworkList">
                    {(fields, { add: _add, remove }) => {
                      return (
                        <>
                          {fields?.map((field, index) => {
                            const itemName = getFieldValue([
                              "l3NetworkList",
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
                  id: "add.l3.network",
                  defaultMessage: "Add Distributed Port Group",
                })}
              </Button>
            </>
          );
        }}
      </Form.Item>
      <ModalTreeSelector
        resourceType="l3-network"
        visible={selectorResourceTreeVisible}
        setVisible={setSelectorResourceTreeVisible}
        onOk={(resourceList: IResource[]) => {
          form.setFieldsValue({ l3NetworkList: resourceList });
        }}
        initialSelectedKeys={getCurrentSelectedKeys()} // 传递当前选中的 keys
      />
    </>
  );
};

export default SelectL3Network;
