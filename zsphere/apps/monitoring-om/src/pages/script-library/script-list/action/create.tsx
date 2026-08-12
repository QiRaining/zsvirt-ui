import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { ImagePlatform, ScriptType } from "@zstack/zsphere-types";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { CreateScriptPayload } from "@zstack/zsphere-types/graphql";
import * as _ from "lodash-es";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import BasicConfig from "./basic-config";

const createScript = gql`
  mutation createScript($input: CreateScriptInput!) {
    createScript(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<any>> = ({
  visible,
  setVisible,
  selectedList: _selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();

  const initialValues = useMemo(() => {
    return {
      platform: ImagePlatform.Linux,
      scriptType: ScriptType.Shell,
      scriptTimeout: { number: 60, unit: "second" },
      scriptContent: "#!/bin/bash",
      renderParams: [],
    };
  }, []);

  const onOk = useCallback(async () => {
    try {
      const formData = await form.validateFields();
      const payload = _.cloneDeep(formData);

      // 转换数据格式
      let {
        scriptTimeout: { number, unit },
        scriptContent,
        renderParams,
        ...param
      } = payload;

      let _timeout = number;
      switch (unit) {
        case "minute":
          _timeout = number * 60;
          break;
        case "hour":
          _timeout = number * 60 * 60;
          break;
      }

      renderParams = Array.isArray(renderParams) ? renderParams : [];

      const finalPayload: CreateScriptPayload = {
        scriptTimeout: _timeout,
        ...(renderParams?.length > 0
          ? { renderParams: JSON.stringify(renderParams) }
          : undefined),
        encodingType: "Base64",
        scriptContent: require("../../../utils").base64Encode(
          scriptContent?.replace(
            /\r?\n/g,
            param?.platform === ImagePlatform.Linux ? "\n" : "\r\n",
          ),
        ),
        ...param,
      };

      doAction({
        mutation: createScript,
        payload: finalPayload,
        name: intl.formatMessage({
          id: "create.script",
          defaultMessage: "Create Script",
        }),
        total: 1,
        type: "Script",
        onFinish: () => {
          setSelectedList?.([]);
          setVisible(false);
        },
      });
    } catch {
      // 表单验证失败
    }
  }, [form, doAction, intl, setSelectedList, setVisible]);

  return (
    <DialogForm
      form={form}
      title={intl.formatMessage({
        id: "create.script",
        defaultMessage: "Create Script",
      })}
      visible={visible}
      setVisible={setVisible}
      widthClassName="w-250"
      onOk={onOk}
      onCancel={() => {
        form.resetFields();
        setVisible(false);
      }}
    >
      <Form form={form} initialValues={initialValues}>
        <BasicConfig form={form} />
      </Form>
    </DialogForm>
  );
};

export default Action;
