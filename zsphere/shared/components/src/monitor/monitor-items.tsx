import { gql } from "@apollo/client";
import { Icon } from "@zstack/icon";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { ProfileType } from "@zstack/zsphere-types";
import { Button } from "antd";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { Select } from "../a-cloud-old-components";
import { IBusinessMonitorItemsProps } from "./type";

import style from "./style.module.less";

const updatePersonalizationConfig = gql`
  mutation updatePersonalizationConfig(
    $input: UpdatePersonalizationConfigInput!
  ) {
    updatePersonalizationConfig(input: $input) {
      actionId
    }
  }
`;

const BusinessMonitorItems: React.FC<IBusinessMonitorItemsProps> = ({
  resourceType,
  initialValue = [],
  defaultValue = [],
  onChange,
  options,
  onSave,
}) => {
  const intl = useIntl() as any;
  const doAction = useAction();
  const [value, setValue] = useState<string[]>();
  const [visible, setVisible] = useState<boolean>(false);

  const saveData = (data: string[] = []) => {
    doAction({
      mutation: updatePersonalizationConfig,
      payload: {
        profileType: ProfileType.MonitoringItemsConfig,
        resourceType,
        value: JSON.stringify(data),
      },
      name: intl.formatMessage({
        id: "save.monitor.items",
        defaultMessage: "Save Monitoring Item",
      }),
      total: 1,
      onFinish: () => {
        onSave?.();
      },
    });
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <>
      <Select<string[]>
        mode="multiple"
        checkable
        options={options}
        value={value}
        onChange={setValue}
        showToggleAll={false}
        dropdownAlign={{ points: ["tr", "br"] }}
        bottomActions={[
          {
            text: intl.formatMessage({
              id: "restore.default",
              defaultMessage: "Reset",
            }),
            type: "text",
            onClick() {
              onChange?.(defaultValue);
              setValue?.(defaultValue);
              saveData(defaultValue);
            },
          },
          {
            text: intl.formatMessage({ id: "save", defaultMessage: "Save" }),
            type: "primary",
            onClick(data) {
              if (data?.length) {
                onChange?.(data);
                saveData(data);
              } else {
                setVisible(true);
              }
            },
          },
        ]}
      >
        <Button className={style["monitor-button-with-icon"]}>
          <Icon size={14} type="settings" />
          {intl.formatMessage({
            id: "monitorItem",
            defaultMessage: "Monitoring Item",
          })}
        </Button>
      </Select>
      <DialogWeak
        type="warning"
        title={intl.formatMessage({
          id: "save.monitorItem.fail.title",
          defaultMessage: "Set monitoring item.",
        })}
        description={intl.formatMessage({
          id: "save.monitorItem.fail.content",
          defaultMessage: "Please select at least one monitoring item.",
        })}
        visible={visible}
        setVisible={setVisible}
        onConfirm={() => setVisible(false)}
      />
    </>
  );
};

export default React.memo(BusinessMonitorItems);
