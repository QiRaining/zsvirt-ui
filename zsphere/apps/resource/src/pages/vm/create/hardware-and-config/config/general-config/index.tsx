import SelectTag from "@zstack/virtualization-resource/src/pages/tag/components/select-tag/index";
import {
  Form,
  InputDebounce,
  ModalSelect,
  Switch,
  TextArea,
} from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { VmGroupPlainList } from "zsv_reliability_shared/vm-scheduling-rule/vm-group/mf-index";

import styles from "./style.module.less";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  source?: any;
}

const { Item } = Form;

const INPUT_WIDTH_320_STYLE = { width: 320 } as const;
const MODAL_SELECT_WIDTH_320_STYLE = { width: 320 } as const;

const GeneralConfig: React.FC<IProps> = ({ form, source }) => {
  const intl = useIntl();
  useEffect(() => {
    form.setFieldsValue({
      tags: [],
    });
  }, []);

  const defaultQueryVmGroupList = useMemo(() => {
    //需要根据选中运行位置来判断
    return {
      conditions:
        source?.__typename === "Zone"
          ? [{ key: "zoneUuid", op: Op.eq, value: source?.uuid }]
          : [],
    };
  }, [form]);

  return (
    <div className={styles.content}>
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.config.general.config.tag",
          defaultMessage: "Tag",
        })}
        name="tags"
      >
        <SelectTag className="width-320" />
      </Item>
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.config.general.hostname",
          defaultMessage: "Hostname",
        })}
        name="hostname"
      >
        <InputDebounce style={INPUT_WIDTH_320_STYLE} />
      </Item>
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.config.general.schduled.group",
          defaultMessage: "VM Scheduling Group",
        })}
        name="vmGroupList"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.create.instance.config.general.schduled.group.tooltip",
              defaultMessage: `### VM Scheduling Group

1. A virtual machine can be added to only one VM scheduling group. After the addition, the virtual machine will be scheduled based on the scheduling policy associated with the group.

2. The scheduling policies associated with a VM scheduling group can be classified into the following four types: VM Exclusive from Each Other, VM Affinitive to Each Other, VMs Affinitive to Hosts, and VMs Exclusive from Hosts.
          `,
            })}
          </ReactMarkdown>
        }
      >
        <ModalSelect
          title={intl.formatMessage({
            id: "select.vmGroup",
            defaultMessage: "Select VM Scheduling Group",
          })}
          selectType="radio"
          style={MODAL_SELECT_WIDTH_320_STYLE}
        >
          <VmGroupPlainList
            view="select"
            defaultQuery={defaultQueryVmGroupList}
          />
        </ModalSelect>
      </Item>
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.config.general.biosTimeSync",
          defaultMessage: "Sync with Host BIOS Time",
        })}
        name="biosTimeSync"
        valuePropName="checked"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.create.instance.config.general.biosTimeSync.tooltip",
              defaultMessage: `### Sync with Host BIOS Time

1. Specifies whether to sync Windows VM time with the host BIOS time. If enabled, Windows VM time is the same as that of the host. By default, the sync is disabled。

2. Note:
* If you enable time synchronization for a running Windows VM, the VM time is synchronized with the host BIOS time automatically.
* If you enable time synchronization for a Windows VM (shut down/paused), the setting takes effect after the VM reboots.
* If you disable time synchronization for a Windows VM, the VM time is not synchronized with the host BIOS time.
* The time synchronization setting does not take effect on Linux VMs.`,
            })}
          </ReactMarkdown>
        }
      >
        <Switch />
      </Item>
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.config.general.userData",
          defaultMessage: "User Data",
        })}
        name="userData"
      >
        <TextArea className={styles.userData} />
      </Item>
    </div>
  );
};

export default React.memo(GeneralConfig);
