import { gql, useApolloClient } from "@apollo/client";

interface IProps {
  type: string;
  uuid: string;
  fields: string;
  inventory: {
    [any: string]: any;
  };
}

export const useWriteFragment = () => {
  const apollo = useApolloClient(); //使用 useApolloClient 拿到当前应用的 client

  // 进行输入验证的辅助函数
  const validateInput = (props: IProps) => {
    if (!props.type || !props.uuid || !props.fields) {
      throw new Error("Invalid input: type, uuid, or fields are missing");
    }
  };

  return ({ type, uuid, fields, inventory }: IProps) => {
    validateInput({ type, uuid, fields, inventory });

    try {
      const fragmentDefinition = gql`
      fragment ${type}Fragment on ${type} {
        ${fields}
      }
    `;

      // 使用 Apollo Client 缓存机制
      const fragmentId = apollo.cache.identify({
        __typename: type,
        uuid,
      });

      apollo.writeFragment({
        id: fragmentId,
        fragment: fragmentDefinition,
        data: inventory,
        broadcast: false, // 只更新需要修改的字段,其余字段不通过fetchPolicy更新
      });
    } catch (e) {
      console.error("Error writing fragment:", e);
    }
  };
};
