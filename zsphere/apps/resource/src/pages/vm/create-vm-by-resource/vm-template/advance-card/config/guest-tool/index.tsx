import { Switch, Form, Select } from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

// Style constants
const INPUT_WIDTH_320_STYLE = { width: 320 } as const;

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
}

const { Item } = Form;

const GuestTools: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();

  const options = [
    {
      value: "Preserve",
      text: intl.formatMessage({
        id: "Preserve",
        defaultMessage: "No Action",
      }),
      key: 1,
    },
    {
      value: "Reboot",
      text: intl.formatMessage({
        id: "Reboot",
        defaultMessage: "Reboot",
      }),
      key: 2,
    },
    {
      value: "Shutdown",
      text: intl.formatMessage({
        id: "Shutdown",
        defaultMessage: "Shutdown",
      }),
      key: 3,
    },
  ];

  return (
    <div className={styles.content}>
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.config.guest.tools.fault.strategy",
          defaultMessage: "Failure Response Policy",
        })}
        name="faultStrategy"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.create.instance.config.guest.tools.fault.strategy.tooltip",
              defaultMessage: `### Failure Response Policy

Set an automatic response action for VM failures (Windows BSOD or Linux guest hang).

- No Action (default): Maintains current state without intervention.
- Reboot: Automatically reboots the VM. Stops after 5 reboot attempts within 30 minutes.
- Shut Down: Automatically shuts down the VM.

Notes:

- You can set this policy for VMs with the x86_64 CPU architecture.
- Before setting this policy, install VMTools on the VM and make sure the VMTools is running properly.
- This policy takes effect immediately after configuration and does not require a VM reboot. `,
            })}
          </ReactMarkdown>
        }
      >
        <Select style={INPUT_WIDTH_320_STYLE}>
          {options.map(({ value, text }) => (
            <Select.Option value={value} key={value}>
              {text}
            </Select.Option>
          ))}
        </Select>
      </Item>
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.config.guest.tools.time.sync",
          defaultMessage: "Time Synchronization",
        })}
        name="advancedConfigGuestToolTimeSync"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zsv.create.instance.config.guest.tools.time.sync.tooltip",
              defaultMessage: `### Time Synchronization

1. Specifies whether to sync VM time with the host system time. If enabled, the VM time is the same as that of the host system. By default, the sync is disabled.

2. Note:

* Before you enable the sync, make sure that Qemu Guest Agent (QGA) is installed on the VM and is running. You can install VMTools to install QGA.
* After you enable time synchronization for a VM, the VM time is synchronized with the host system time automatically.
* If you disable time synchronization for a VM, the VM time is not synchronized with the host system time.`,
            })}
          </ReactMarkdown>
        }
        valuePropName="checked"
      >
        <Switch />
      </Item>
    </div>
  );
};

export default React.memo(GuestTools);
