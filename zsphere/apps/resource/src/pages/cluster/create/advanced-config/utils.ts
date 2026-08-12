import _ from "lodash-es";

// CPU超分率校验
const cpuOverProvisionReg = /^([1-9]\d{0,2}|1000)$/;
export const validCpuOverProvision = async (
  _rule: any,
  value: string,
  intl: any,
) => {
  if (value === "" || cpuOverProvisionReg.test(value)) {
    return;
  }
  throw intl.formatMessage({
    id: "illegal.input",
    defaultMessage: "Invalid input.",
  });
};

// 内存超分率校验 && 主存储超分率校验
const memoryOverProvisionReg =
  /^([1-9]\d{0,2}|[1-9]\d{0,2}(\.\d{1,2}?)|1000|1000.0|1000.00)$/;
export const validMemoryOverProvision = async (
  _rule: any,
  value: string,
  intl: any,
) => {
  if (value === "" || memoryOverProvisionReg.test(value)) {
    return;
  }
  throw intl.formatMessage({
    id: "illegal.input",
    defaultMessage: "Invalid input.",
  });
};

export const isExist = (value: any): boolean =>
  !_.isNil(value) && !_.isEmpty(value);

export const validCidr0 = (_rule: any, value: string, intl: any) => {
  if (_.isEmpty(value)) {
    return Promise.resolve();
  }

  const [ip, netmask] = value.split("/");
  const ipArray = ip.split(".");

  const last = ipArray.pop();
  ipArray.push("0");

  if (last === "0") {
    return Promise.resolve();
  }
  return Promise.reject(
    new Error(
      intl.formatMessage(
        {
          id: "virtualization.cluster.network.setting.cidr.valid.message",
          defaultMessage:
            "Format incorrect, {m} is non-standard CIDR, use {n} (i.e., last for 0).",
        },
        {
          m: value,
          n: [ipArray.join("."), netmask].join("/"),
        },
      ),
    ),
  );
};

export const transformKvmReservedMemory = (value?: string) => {
  const _value = value ?? "0";

  const memoryUnitMap = new Map([
    ["K", "KB"],
    ["M", "MB"],
    ["G", "GB"],
  ]);

  const memoryUnitList = [...memoryUnitMap.entries()].map(
    ([key, displayName]) => ({
      displayName,
      key,
    }),
  );

  const keys = memoryUnitList.map((it) => it.key);

  let unit = "G";
  keys.forEach((key) => {
    if (_value.includes(key)) {
      unit = key;
    }
  });

  return {
    number: Number(_value.replace(unit, "")) || 1,
    unit,
  };
};
