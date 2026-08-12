import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Host as IHost } from "@zstack/zsphere-types/graphql";
import React, { useCallback } from "react";

import VirCreate from "./virtualization/create";
import VirSingleCreate from "./virtualization/single-create";

const Action: React.FC<IActionWrapperProps<IHost>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  position,
  ...rest
}) => {
  const onBack = useCallback(() => {
    setVisible(false);
    setSelectedList?.([]);
  }, [setVisible]);

  return position === "toolbar" ? (
    <VirCreate
      position={position}
      visible={visible}
      setVisible={setVisible}
      selectedList={selectedList}
      setSelectedList={setSelectedList}
      {...rest}
      onBack={onBack}
    />
  ) : (
    <VirSingleCreate
      position={position}
      visible={visible}
      setVisible={setVisible}
      selectedList={selectedList}
      setSelectedList={setSelectedList}
      {...rest}
      onBack={onBack}
    />
  );
};

export default Action;
