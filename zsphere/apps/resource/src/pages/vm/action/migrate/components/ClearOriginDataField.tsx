import { Alert } from "@zstack/design";
import React from "react";

interface IClearOriginDataFieldrops {
  value?: React.ReactNode;
  className?: string;
}

const ClearOriginDataField = ({
  value,
  className,
}: IClearOriginDataFieldrops) => {
  const divRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (divRef.current) {
      divRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [value]);

  if (!value) {
    return null;
  }
  return (
    <div ref={divRef} className={className}>
      <Alert display="weak" variant="warning">
        {value}
      </Alert>
    </div>
  );
};

export default ClearOriginDataField;
