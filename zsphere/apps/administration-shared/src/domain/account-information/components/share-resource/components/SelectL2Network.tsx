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

export interface ISelectL2NetworkProps {
  form: any;
}

const SelectL2Network: React.FC<ISelectL2NetworkProps> = ({ form }) => {
  const intl = useIntl();

  const [selectorResourceTreeVisible, setSelectorResourceTreeVisible] =
    useState<boolean>(false);

  const getCurrentSelectedKeys = () => {
    const l2NetworkList = form.getFieldValue("l2NetworkList") || [];
    return l2NetworkList.map((l2Network: IResource) => l2Network.uuid);
  };

  return (
    <>
      <Form.Item noStyle shouldUpdate={true}>
        {({ getFieldValue }) => {
          const l2NetworkList = getFieldValue("l2NetworkList");
          if (!l2NetworkList?.length) {
            return (
              <Form.Item className={styles.emptyForm} name="l2">
                <Button
                  style={STYLE_LINK_BUTTON}
                  variant="link"
                  icon={<Icon type="plus" />}
                  onClick={() => setSelectorResourceTreeVisible(true)}
                >
                  {intl.formatMessage({
                    id: "add.l2.network",
                    defaultMessage: "Add Distributed Switch",
                  })}
                </Button>
              </Form.Item>
            );
          }
          return (
            <>
              <Form.Item className={styles.resourceForm} name="l2">
                <>
                  <Form.List name="l2NetworkList">
                    {(fields, { add: _add, remove }) => {
                      return (
                        <>
                          {fields?.map((field, index) => {
                            const itemName = getFieldValue([
                              "l2NetworkList",
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
                  id: "add.l2.network",
                  defaultMessage: "Add Distributed Switch",
                })}
              </Button>
            </>
          );
        }}
      </Form.Item>
      <ModalTreeSelector
        resourceType="l2-network"
        visible={selectorResourceTreeVisible}
        setVisible={setSelectorResourceTreeVisible}
        onOk={(resourceList: IResource[]) => {
          form.setFieldsValue({ l2NetworkList: resourceList });
        }}
        initialSelectedKeys={getCurrentSelectedKeys()} // 传递当前选中的 keys
      />
    </>
  );
};

export default SelectL2Network;
