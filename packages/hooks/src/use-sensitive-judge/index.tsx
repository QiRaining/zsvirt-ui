import { gql, useQuery } from "@apollo/client";

const globalConfig = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
      uuid
    }
  }
`;

export const useSensitiveJudge = () => {
  let needValidate = true;

  const { data: validateData } = useQuery(globalConfig, {
    variables: {
      category: "ui",
      name: "delete.resource.double.check",
    },
  });

  if (validateData?.globalConfig?.value === "false") {
    needValidate = false;
  }

  return needValidate;
};
