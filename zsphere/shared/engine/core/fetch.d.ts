export declare function fetchData(
  type: "Field" | "Action" | "Constant" | "GlobalConfig",
  extraParams?: {
    resourceKey?: string;
  },
): Promise<any>;
