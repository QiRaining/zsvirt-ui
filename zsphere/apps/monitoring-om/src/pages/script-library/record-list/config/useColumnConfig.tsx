import { Constant, Text } from "@zstack/design";
import { Link } from "@zstack/unifie";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import { ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/script-execute-record";
import { ScriptExecuteRecordStatus, ScriptType } from "@zstack/zsphere-types";
import type { ScriptExecuteRecord } from "@zstack/zsphere-types/graphql";
import { useNavigate } from "react-router";

export default () => {
  const navigate = useNavigate();

  return useColumnConfig<ScriptExecuteRecord>([
    {
      key: "name",
      render: ({ uuid, recordName }) => {
        return (
          <Link
            onClick={() => {
              navigate(
                `/virtualization-monitoring-om/script-library/record-list/detail?uuid=${uuid}`,
              );
            }}
          >
            {recordName}
          </Link>
        );
      },
    },
    {
      key: "scriptName",
      render: ({ relatedScript, scriptUuid }) => {
        return (
          <Text>
            {relatedScript?.name ? (
              <Link
                onClick={() => {
                  navigate(
                    `/virtualization-monitoring-om/script-library/script-list/detail?uuid=${relatedScript?.uuid}`,
                  );
                }}
              >
                {relatedScript?.name}
              </Link>
            ) : (
              scriptUuid
            )}
          </Text>
        );
      },
    },
    {
      key: "scriptType",
      filterOptions: ScriptType,
      render: ({ relatedScript }) => relatedScript?.scriptType,
    },
    {
      key: "operator",
      render: ({ executor }) => (executor ? <Text>{executor}</Text> : null),
    },
    {
      key: "status",
      filters: [
        {
          text: (
            <Constant
              enumType={ConstantType.ScriptExecuteRecordStatus}
              value={"Exception" as ConstantEnum}
            />
          ),
          value: ScriptExecuteRecordStatus.Exception,
        },
        {
          text: (
            <Constant
              enumType={ConstantType.ScriptExecuteRecordStatus}
              value={"Failed" as ConstantEnum}
            />
          ),
          value: ScriptExecuteRecordStatus.Failed,
        },
        {
          text: (
            <Constant
              enumType={ConstantType.ScriptExecuteRecordStatus}
              value={"Running" as ConstantEnum}
            />
          ),
          value: ScriptExecuteRecordStatus.Running,
        },
        {
          text: (
            <Constant
              enumType={ConstantType.ScriptExecuteRecordStatus}
              value={"Succeed" as ConstantEnum}
            />
          ),
          value: ScriptExecuteRecordStatus.Succeed,
        },
      ],
      render: ({ status }) => {
        return (
          <Constant
            value={status}
            enumType={ConstantType.ScriptExecuteRecordStatus}
          />
        );
      },
    },
  ]);
};
