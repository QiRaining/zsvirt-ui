import React from "react";

import styles from "./style.module.less";

interface INodeEmptyStateProps {
  description?: string;
}

const NodeEmptyState: React.FC<INodeEmptyStateProps> = ({ description }) => {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <img
          src={require("../assets/inbox.webp")}
          alt="empty"
          className={styles.icon}
        />
      </div>
      {description && <div className={styles.description}>{description}</div>}
    </div>
  );
};

export default NodeEmptyState;
