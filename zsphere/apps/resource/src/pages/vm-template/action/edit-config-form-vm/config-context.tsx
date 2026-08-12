import React from "react";

export interface ConfigProps {
  disabled: boolean;
  tooltip?: string;
  pciDeviceTooltip?: undefined;
  memorytooltip?: undefined;
  cpuNumTooltip?: undefined;
  cpuNumDisabled?: boolean;
  memoryDisabled?: boolean;
  pciDeviceDisabled?: boolean;
}

export const ConfigContext = React.createContext<ConfigProps>({
  disabled: false,
  tooltip: undefined,
  pciDeviceTooltip: undefined,
  memorytooltip: undefined,
  cpuNumTooltip: undefined,
  cpuNumDisabled: false,
  memoryDisabled: false,
  pciDeviceDisabled: false,
});

const ConfigProvider: React.FC<ConfigProps> & {
  ConfigContext: typeof ConfigContext;
} = (props) => {
  const { children, ...config } = props;

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

ConfigProvider.ConfigContext = ConfigContext;

export default ConfigProvider;
