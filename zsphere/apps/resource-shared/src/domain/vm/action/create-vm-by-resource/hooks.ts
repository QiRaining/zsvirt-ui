import { replace } from "lodash-es";

export const getSystemTagsFromNoIPAMInput = (
  l3NetworkUuid: string,
  formData: any = {},
) => {
  const systemTags: string[] = [];
  const keys = ["ipv4Netmask", "ipv4Gateway", "ipv6Prefix", "ipv6Gateway"];
  keys.forEach((key) => {
    const value = formData[key];
    if (value) {
      systemTags.push(
        `${key}::${l3NetworkUuid}::${replace(value, "::", "--")}`,
      );
    }
  });
  // 去掉systemTags相关的字段
  keys.forEach((key) => Reflect.deleteProperty(formData, key));
  return systemTags.length ? systemTags : undefined;
};
