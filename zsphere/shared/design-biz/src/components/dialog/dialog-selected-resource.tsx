"use client";

import { Text } from "@zstack/design";
import { useIntl } from "react-intl";

interface DialogSelectedResourceProps {
  names: string[];
  description?: React.ReactNode;
}
export const DialogSelectedResource = ({
  names,
  description,
}: DialogSelectedResourceProps) => {
  const intl = useIntl();

  return (
    <>
      <div className="mb-2 text-sm text-neutral-600">
        {description ||
          intl.formatMessage(
            {
              id: "has.selectedCount",
              defaultMessage: "Selected Items: {selectedCount}",
            },
            {
              selectedCount: (
                <span className="font-bold text-neutral-700">
                  {names.length}
                </span>
              ),
            },
          )}
      </div>
      <div className="box-border flex max-h-[calc(37vh)] flex-col gap-y-2 overflow-y-auto rounded border border-neutral-300 px-4 py-3">
        {names.map((name, index) => (
          <div key={index} className="flex flex-row items-center text-sm">
            <div className="mr-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-500" />
            <Text className="flex-1 text-neutral-700">{name}</Text>
          </div>
        ))}
      </div>
    </>
  );
};
