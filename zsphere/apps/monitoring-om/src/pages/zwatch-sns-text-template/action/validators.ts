import type { SNSTextTemplate as ISNSTextTemplate } from "@zstack/zsphere-types/graphql";
// one
const one = async (selectedList: ISNSTextTemplate[]) => {
  return selectedList.length === 1;
};

// many
const many = async (selectedList: ISNSTextTemplate[]) => {
  return selectedList.length >= 1;
};

const canCancelDefault = async (current: ISNSTextTemplate) => {
  return !current.defaultTemplate;
};

const canSetDefault = async (current: ISNSTextTemplate) => {
  return !!current.defaultTemplate;
};

export { one, many, canCancelDefault, canSetDefault };
