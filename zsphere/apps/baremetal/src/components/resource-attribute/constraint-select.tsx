import { Select } from "@zstack/zsphere-components";
import type { ResourceAttributeConstraint } from "@zstack/zsphere-types/graphql";
import { useMemo, useState } from "react";

export interface IProps {
  value?: string | null;
  onChange?: (value: string | null | undefined) => void;
  constraints?: ResourceAttributeConstraint[];
  disableCreation?: boolean;
}

export default function ConstraintSelect({
  value,
  onChange,
  constraints,
  disableCreation,
}: IProps) {
  const [visible, setVisible] = useState(false);

  const options = useMemo(
    () =>
      constraints?.map((item) => ({
        label: item.parameter,
        value: item.parameter,
      })) ?? [],
    [constraints],
  );

  const handleChange = (valueList: string[]) => {
    if (valueList.length) {
      onChange?.(valueList[valueList.length - 1]);
    } else {
      onChange?.(null);
    }
    setVisible(false);
  };

  return (
    <Select
      open={visible}
      onDropdownVisibleChange={(val) => setVisible(val)}
      value={value ? [value] : []}
      onChange={handleChange}
      mode={disableCreation ? "multiple" : "tags"}
      options={options}
      getPopupContainer={() => document.body}
    />
  );
}
