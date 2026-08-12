import { Header } from "@zstack/zsphere-components";
import { useIntl } from "react-intl";

const IndexHeader = () => {
  const intl = useIntl();

  return (
    <Header.List
      title={intl.formatMessage({
        id: "virtualization.tag.management.header.title",
        defaultMessage: "Tag Management",
      })}
      className="main-list-header"
    />
  );
};

export default IndexHeader;
