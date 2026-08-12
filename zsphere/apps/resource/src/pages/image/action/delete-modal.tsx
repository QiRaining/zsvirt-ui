import { gql, useLazyQuery } from "@apollo/client";
import { useSetTab } from "@zstack/zsphere-components";
import { DialogP0, DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { LeftNavType, NavView } from "@zstack/zsphere-types";
import type {
  Image as IImage,
  DeleteImagePayload as IDeleteImagePayload,
} from "@zstack/zsphere-types/graphql";
import { formatSecToPeriod } from "@zstack/zsphere-utils";
import { get, max } from "lodash-es";
import qs from "qs";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useNavigate, useLocation } from "react-router";

import style from "./style.module.less";

export type DeletionPolicy = "Direct" | "Delay" | "Never" | undefined;

const LINK_STYLE = {
  display: "inline-block",
  cursor: "pointer",
  color: "var(--color-600)",
} as const;

const GLOBAL_CONFIG = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
      uuid
      isValid
    }
  }
`;

const DeleteAction: React.FC<IActionWrapperProps<IImage>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const { setTabMultiple } = useSetTab();
  const doAction = useAction();
  const navigate = useNavigate();
  const location = useLocation();

  const [queryDeletionPolicy, { data: deletionPolicyData }] = useLazyQuery(
    GLOBAL_CONFIG,
    {
      variables: {
        category: "image",
        name: "deletionPolicy",
      },
      fetchPolicy: "network-only",
      nextFetchPolicy: "network-only",
    },
  );

  const [queryExpungeInterval, { data: expungeIntervalData }] = useLazyQuery(
    GLOBAL_CONFIG,
    {
      variables: {
        category: "image",
        name: "expungeInterval",
      },
      fetchPolicy: "network-only",
      nextFetchPolicy: "network-only",
    },
  );

  const [queryExpungePeriod, { data: expungePeriodData }] = useLazyQuery(
    GLOBAL_CONFIG,
    {
      variables: {
        category: "image",
        name: "expungePeriod",
      },
      fetchPolicy: "network-only",
      nextFetchPolicy: "network-only",
    },
  );

  useEffect(() => {
    if (visible) {
      queryDeletionPolicy();
      queryExpungeInterval();
      queryExpungePeriod();
    }
  }, [visible]);

  const deletionPolicy = useMemo(() => {
    const _deletionPolicy = deletionPolicyData?.globalConfig;
    const expungeInterval = expungeIntervalData?.globalConfig;
    const expungePeriod = expungePeriodData?.globalConfig;
    const time = formatSecToPeriod(
      Number(
        max([Number(expungeInterval?.value), Number(expungePeriod?.value)]),
      ),
      intl,
    );

    return {
      policy: get(_deletionPolicy, "value") as DeletionPolicy,
      time,
    };
  }, [deletionPolicyData, expungeIntervalData, expungePeriodData, intl]);

  const title = useMemo(() => {
    if (deletionPolicy?.policy === "Direct") {
      return intl.formatMessage({
        id: "image.modal.title.confirm.delete.image.direct",
        defaultMessage: "Expunge Image?",
      });
    }
    return intl.formatMessage({
      id: "image.modal.title.confirm.delete.image.delay",
      defaultMessage: "Move Image to Recycle Bin?",
    });
  }, [deletionPolicy, intl]);

  const doActionName = useMemo(() => {
    if (deletionPolicy?.policy !== "Direct") {
      return intl.formatMessage({
        id: "delete.image.delay",
        defaultMessage: "Move Image to Recycle Bin",
      });
    }
    return intl.formatMessage({
      id: "expunge.image",
      defaultMessage: "Expunge Image",
    });
  }, [deletionPolicy, intl]);

  const bannerMessage = useMemo(() => {
    // 直接删除
    if (deletionPolicy?.policy === "Direct") {
      return (
        <span>
          {intl.formatMessage(
            {
              id: "image.action.direct.delete.alert.error",
              defaultMessage: `This action will immediately and completely delete the image, and the image {warningText}. Proceed with caution.`,
            },
            {
              warningText: (
                <span className={style.warningText}>
                  {intl.formatMessage({
                    id: "image.action.direct.delete.warningText",
                    defaultMessage: "cannot be recovered",
                  })}
                </span>
              ),
            },
          )}
        </span>
      );
    }
    // 延时删除
    if (deletionPolicy?.policy === "Delay") {
      return (
        <ReactMarkdown>
          {intl.formatMessage(
            {
              id: "image.action.delay.delete.alert.error",
              defaultMessage: `The system will move the image to the recycle bin and completely delete the image after {time}.`,
            },
            {
              time: deletionPolicy?.time,
            },
          )}
        </ReactMarkdown>
      );
    }
    // 永不删除
    if (deletionPolicy?.policy === "Never") {
      return (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "image.action.never.delete.alert.error",
            defaultMessage:
              "The system will move the image to the recycle bin, but it will not automatically delete this image.",
          })}
        </ReactMarkdown>
      );
    }
  }, [deletionPolicy, intl]);

  const deleteImage = gql`
    mutation deleteImage($input: DeleteImageInput!) {
      deleteImage(input: $input) {
        actionId
      }
    }
  `;

  const successMessage = useMemo(() => {
    let result: string | React.ReactNode;
    const { search } = location;
    const searchObj = qs.parse(search, { ignoreQueryPrefix: true });
    const leftNav = searchObj?.leftnav || LeftNavType.ClusterHost;
    const navView = searchObj?.navView || NavView.Resource;
    const url = `/virtualization-resource/root-node/detail?uuid=-1&leftnav=${leftNav}&navView=${navView}`;
    if (deletionPolicy?.policy !== "Direct") {
      result = intl.formatMessage(
        {
          id: "image.delay.delete.success.message",
          defaultMessage: "The image has been moved to the recycle bin. Check the file in {m}.",
        },
        {
          m: (
            <a
              style={LINK_STYLE}
              href={url}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTabMultiple([
                  {
                    contentId: "main-tab",
                    newKey: "recycle",
                    newPath: "/root-node/detail",
                  },
                  {
                    contentId: "recycle",
                    newKey: "image",
                    newPath: "/root-node/detail",
                  },
                ]);
                navigate(url);
              }}
            >
              {intl.formatMessage({
                id: "recycleBin",
                defaultMessage: "Recycle Bin",
              })}
            </a>
          ),
        },
      );
    }
    return result;
  }, [deletionPolicy.policy, location, intl, selectedList]);

  const onOk = async () => {
    setSelectedList?.([]);
    const payload: IDeleteImagePayload[] = selectedList.map((item) => {
      return { uuid: item.uuid };
    });
    doAction({
      mutation: deleteImage,
      payload,
      name: doActionName,
      total: selectedList.length,
      type: "Image",
      successMessage,

      onFinish: () => {
        const searchParams = new URLSearchParams(location.search);
        if (
          location.pathname?.includes("image/detail") &&
          !searchParams.get("leftnav")
        ) {
          navigate(-1);
        }
      },
    });
  };

  if (deletionPolicy?.policy === "Direct") {
    return (
      <DialogP0
        title={title}
        resourceType={intl.formatMessage({
          id: "image",
          defaultMessage: "Image",
        })}
        bannerMessage={bannerMessage}
        resourceNames={(selectedList || []).map(
          (item) => item.name ?? item.uuid,
        )}
        visible={visible}
        setVisible={setVisible}
        onConfirm={onOk}
      />
    );
  }

  return (
    <DialogP3
      title={title}
      resourceType={intl.formatMessage({
        id: "image",
        defaultMessage: "Image",
      })}
      bannerMessage={bannerMessage}
      resourceNames={(selectedList || []).map((item) => item.name ?? item.uuid)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default DeleteAction;
