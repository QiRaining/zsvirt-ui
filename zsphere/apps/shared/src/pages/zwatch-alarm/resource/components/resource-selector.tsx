import type { FormInstance } from "antd/es/form";
import React from "react";

import METRICS_JSON from "../constant/Metrics.json";
import ResourceCom from "./resource";

interface IProps {
  namespace: string;
  metricName: string;
  resourceUuid?: string;
  form: FormInstance;
  isDefault?: boolean;
  componentMap?: any;
}

export interface IResource {
  uuid: string;
  [prop: string]: string;
}

const ResourceSelector: React.FC<IProps> = ({
  namespace,
  metricName,
  resourceUuid,
  form,
  isDefault = false,
  componentMap,
}) => {
  // @ts-expect-error
  const labelNames = METRICS_JSON[namespace]?.[metricName]?.labelNames || [];

  return (
    <>
      {!isDefault && labelNames.length > 0 && (
        <ResourceCom
          form={form}
          name="resources"
          namespace={namespace}
          metricName={metricName}
          resourceUuid={resourceUuid}
          componentMap={componentMap}
        />
      )}
    </>
  );
};

export default ResourceSelector;
