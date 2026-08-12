import { keys as _keys } from "lodash-es";
import type { FC } from "react";
import { useCallback } from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

interface IItemFieldProps {
  item: any;
  handleViewClick: ({
    title,
    apiList,
  }: {
    title: string;
    apiList: string[];
  }) => void;
}

const ItemField: FC<IItemFieldProps> = ({ item, handleViewClick }) => {
  const intl = useIntl();
  const { selectedAPINum = 0, api } = item;

  const handleClick = useCallback(() => {
    handleViewClick({
      title: item.name,
      apiList: Object.values(api).map((it: any) => {
        return {
          ...it,
          name: it.description,
        };
      }),
    });
  }, [api, handleViewClick, item.name]);

  return (
    <>
      <div className={styles.itemField}>
        <span>
          {intl.formatMessage({
            id: "privilegeService",
            defaultMessage: "Permissions",
          })}
          :{` (${selectedAPINum}/${_keys(api).length})`}
        </span>
        <span className={styles.link} onClick={handleClick}>
          {intl.formatMessage({
            id: "view",
            defaultMessage: "View",
          })}
        </span>
      </div>
    </>
  );
};

export default ItemField;
