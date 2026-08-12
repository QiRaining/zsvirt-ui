import { gql } from "@apollo/client";
import { Button, DialogFooter, RadioGroup } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Steps, Form, useAuth } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type {
  IActionWrapperProps,
  Condition as ICondition,
} from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  Tag as ITag,
  VmInstance as IVmInstance,
  Host as IHost,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import type { FormInstance } from "antd/es/form";
import { uniq, compact, difference, isEmpty } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import HostList from "zsv_resource/host/list";
import VmList from "zsv_resource/vm/list";

import style from "./style.module.less";

const ADMIN_UUID = "36c27e8ff05c4780bf6d2fa65700f22e";

const vmInstanceList = gql`
  query vmInstanceList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: VmQueryType
    $extraConditions: [Condition!] = []
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    vmInstanceList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        name
        state
        cpuNum
        memorySize
        hostUuid
        clusterUuid
        createDate
        host {
          uuid
          name
          state
          status
          managementIp
          cpuNum
          clusterUuid
        }
        cluster {
          name
          state
          uuid
        }
        owner {
          uuid
          name
          type
          linkedAccountUuid
        }
      }
    }
  }
`;

export const _vmInstanceList = vmInstanceList;

const attachTag = gql`
  mutation attachTag($input: AttachTagInput!) {
    attachTag(input: $input) {
      actionId
    }
  }
`;

export enum ResourceTypeEnum {
  Vm = "Vm",
  Host = "Host",
}

export const useResourceTypeMap = () => {
  const intl = useIntl();
  const { hasAuth } = useAuth();

  const resourceTypeMap = new Map<
    ResourceTypeEnum,
    {
      label: string;
      auth?: {
        type: "action";
        resource: string;
        authKey: string;
      };
    }
  >([
    [
      ResourceTypeEnum.Vm,
      {
        label: intl.formatMessage({
          id: "virtualization.vm",
          defaultMessage: "Virtual Machine",
        }),
        auth: {
          type: "action",
          resource: "vm",
          authKey: "virtualization.tag.management",
        },
      },
    ],
    [
      ResourceTypeEnum.Host,
      {
        label: intl.formatMessage({
          id: "virtualization.host",
          defaultMessage: "Host",
        }),
        auth: {
          type: "action",
          resource: "host",
          authKey: "tag.management",
        },
      },
    ],
  ]);

  const resourceTypeList = [...resourceTypeMap.entries()]
    .filter(([, { auth }]) => !auth || hasAuth(auth))
    .map(([key, { label }]) => ({ key, label }));

  return { resourceTypeMap, resourceTypeList };
};

export interface ISelectResourceProps {
  setResourceType: (resourceType: ResourceTypeEnum) => void;
  selectedList: ITag[];
}

const SelectResourceEle: React.FC<ISelectResourceProps> = ({
  setResourceType,
  selectedList,
}) => {
  const intl = useIntl();

  const { resourceTypeMap } = useResourceTypeMap();

  const hostDisabled = React.useMemo(() => {
    const ownerUuidList = uniq(
      compact(selectedList).map((it) => it.owner?.uuid),
    );

    return difference(ownerUuidList, [ADMIN_UUID]).length > 0;
  }, [selectedList]);

  return (
    <Form.Item
      name="resourceType"
      label={intl.formatMessage({
        id: "virtualization.tag.bing.resource.modal.field.resourceType",
        defaultMessage: "Resource Type",
      })}
    >
      <RadioGroup
        onValueChange={(value) => setResourceType(value as ResourceTypeEnum)}
        options={[
          {
            value: ResourceTypeEnum.Vm,
            label: resourceTypeMap.get(ResourceTypeEnum.Vm)?.label,
          },
          {
            value: ResourceTypeEnum.Host,
            label: resourceTypeMap.get(ResourceTypeEnum.Host)?.label,
            disabled: hostDisabled,
            tooltip: hostDisabled
              ? intl.formatMessage({
                  id: "virtualization.tag.bing.resource.modal.field.resourceType.host.disabled.tooltip",
                  defaultMessage:
                    "You cannot select host type if the selected tag is owned by a regular user.",
                })
              : undefined,
          },
        ]}
      />
    </Form.Item>
  );
};

export interface IResourceListProps {
  form: FormInstance;
  visible: boolean;
  resourceType: ResourceTypeEnum;
  onChange: (value: any[]) => void;
  selectedList: ITag[];
}

const ResourceList: React.FC<IResourceListProps> = ({
  visible,
  resourceType,
  onChange: _onChange,
  selectedList = [],
}) => {
  const [value, onChange] = React.useState<Array<IVmInstance | IHost>>([]);

  const ownerConditions = React.useMemo<Array<ICondition>>(() => {
    const ownerUuidList = uniq(
      compact(selectedList).map((it) => it.owner?.uuid),
    );
    let ownerName;
    // 所选tag 仅有一种owner，非admin
    if (ownerUuidList.length === 1 && !ownerUuidList.includes(ADMIN_UUID)) {
      ownerName = selectedList?.[0].owner?.name;
    }

    // 所选tag admin 和 一个其他owner
    if (ownerUuidList.length === 2 && ownerUuidList.includes(ADMIN_UUID)) {
      ownerName = selectedList?.find((it) => it.owner?.uuid !== ADMIN_UUID)
        ?.owner?.name;
    }

    if (ownerName) {
      return [
        {
          key: "ownerName",
          op: Op.eq,
          value: ownerName,
        },
      ];
    }

    return [];
  }, [selectedList]);

  const defaultQuery = React.useMemo(
    () => ({
      vm: {
        conditions: [
          {
            key: "state",
            op: Op.ne,
            value: "Destroyed",
          },
          {
            key: "__tagUuid__",
            op: Op.notIn,
            values: selectedList?.map((it) => it.uuid),
          },
          ...ownerConditions,
        ],
      },
      host: {
        conditions: [
          {
            key: "hypervisorType",
            op: Op.notIn,
            values: ["ESX", "baremetal2"],
          },
          {
            key: "__tagUuid__",
            op: Op.notIn,
            values: selectedList?.map((it) => it.uuid),
          },
        ],
      },
    }),
    [selectedList, ownerConditions],
  );

  React.useEffect(() => {
    _onChange(value);
  }, [value]);

  React.useEffect(() => {
    if (!visible) {
      onChange([]);
    }
  }, [visible]);

  return (
    <Form.Item name="resource">
      {resourceType === ResourceTypeEnum.Vm ? (
        <VmList
          view="select.virtualization"
          gql={_vmInstanceList}
          onChange={onChange}
          defaultQuery={defaultQuery.vm}
        />
      ) : null}

      {resourceType === ResourceTypeEnum.Host ? (
        <HostList
          view="select"
          onChange={onChange}
          defaultQuery={defaultQuery.host}
        />
      ) : null}
    </Form.Item>
  );
};

const Action: React.FC<IActionWrapperProps<ITag>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();

  const [currentStep, setCurrentStep] = React.useState<number>(0);

  const [resourceType, setResourceType] = React.useState<ResourceTypeEnum>(
    ResourceTypeEnum.Vm,
  );

  const [value, onChange] = React.useState<Array<IVmInstance | IHost>>([]);

  const onClose = React.useCallback(() => {
    setSelectedList?.([]);
    setVisible(false);
  }, [setSelectedList, setVisible]);

  const basicTitle = intl.formatMessage({
    id: "virtualization.tag.action.bind.resource.modal.title",
    defaultMessage: "Attach Resource",
  });

  const title = React.useMemo(() => {
    if (currentStep === 0) {
      return basicTitle;
    }

    let resourceTitle = "";

    switch (resourceType) {
      case ResourceTypeEnum.Vm:
        resourceTitle = intl.formatMessage({
          id: "select.vm",
          defaultMessage: "Select Virtual Machine",
        });
        break;
      case ResourceTypeEnum.Host:
        resourceTitle = intl.formatMessage({
          id: "select.host",
          defaultMessage: "Select Host",
        });
        break;
      default:
        resourceTitle = "";
    }

    return resourceTitle;
  }, [resourceType, intl, currentStep, basicTitle]);

  const onOk = React.useCallback(async () => {
    const resourceUuids = value.map((it) => it.uuid);

    const payload = selectedList.map((it) => ({
      tagUuid: it.uuid,
      resourceUuids,
    }));

    if (!isEmpty(value)) {
      doAction({
        mutation: attachTag,
        payload,
        name: basicTitle,
        total: 1,
        type: "Tag",
        onProgress: () => {
          onClose();
        },
      });
    } else {
      onClose();
    }
  }, [doAction, onClose, selectedList, value, basicTitle]);

  const steps = React.useMemo<Array<{ key: string; content: React.ReactNode }>>(
    () => [
      {
        key: "select.resource",
        content: (
          <SelectResourceEle
            setResourceType={setResourceType}
            selectedList={selectedList}
          />
        ),
      },
      {
        key: "resource.list",
        content: (
          <ResourceList
            form={form}
            resourceType={resourceType}
            onChange={onChange}
            visible={visible}
            selectedList={selectedList}
          />
        ),
      },
    ],
    [form, resourceType, visible, selectedList],
  );

  const footerEle = React.useMemo<JSX.Element>(() => {
    return (
      <DialogFooter className="gap-2">
        <Button key="cancel" onClick={() => setVisible(false)} variant="link">
          {intl.formatMessage({ id: "bottun.cancel", defaultMessage: "Cancel" })}
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button
            key="nextStep"
            variant="primary"
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            {intl.formatMessage({
              id: "nextStep",
              defaultMessage: "Next",
            })}
            <Icon style={{ marginLeft: 4 }} type="arrow-ios-right" />
          </Button>
        ) : (
          <Button
            key="ok"
            variant="primary"
            onClick={() => onOk()}
            disabled={isEmpty(value)}
          >
            {intl.formatMessage({ id: "button.ok", defaultMessage: "OK" })}
          </Button>
        )}
      </DialogFooter>
    );
  }, [currentStep, intl, onOk, setVisible, steps, value]);

  React.useEffect(() => {
    if (!visible) {
      setCurrentStep(0);
      setResourceType(ResourceTypeEnum.Vm);
      form.resetFields();
    }
  }, [visible]);

  return (
    <DialogForm
      title={title}
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      footer={footerEle}
      widthClassName={currentStep === 0 ? "w-150" : "w-200"}
      className={style.modal}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form
        form={form}
        initialValues={{
          resourceType: ResourceTypeEnum.Vm,
        }}
      >
        <div className={style.steps}>
          <Steps current={currentStep} direction="horizontal">
            {steps.map((step) => (
              <Steps.Step key={step.key} title={step.key} />
            ))}
          </Steps>
        </div>

        <div>{steps[currentStep].content}</div>
      </Form>
    </DialogForm>
  );
};

export default Action;
