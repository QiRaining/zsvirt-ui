import {
  DetailBreadcrumb,
  Header,
  Action,
  Tag,
} from "@zstack/zsphere-components";
import type { SNSTextTemplate as ISNSTextTemplate } from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import useActionConfig from "../config/useActionConfig";
// import UpdateModal from '../action/update-modal'

import styles from "./style.module.less";

interface IProps {
  current: ISNSTextTemplate;
  refetch: any;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { name, description: _description, defaultTemplate } = current;
  const intl = useIntl();
  const selectedList = [current];
  const { list, viewMap } = useActionConfig();
  const [_visible, setVisible] = useState(false);
  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon="file-text"
        title={
          defaultTemplate ? (
            <div className="flex items-center gap-2">
              {name}
              <Tag round level="weak" className={styles["header-default-tag"]}>
                {intl.formatMessage({ id: "default", defaultMessage: "Default" })}
              </Tag>
            </div>
          ) : (
            name!
          )
        }
        onEdit={() => setVisible(true)}
        actions={
          <Action
            view="main"
            menuList={list}
            viewMap={viewMap}
            position="header"
            refetch={refetch}
            selectedList={selectedList}
          />
        }
      />
      {/* <UpdateModal
        view="main"
        position="header"
        visible={visible}
        setVisible={setVisible}
        selectedList={selectedList}
        refetch={refetch}
      /> */}
    </>
  );
};

export default DetailHeader;
