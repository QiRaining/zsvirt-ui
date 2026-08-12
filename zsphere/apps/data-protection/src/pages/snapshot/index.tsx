import { Header } from "@zstack/zsphere-components";
import { useIntl } from "react-intl";
import { Main } from "zsv_data_protection_shared/snapshot/mf-index";

const Index = () => {
  const intl = useIntl();
  return (
    <div className="main-list-header-tabs-container">
      <Header.List
        className="main-list-header"
        title={intl.formatMessage({
          id: "virtualization.snapshot",
          defaultMessage: "Snapshot",
        })}
      />
      <div>
        <Main />
      </div>
    </div>
  );
};

export default Index;
