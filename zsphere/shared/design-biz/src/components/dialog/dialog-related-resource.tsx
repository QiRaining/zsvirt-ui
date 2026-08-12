"use client";

import { useIntl } from "react-intl";

interface DialogRelatedResourceProps {
  resourceList: { name: string; count: number }[];
  resourceName: string;
}
export const DialogRelatedResource = (props: DialogRelatedResourceProps) => {
  const { resourceList, resourceName } = props;
  const intl = useIntl();
  return (
    <div className="text-sm text-neutral-600">
      {intl.formatMessage(
        {
          id: "current.have.related.resources",
          defaultMessage: "The following {resourceListStr} is associated with the selected {resourceName}.",
        },
        {
          resourceListStr: (
            <>
              {resourceList.map((resource, index) => (
                <span key={index}>
                  {index > 0 &&
                    (index === resourceList.length - 1 ? "和" : "、")}
                  <span className="font-bold text-neutral-700">
                    &nbsp;{resource.count}&nbsp;
                  </span>
                  {resource.name}
                </span>
              ))}
            </>
          ),
          resourceName,
        },
      )}
    </div>
  );
};
