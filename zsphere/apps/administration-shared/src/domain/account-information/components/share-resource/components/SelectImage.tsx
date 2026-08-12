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

export interface ISelectImageProps {
  form: any;
}

const SelectImage: React.FC<ISelectImageProps> = ({ form }) => {
  const intl = useIntl();
  const [selectorResourceTreeVisible, setSelectorResourceTreeVisible] =
    useState<boolean>(false);

  const getCurrentSelectedKeys = () => {
    const imageList = form.getFieldValue("imageList") || [];
    return imageList.map((vm: IResource) => vm.uuid);
  };

  return (
    <>
      <Form.Item noStyle shouldUpdate={true}>
        {({ getFieldValue }) => {
          const imageList = getFieldValue("imageList");
          if (!imageList?.length) {
            return (
              <Form.Item className={styles.emptyForm} name="image">
                <Button
                  style={STYLE_LINK_BUTTON}
                  variant="link"
                  icon={<Icon type="plus" />}
                  onClick={() => setSelectorResourceTreeVisible(true)}
                >
                  {intl.formatMessage({
                    id: "add.image",
                    defaultMessage: "Add Image",
                  })}
                </Button>
              </Form.Item>
            );
          }
          return (
            <>
              <Form.Item className={styles.resourceForm} name="image">
                <>
                  <Form.List name="imageList">
                    {(fields, { add: _add, remove }) => {
                      return (
                        <>
                          {fields?.map((field, index) => {
                            const itemName = getFieldValue([
                              "imageList",
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
                  id: "add.image",
                  defaultMessage: "Add Image",
                })}
              </Button>
            </>
          );
        }}
      </Form.Item>
      <ModalTreeSelector
        resourceType="image"
        visible={selectorResourceTreeVisible}
        setVisible={setSelectorResourceTreeVisible}
        onOk={(resourceList: IResource[]) => {
          form.setFieldsValue({ imageList: resourceList });
        }}
        initialSelectedKeys={getCurrentSelectedKeys()} // 传递当前选中的 keys
      />
    </>
  );
};

export default SelectImage;
