import { Icon } from "@zstack/icon";
import { Form, Select } from "@zstack/zsphere-components";
import type { FC } from "react";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import useStateI18n from "../../i18n/useStateI18n";
import EVENT_LABELS_JSON from "../constant/EventLabels.json";
// import HostList from "zsv_resource/src/pages/host/list"
import EVENTS_JSON from "../constant/Events.json";

const { Option } = Select;

export interface IProps {
  namespace: string;
  eventName: string;
  value?: any;
  onChange?: (value?: object) => void;
}

const EVENTS: any = EVENTS_JSON;
const EVENT_LABELS: any = EVENT_LABELS_JSON;

// 通过namespace得到 labels，从而得到 result 返回属性；然后显示相应的 select 或者 table-select。
// 触发result改变：namespace、eventName；TableSelect的改变、select的改变
const ResourceSeletor: FC<IProps> = ({
  onChange,
  namespace,
  eventName,
  value,
}) => {
  const intl = useIntl();
  const [labels, setLabels] = useState([]);
  // const [dropDownItems, setDropDownItem] = useState([])
  // onChange改变了select之后，选项不会默认切换，使用state控制。   ---  此处一作巨坑，使用map出来的select和option贼难处理。
  const [stateObj, setStateObj] = useState({
    OldState: "Created",
    NewState: "Starting",
  });

  const stateMap = {
    Starting: ["Running", "Unknown"],
    Rebooting: ["Running", "Unknown"],
    Stopping: ["Running", "Unknown"],
    Destroying: ["Destroyed", "Unknown"],
    Pausing: ["Paused", "Unknown"],
    Resuming: ["Running", "Unknown"],
    Migrating: ["Running", "Unknown"],
    VolumeMigrating: ["Stopped", "Unknown"],
    Unknown: ["Resuming", "Running", "Stopped", "Unknown"],
    Created: ["Starting", "Running", "Unknown"],
    Running: [
      "Rebooting",
      "Pausing",
      "Stopping",
      "Destroying",
      "Stopped",
      "Paused",
      "Destroyed",
      "Unknown",
    ],
    Paused: ["Resuming", "Destroying", "Running", "Destroyed", "Unknown"],
    Stopped: ["Destroying", "Rebooting", "Running", "Destroyed", "Unknown"],
    Destroyed: ["Expunging", "Resuming", "Unknown"],
  };

  const translateState = useStateI18n();

  useEffect(() => {
    const tags = EVENTS?.[namespace]?.[eventName]?.tags;
    let labelNames = EVENTS?.[namespace]?.[eventName]?.labelNames;
    const noLabels = tags?.some((item: any) => item === "noLabels");
    if (noLabels) {
      labelNames = [];
    }
    setLabels(labelNames);
    // hook
    if (labelNames?.length === 2) {
      onChange?.({
        OldState: "Created",
        NewState: "Starting",
      });
    } else {
      onChange?.({});
    }
  }, [eventName, namespace]);

  return (
    <>
      {labels?.length > 1 && (
        <Form.Item
          label={intl.formatMessage({
            id: "enableStateChange",
            defaultMessage: "State Change",
          })}
          shouldUpdate
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "virtualization.zwatchAlarm.eventAlarm.field.vmStateChangedOnHost.tooltip",
                defaultMessage: `The alarm is triggered only when the state of virtual machines changes due to abnormal operations.`,
              })}
            </ReactMarkdown>
          }
        >
          <div className="flex items-center gap-2">
            {labels?.map((label) => {
              if (EVENT_LABELS[label].inputType === "dropDown") {
                let values = EVENT_LABELS?.[label].values?.vm || [];
                const isNew = label === "NewState";
                if (isNew) {
                  values = stateMap?.[value?.OldState as "Starting"];
                }

                return (
                  <React.Fragment key={label}>
                    {isNew && <Icon type="arrow-right" />}
                    <Select
                      width="s"
                      defaultValue={values?.[0]}
                      onChange={(v) => {
                        const changedValue = isNew
                          ? {
                              ...value,
                              [label]: v,
                            }
                          : {
                              OldState: v,
                              NewState: stateMap?.[v as "Starting"]?.[0],
                            };
                        onChange?.(changedValue);
                        setStateObj(changedValue);
                      }}
                      value={isNew ? stateObj.NewState : stateObj.OldState}
                    >
                      {values?.map((cv: any) => (
                        <Option value={cv} key={cv}>
                          {translateState?.(cv)}
                        </Option>
                      ))}
                    </Select>
                  </React.Fragment>
                );
              }
            })}
          </div>
        </Form.Item>
      )}
      {labels?.length === 1 &&
        labels?.map((label) => {
          if (EVENT_LABELS[label].inputType === "selectList") {
            return (
              <Form.Item
                key={label}
                name="targetHost"
                label={intl.formatMessage({
                  id: "HAStartTargetHost",
                  defaultMessage: "Target Host for HA Start",
                })}
              >
                {/* <ModalSelect
                  title={intl.formatMessage({ id: 'select.host', defaultMessage: '选择物理机' })}
                  className={style['width-320']}
                  selectType="radio"
                  onChange={v => {
                    if (v?.length > 0) {
                      onChange?.({ [label]: v?.[0]?.uuid })
                    } else {
                      onChange?.({})
                    }
                  }}
                >
                  <HostList
                    view="select.v2v.conversion.host"
                    defaultQuery={{
                      conditions: [
                        {
                          key: 'hypervisorType',
                          op: Op.ne,
                          value: 'ESX'
                        }
                      ]
                    }}
                  />
                </ModalSelect> */}
              </Form.Item>
            );
          }
        })}
    </>
  );
};

ResourceSeletor.displayName = "ResourceSeletor";

export default ResourceSeletor;
