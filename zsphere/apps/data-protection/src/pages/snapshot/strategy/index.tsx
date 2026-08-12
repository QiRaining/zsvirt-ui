import { Header } from "@zstack/zsphere-components";
import { useIntl } from "react-intl";

import SnapshotStrategyList from "../../snapshot-strategy/list";

const snapshotStrategy = () => {
  const intl = useIntl();
  return (
    <div className="main-list-header-tabs-container">
      <Header.List
        className="main-list-header"
        title={intl.formatMessage({
          id: "virtualization.snapshot.strategy",
          defaultMessage: "Snapshot Policy",
        })}
      />
      <div className="zsv-list-padding">
        <SnapshotStrategyList view="main" />
      </div>
    </div>
  );
};

export default snapshotStrategy;
