import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  DialogFooter,
  Form,
  RadioGroupRoot,
  RadioGroupItem,
  Text,
} from "@zstack/design";
import { useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import cls from "classnames";
import { cloneDeep, find, isUndefined } from "lodash-es";
import React, { memo, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { createAddWidgetSchema, type AddWidgetFormValues } from "./schema";
import StateMonitorForm from "./state-monitor/form-item";
import TopMonitorForm from "./top-monitor/form-item";
import type { IMetricConfig as ITopMetricConfig } from "./top-monitor/metric-config";
import type { IMetricConfig as ITrendMetricConfig } from "./trend-monitor/metric-config";
import { WidgetsType } from "./type";
import UsageStatisticsForm from "./usage-statistics/form-item";
import type { UseMetricType } from "./usage-statistics/metric-config";
import useWidgetConfig, { type IWidgetConfig } from "./widgets-config";

import style from "./style.module.less";

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onOk: (input: any) => void;
  editData: any;
}

const AddWidgetModalInner: React.FC<IProps> = ({
  visible,
  setVisible,
  onOk,
  editData,
}) => {
  const intl = useIntl();
  const { widgetConfig } = useWidgetConfig();
  const [currentType, setCurrentType] = useState<WidgetsType>(
    widgetConfig[0]?.value,
  ); // forceRender
  const defaultValues = useMemo<AddWidgetFormValues>(
    () => ({
      type: currentType,
    }),
    [currentType],
  );
  const formSchema = useMemo(() => createAddWidgetSchema(), []);
  const form = useForm<AddWidgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const [dom, setDom] = useState<HTMLDivElement | null>(null);

  const onRefChange = React.useCallback((node) => {
    setDom(node);
  }, []);

  const genFormItems = (widgetType: WidgetsType, domParam: HTMLDivElement) => {
    const metricConfig = widgetDisabledItemState?.[widgetType] || [];
    switch (widgetType) {
      case WidgetsType.topMonitor:
        return (
          <div className={style.widgetContent}>
            <TopMonitorForm
              form={form}
              metricConfig={metricConfig as ITopMetricConfig[]}
            />
          </div>
        );
      case WidgetsType.stateMonitor:
        return (
          <div className={style.widgetContent}>
            <StateMonitorForm form={form} metricConfig={metricConfig} />
          </div>
        );
      case WidgetsType.usageStatistics:
        return (
          <div className={style.widgetContent}>
            <UsageStatisticsForm
              form={form}
              metricConfig={metricConfig as UseMetricType[]}
              containerDom={domParam}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const widgetsList: IWidgetConfig[] = useMemo(() => {
    return widgetConfig?.filter((item: any) => item.show) || [];
  }, [widgetConfig]);

  // 用户已选的数据
  const currentWidgetsData = useMemo(() => {
    const res: { [key in WidgetsType]?: any[] } = {};
    editData?.widgets?.forEach(
      (item: { type: WidgetsType; [key: string]: any }) => {
        const temp = cloneDeep(item.props);
        delete temp.type;
        if (res[item.type]) {
          res[item.type]?.push({
            ...temp,
          });
        } else {
          res[item.type] = [{ ...temp }];
        }
      },
    );
    return res;
  }, [editData]);

  // widget disabled 状态
  const widgetDisabledState = useMemo(() => {
    const res: { [key in WidgetsType]?: boolean } = {};
    widgetsList.forEach((item: IWidgetConfig) => {
      let limit = 0;
      if (!item.metricConfig) {
        limit = 1;
      } else {
        const { metricConfig = [] } = item;
        metricConfig
          .filter((e: any) => isUndefined(e.show) || e?.show)
          .forEach((configItem: any) => {
            if (configItem.children) {
              limit += configItem.children.length;
            } else {
              limit += 1;
            }
          });
        if (item.value === WidgetsType.topMonitor) {
          limit *= 2;
        } // 分两种 top
      }
      res[item.value] =
        limit === (currentWidgetsData?.[item.value]?.length || 0);
    });
    return res;
  }, [widgetsList, currentWidgetsData]);

  /**
   * 具体条目的 disable 状态，后续这边准备重写
   */
  const widgetDisabledItemState = useMemo(() => {
    const res: {
      [key in WidgetsType]?:
        | any[]
        | ITopMetricConfig[]
        | ITrendMetricConfig[]
        | UseMetricType[];
    } = {};
    widgetsList.forEach((item: IWidgetConfig) => {
      if (item.metricConfig) {
        item.metricConfig.forEach((currentItem: any) => {
          if (currentItem.children) {
            currentItem.children.forEach((e: any) => {
              if (
                find(currentWidgetsData[item.value], {
                  [item.formKeyConfig[1]]: currentItem.value,
                  [item.formKeyConfig[2]]: e.value,
                })
              ) {
                if (e.children) {
                  e.children.forEach((f: any) => {
                    if (
                      find(currentWidgetsData[item.value], {
                        [item.formKeyConfig[1]]: currentItem.value,
                        [item.formKeyConfig[2]]: e.value,
                        [item.formKeyConfig[3]]: f.value,
                      })
                    ) {
                      f.disabled = true;
                    }
                  });
                  if (
                    e.children.length ===
                    e.children.filter((f: any) => f?.disabled).length
                  ) {
                    e.disabled = true;
                  }
                } else {
                  e.disabled = true;
                }
              }
            });
            if (
              currentItem.children.length ===
              currentItem.children.filter((f: any) => f?.disabled).length
            ) {
              currentItem.disabled = true;
            }
          } else {
            let currentItemValue = currentItem.value;
            if (item.value === WidgetsType.usageStatistics) {
              currentItemValue = currentItem.resourceKey;
            }
            if (
              find(currentWidgetsData[item.value], {
                [item.formKeyConfig[1]]: currentItemValue,
              })
            ) {
              currentItem.disabled = true;
            }
          }
        });
        res[item.value] = item.metricConfig;
      }
    });
    return res;
  }, [widgetsList, currentWidgetsData]);

  const changeType = (widgetType: WidgetsType) => {
    if (currentType === widgetType) {
      return;
    }
    form.setValue("type", widgetType);
    setCurrentType(widgetType);
  };

  const generateWidgetOption = (
    item: IWidgetConfig,
    domParam: HTMLDivElement,
  ) => {
    const isDisabled = widgetDisabledState[item.value] || false;
    return (
      <div
        key={item.value}
        className={cls(style.widgetOptionItemContainer, {
          [style.widgetOptionItemContainerActive]: currentType === item.value,
          [style.widgetOptionItemContainerDisable]: isDisabled,
        })}
      >
        <button
          type="button"
          className={`${style.widgetTop} w-full border-0 bg-transparent p-0 text-left`}
          disabled={isDisabled}
          onClick={() => !isDisabled && changeType(item.value)}
        >
          <div className={style.widgetThumbnail}>
            <img src={item.thumbnail} alt="" />
          </div>
          <div className={style.widgetInfo}>
            <div className={style.widgetInfoLabel}>
              <Text>{item.label}</Text>
            </div>
            <div className={style.widgetInfoDesc}>
              <Text>{item.description}</Text>
            </div>
          </div>
          <div className={style.widgetRadio}>
            <RadioGroupRoot
              value={currentType === item.value ? item.value : ""}
              disabled={isDisabled}
            >
              <RadioGroupItem
                value={item.value}
                disabled={isDisabled}
                onClick={() => !isDisabled && changeType(item.value)}
              />
            </RadioGroupRoot>
          </div>
        </button>
        {currentType === item.value &&
          !isDisabled &&
          genFormItems(item.value, domParam)}
      </div>
    );
  };

  const submitWidgetConfig = () => {
    onOk(form.getValues());
  };

  // 初始化默认选择
  useEffect(() => {
    if (visible) {
      let initialed = false;
      widgetsList.forEach((item: IWidgetConfig) => {
        if (!widgetDisabledState[item.value] && !initialed) {
          setCurrentType(item.value);
          form.reset({ type: item.value });
          form.setValue("type", item.value);
          initialed = true;
        }
      });
    }
  }, [form, visible, widgetDisabledState, widgetsList]);

  return (
    <DialogForm
      onOk={submitWidgetConfig}
      form={dialogForm}
      setVisible={setVisible}
      visible={visible}
      onCancel={() => setVisible(false)}
      title={intl.formatMessage({
        id: "add.widget",
        defaultMessage: "Add Widget",
      })}
      alertType="info"
      alertMessage={intl.formatMessage({
        id: "customHomepage.modal.add.widget.alert.info",
        defaultMessage: "Select a widget and add the widget to the dashboard. You cannot select a widget that is already displayed on the dashboard.",
      })}
      footer={
        <DialogFooter className="gap-2">
          <Button variant="subtle" onClick={() => setVisible(false)}>
            {intl.formatMessage({
              id: "cancel",
              defaultMessage: "Cancel",
            })}
          </Button>
          <Button variant="primary" onClick={() => submitWidgetConfig()}>
            {intl.formatMessage({
              id: "ok",
              defaultMessage: "OK",
            })}
          </Button>
        </DialogFooter>
      }
    >
      <div ref={onRefChange} style={{ position: "relative" }}>
        <Form {...form}>
          <input type="hidden" {...form.register("type")} />
          <div className={style.widgetOptionContainer}>
            {widgetsList.map((option: IWidgetConfig) =>
              dom ? (
                generateWidgetOption(option, dom)
              ) : (
                <React.Fragment key={option.value} />
              ),
            )}
          </div>
        </Form>
      </div>
    </DialogForm>
  );
};

const AddWidgetModal = memo(AddWidgetModalInner);

export default AddWidgetModal;
