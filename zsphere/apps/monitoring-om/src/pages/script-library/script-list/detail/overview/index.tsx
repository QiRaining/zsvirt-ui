import { Row, Col } from "@zstack/zsphere-components";
import type { Script as IScript } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React from "react";

import BasicInfo from "./basic-info";
import CustomParams from "./custom-params";
import ScriptContent from "./script-content";

interface IProps {
  current: IScript;
  scriptContent?: string;
  renderParams?: string;
  refetch?: () => void;
}
// 执行记录-详情页-脚本信息-复用此页面，会传 scriptContent 和 renderParams，因为执行记录的脚本信息应该是执行当下的脚本信息
const Overview: FC<IProps> = ({
  current,
  scriptContent,
  renderParams,
  refetch,
}) => {
  const isRecord = window?.location?.pathname?.includes("record-list/detail");
  const _current = {
    ...current,
    renderParams: isRecord ? renderParams : current?.renderParams,
    scriptContent: isRecord ? scriptContent : current?.scriptContent,
  };
  const _renderParams = _current?.renderParams
    ? JSON.parse(_current?.renderParams)
    : [];
  return (
    <Row gutter={20}>
      <Col span={8}>
        <Row gutter={[20, 20]}>
          <Col span={24}>
            <BasicInfo detail={current} refetch={refetch} />
          </Col>
        </Row>
      </Col>
      <Col span={16}>
        <Row gutter={[20, 20]}>
          <Col span={24}>
            <ScriptContent detail={_current} />
          </Col>
          {_renderParams?.length > 0 && (
            <Col span={24}>
              <CustomParams detail={_current} />
            </Col>
          )}
        </Row>
      </Col>
    </Row>
  );
};

export default React.memo(Overview);
