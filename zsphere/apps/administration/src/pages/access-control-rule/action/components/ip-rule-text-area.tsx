import { Tooltip } from "@zstack/design";
import { TextArea } from "@zstack/zsphere-components";
import { useCallback } from "react";
import { useIntl } from "react-intl";

import style from "../style.module.less";

export interface IpRuleTextAreaProps {
  value?: string[];
  onChange?: (value: string[]) => void;
}

const STYLE_WORD_BREAK_ALL = { wordBreak: "break-all" } as const;

export default function IpRuleTextArea({
  value,
  onChange,
  ...props
}: IpRuleTextAreaProps) {
  const intl = useIntl();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(event.target.value.split(","));
    },
    [onChange],
  );
  return (
    <Tooltip
      title={
        <span style={STYLE_WORD_BREAK_ALL}>
          {intl.formatMessage({
            id: "virtualization.accessControlRule.field.rule.hover",
            defaultMessage:
              "Example: 192.168.2.3, 192.122.12.1-192.122.12.90, 192.130.10.1/32.",
          })}
        </span>
      }
    >
      <TextArea
        className={style["width-320"]}
        value={value?.join(",")}
        onChange={handleChange}
        {...props}
      />
    </Tooltip>
  );
}
