import { Header } from "@zstack/zsphere-components";
import { useIntl } from "react-intl";

const ProtectedResourceHeader = () => {
  const intl = useIntl();
  return (
    <Header.List
      className="main-list-header-tabs"
      title={intl.formatMessage({
        id: "protected.resource.title",
        defaultMessage: "Protected Resources",
      })}
    />
  );
};

export default ProtectedResourceHeader;
