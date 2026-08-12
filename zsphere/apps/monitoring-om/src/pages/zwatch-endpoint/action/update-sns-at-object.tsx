import { gql, useLazyQuery } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { EndPointType, Op } from "@zstack/zsphere-types";
import type {
  FeiShuEndPoint,
  WeComEndPoint,
  DingTalkEndPoint,
  UpdateDingTalkMsgPayload,
  UpdateFeiShuMsgPayload,
  UpdateWeComMsgPayload,
  AtPersonInput,
  SNSDingTalkAtPerson,
  SNSFeiShuAtPerson,
  SNSWeComAtPerson,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import type { AtPersonType } from "../components";
import { AtPersonFormItems } from "../components";
import type { AreaCodePhoneNumber } from "../create/basic-config";

import style from "./style.module.less";

export type ComposedEndPoint =
  | FeiShuEndPoint
  | WeComEndPoint
  | DingTalkEndPoint;

type ComposedPayload =
  | UpdateFeiShuMsgPayload
  | UpdateWeComMsgPayload
  | UpdateDingTalkMsgPayload;
type FormValues = {
  updateFeiShu?: {
    object: AtPersonType;
    atPersonList: AtPersonInput[];
  };
  updateWeCom?: {
    object: AtPersonType;
    atPersonList: AtPersonInput[];
  };
  updateDingTalk?: {
    object: AtPersonType;
    atPersonList: Array<AreaCodePhoneNumber & { remark?: string }>;
  };
};

function isDingTalkEndPoint(
  detail: ComposedEndPoint,
): detail is DingTalkEndPoint {
  return detail.type === EndPointType.DingTalk;
}

const refetchResourceTypeMap: Record<
  EndPointType.FeiShu | EndPointType.WeCom | EndPointType.DingTalk,
  "SNSDingTalkAtPerson" | "SNSFeiShuAtPerson" | "SNSWeComAtPerson"
> = {
  [EndPointType.FeiShu]: "SNSFeiShuAtPerson",
  [EndPointType.WeCom]: "SNSWeComAtPerson",
  [EndPointType.DingTalk]: "SNSDingTalkAtPerson",
};

const mutationMap: Record<
  EndPointType.FeiShu | EndPointType.WeCom | EndPointType.DingTalk,
  ReturnType<typeof gql>
> = {
  [EndPointType.FeiShu]: gql`
    mutation updateFeiShuMsg($input: UpdateFeiShuMsgInput!) {
      updateFeiShuMsg(input: $input) {
        actionId
      }
    }
  `,
  [EndPointType.WeCom]: gql`
    mutation updateWeComMsg($input: UpdateWeComMsgInput!) {
      updateWeComMsg(input: $input) {
        actionId
      }
    }
  `,
  [EndPointType.DingTalk]: gql`
    mutation updateDingTalkMsg($input: UpdateDingTalkMsgInput!) {
      updateDingTalkMsg(input: $input) {
        actionId
      }
    }
  `,
};

const queryMap = {
  [EndPointType.DingTalk]: gql`
    query querySNSDingTalkAtPersonList($conditions: [Condition!]) {
      querySNSDingTalkAtPersonList(conditions: $conditions) {
        list {
          uuid
          phoneNumber
          remark
        }
      }
    }
  `,
  [EndPointType.FeiShu]: gql`
    query querySNSFeiShuAtPersonList($conditions: [Condition!]) {
      querySNSFeiShuAtPersonList(conditions: $conditions) {
        list {
          uuid
          userId
          remark
        }
      }
    }
  `,
  [EndPointType.WeCom]: gql`
    query querySNSWeComAtPersonList($conditions: [Condition!]) {
      querySNSWeComAtPersonList(conditions: $conditions) {
        list {
          uuid
          userId
          remark
        }
      }
    }
  `,
};

const UpdateSNSObjectAction: React.FC<
  IActionWrapperProps<ComposedEndPoint>
> = ({ visible, setVisible, selectedList }) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();

  const selectedItem = useMemo(() => {
    return selectedList[0];
  }, [selectedList]);

  const [
    getAtPersonList,
    { data: atPersonListData, refetch: refetchAtPersonList },
  ] = useLazyQuery(queryMap[selectedItem.type as keyof typeof queryMap]);

  useEffect(() => {
    getAtPersonList({
      variables: {
        conditions: [
          {
            key: "endpointUuid",
            op: Op.eq,
            value: selectedItem.uuid,
          },
        ],
      },
    });
  }, [selectedItem]); // 右侧成员列表变化时，通知对象详情数据会变化，此时需拉最新数据，以更新表单值

  useEffect(() => {
    const getInitialValues = () => {
      const { atAll, type, atPersonList } = selectedItem;
      let objType: AtPersonType;

      if (atAll) {
        objType = "atAll";
      } else if (atPersonList?.length) {
        objType = "atPerson";
      } else {
        objType = "none";
      }

      switch (type) {
        case EndPointType.DingTalk:
          return {
            updateDingTalk: {
              object: objType,
              atPersonList:
                atPersonListData?.querySNSDingTalkAtPersonList?.list?.map(
                  (item: SNSDingTalkAtPerson) => {
                    const [areaCode = "+86", phoneNumber] =
                      item.phoneNumber?.split("-") || [];

                    return {
                      areaCode: areaCode.split("+")?.[1],
                      phoneNumber,
                      remark: item.remark,
                    };
                  },
                ),
            },
          };
        case EndPointType.FeiShu:
          return {
            updateFeiShu: {
              object: objType,
              atPersonList:
                atPersonListData?.querySNSFeiShuAtPersonList?.list?.map(
                  (item: SNSFeiShuAtPerson) => ({
                    userId: item.userId,
                    remark: item.remark,
                  }),
                ),
            },
          };
        case EndPointType.WeCom:
          return {
            updateWeCom: {
              object: objType,
              atPersonList:
                atPersonListData?.querySNSWeComAtPersonList?.list?.map(
                  (item: SNSWeComAtPerson) => ({
                    userId: item.userId,
                    remark: item.remark,
                  }),
                ),
            },
          };

        default:
          break;
      }
    };

    if (visible && atPersonListData) {
      form.setFieldsValue(getInitialValues());
    }
  }, [form, visible, atPersonListData]);

  const getPayload = React.useCallback(
    (values: FormValues): ComposedPayload => {
      const commonParams: ComposedPayload = {
        uuid: selectedItem.uuid,
      };
      const nextObject =
        values.updateFeiShu?.object ||
        values.updateWeCom?.object ||
        values.updateDingTalk?.object;

      if (nextObject === "atAll") {
        commonParams.atAll = true;
      } else {
        commonParams.atAll = false;
      }

      if (isDingTalkEndPoint(selectedItem)) {
        return {
          ...commonParams,
          atPersonList: values.updateDingTalk?.atPersonList?.map((it) => ({
            phoneNumber: `+${it?.areaCode}-${it?.phoneNumber}`,
            remark: it.remark,
          })),
        };
      }

      return {
        ...commonParams,
        atPersonList:
          values.updateFeiShu?.atPersonList ||
          values.updateWeCom?.atPersonList ||
          [],
      };
    },
    [selectedItem],
  );

  const onOk = async (values: FormValues) => {
    const endPointType = selectedItem.type as keyof typeof mutationMap;

    doAction<ComposedPayload>({
      mutation: mutationMap[endPointType],
      payload: getPayload(values),
      name: intl.formatMessage({
        id: "zwatch.endpoint.change_object",
        defaultMessage: "Modify Mentioned Member",
      }),
      total: 1,
      type: refetchResourceTypeMap[endPointType], // 修改 endpoint 详情内的对象时，需触发右侧成员列表 refetch
      onFinish() {
        // 更新单独的艾特成员，用于表单回填
        refetchAtPersonList?.();
      },
    });
  };

  return (
    <DialogForm
      widthClassName="w-200"
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "zwatch.endpoint.change_object",
        defaultMessage: "Modify Mentioned Member",
      })}
      form={form}
      onOk={onOk}
    >
      <Form form={form} className={style.updateSNSAtObjectForm}>
        <AtPersonFormItems
          supportAtType={
            selectedItem.type === EndPointType.DingTalk
              ? "phoneNumber"
              : "userId"
          }
          form={form}
          parentFieldName={`update${selectedItem.type}`}
        />
      </Form>
    </DialogForm>
  );
};

export default UpdateSNSObjectAction;
